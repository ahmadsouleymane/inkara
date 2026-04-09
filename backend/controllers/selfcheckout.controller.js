import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import Notification from '../models/Notification.js';
import Reservation from '../models/Reservation.js';
import Organization from '../models/Organization.js';

const FINE_PER_DAY = 500;

// POST /api/selfcheckout/identify — Identifier un membre par scan QR
export const identifyMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ _id: userId, organizationId: req.organizationId });
    if (!user) return res.status(404).json({ message: 'Membre introuvable.' });

    const activeLoans = await Loan.find({
      user: user._id,
      organizationId: req.organizationId,
      status: { $in: ['borrowed', 'late'] },
    }).populate('book', 'title author cover isbn');

    res.json({
      user: { _id: user._id, fullName: user.fullName, email: user.email, membershipId: user.membershipId },
      activeLoans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/selfcheckout/borrow — Emprunt en libre-service
export const selfBorrow = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const user = await User.findOne({ _id: userId, organizationId: req.organizationId });
    if (!user) return res.status(404).json({ message: 'Membre introuvable.' });

    const book = await Book.findOne({ _id: bookId, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'Aucun exemplaire disponible.' });

    const org = await Organization.findById(req.organizationId);
    const maxLoans = org?.loanSettings?.maxLoansPerUser || 3;
    const loanDuration = org?.loanSettings?.loanDurationDays || 14;

    const activeCount = await Loan.countDocuments({ user: userId, organizationId: req.organizationId, status: { $in: ['borrowed', 'late'] } });
    if (activeCount >= maxLoans) {
      return res.status(400).json({ message: `Nombre maximum d'emprunts atteint (${maxLoans}).` });
    }

    const existing = await Loan.findOne({ user: userId, book: bookId, organizationId: req.organizationId, status: { $in: ['borrowed', 'late'] } });
    if (existing) return res.status(400).json({ message: 'Ce livre est déjà emprunté.' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDuration);

    const loan = await Loan.create({
      user: userId,
      book: bookId,
      organizationId: req.organizationId,
      dueDate,
      performedBy: userId, // Self-checkout: l'utilisateur fait l'opération
    });

    book.availableCopies -= 1;
    await book.save();

    await loan.populate(['user', 'book']);
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/selfcheckout/return — Retour en libre-service
export const selfReturn = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const loan = await Loan.findOne({
      user: userId,
      book: bookId,
      organizationId: req.organizationId,
      status: { $in: ['borrowed', 'late'] },
    }).populate('book');

    if (!loan) return res.status(404).json({ message: 'Aucun emprunt actif trouvé pour ce livre.' });

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
    loan.returnedBy = userId;
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
