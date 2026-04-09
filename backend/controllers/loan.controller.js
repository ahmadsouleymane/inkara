import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Fine from '../models/Fine.js';
import Notification from '../models/Notification.js';
import Reservation from '../models/Reservation.js';
import Organization from '../models/Organization.js';

const getLoanDuration = async (organizationId) => {
  const org = await Organization.findById(organizationId);
  return org?.loanSettings?.loanDurationDays || 14;
};

const getMaxLoans = async (organizationId) => {
  const org = await Organization.findById(organizationId);
  return org?.loanSettings?.maxLoansPerUser || 3;
};

const FINE_PER_DAY = 500; // Montant de l'amende par jour de retard

// POST /api/loans/borrow
export const borrowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const book = await Book.findOne({ _id: bookId, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'Aucun exemplaire disponible.' });

    const maxLoans = await getMaxLoans(req.organizationId);
    const activeLoans = await Loan.countDocuments({ user: userId, organizationId: req.organizationId, status: { $in: ['borrowed', 'late'] } });
    if (activeLoans >= maxLoans) {
      return res.status(400).json({ message: `Nombre maximum d'emprunts atteint (${maxLoans}).` });
    }

    const existingLoan = await Loan.findOne({ user: userId, book: bookId, organizationId: req.organizationId, status: { $in: ['borrowed', 'late'] } });
    if (existingLoan) return res.status(400).json({ message: 'Ce livre est déjà emprunté par cet utilisateur.' });

    // Décrémenter atomiquement — empêche availableCopies de devenir négatif
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, organizationId: req.organizationId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!updatedBook) return res.status(400).json({ message: 'Aucun exemplaire disponible.' });

    const loanDuration = await getLoanDuration(req.organizationId);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDuration);

    const loan = await Loan.create({ user: userId, book: bookId, organizationId: req.organizationId, dueDate, performedBy: req.user._id });

    await loan.populate(['user', 'book']);
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/loans/:id/return
export const returnBook = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate('book');
    if (!loan) return res.status(404).json({ message: 'Emprunt introuvable.' });
    if (loan.status === 'returned') return res.status(400).json({ message: 'Ce livre a déjà été retourné.' });

    // Calcul de l'amende si en retard
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    let fine = null;

    if (now > dueDate) {
      const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      const amount = daysLate * FINE_PER_DAY;

      fine = await Fine.create({
        loan: loan._id,
        user: loan.user,
        organizationId: req.organizationId,
        amount,
        daysLate,
        reason: `Retard de ${daysLate} jour(s) pour "${loan.book.title}"`,
      });

      await Notification.create({
        user: loan.user,
        organizationId: req.organizationId,
        type: 'fine_created',
        message: `Amende de ${amount} pour retard de ${daysLate} jour(s) sur "${loan.book.title}".`,
      });
    }

    loan.status = 'returned';
    loan.returnDate = now;
    loan.returnedBy = req.user._id;
    await loan.save();

    await Book.findByIdAndUpdate(loan.book._id, { $inc: { availableCopies: 1 } });

    // Vérifier les réservations en attente
    const nextReservation = await Reservation.findOne({ book: loan.book._id, organizationId: req.organizationId, status: 'pending' }).sort({ createdAt: 1 });
    if (nextReservation) {
      nextReservation.status = 'available';
      nextReservation.notifiedAt = new Date();
      await nextReservation.save();

      await Notification.create({
        user: nextReservation.user,
        organizationId: req.organizationId,
        type: 'reservation_available',
        message: `Le livre "${loan.book.title}" est maintenant disponible pour vous.`,
      });
    }

    await loan.populate(['user', 'book']);
    res.json({ loan, fine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/loans/:id/renew
export const renewLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!loan) return res.status(404).json({ message: 'Emprunt introuvable.' });
    if (loan.status === 'returned') return res.status(400).json({ message: 'Impossible de renouveler un livre retourné.' });
    if (loan.renewCount >= 2) return res.status(400).json({ message: 'Nombre maximum de renouvellements atteint (2).' });

    const loanDuration = await getLoanDuration(req.organizationId);
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + loanDuration);

    loan.dueDate = newDueDate;
    loan.renewCount += 1;
    if (loan.status === 'late') loan.status = 'borrowed';
    await loan.save();

    await loan.populate(['user', 'book']);
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/loans/return-by-scan — Retour par ISBN
export const returnByUserAndIsbn = async (req, res) => {
  try {
    const { userId, isbn } = req.body;
    const book = await Book.findOne({ isbn, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });

    const loan = await Loan.findOne({ user: userId, book: book._id, organizationId: req.organizationId, status: { $in: ['borrowed', 'late'] } });
    if (!loan) return res.status(404).json({ message: 'Aucun emprunt actif trouvé.' });

    // Réutiliser la logique du retour
    req.params.id = loan._id;
    return returnBook(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/loans
export const getAllLoans = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };
    if (status) query.status = status;

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('user', 'fullName email')
      .populate('book', 'title author isbn cover')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ loans, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/loans/user/:userId
export const getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.params.userId, organizationId: req.organizationId })
      .populate('book', 'title author isbn cover')
      .sort({ createdAt: -1 });

    // Marquer automatiquement les retards
    for (const loan of loans) {
      if (loan.status === 'borrowed' && new Date() > new Date(loan.dueDate)) {
        loan.status = 'late';
        await loan.save();
      }
    }

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/loans/dashboard-stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const orgFilter = { organizationId: req.organizationId };
    const dueToday = await Loan.countDocuments({ ...orgFilter, status: 'borrowed', dueDate: { $lte: today, $gte: todayStart } });
    const overdue = await Loan.countDocuments({ ...orgFilter, status: 'late' });
    const activeLoans = await Loan.countDocuments({ ...orgFilter, status: { $in: ['borrowed', 'late'] } });
    const todayLoans = await Loan.countDocuments({ ...orgFilter, borrowDate: { $gte: todayStart } });

    res.json({ dueToday, overdue, activeLoans, todayLoans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
