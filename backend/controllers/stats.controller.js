import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Fine from '../models/Fine.js';
import Presence from '../models/Presence.js';

// GET /api/stats
export const getDashboardStats = async (req, res) => {
  try {
    const orgFilter = { organizationId: req.organizationId };
    const totalUsers = await User.countDocuments(orgFilter);
    const totalBooks = await Book.countDocuments(orgFilter);
    const totalLoans = await Loan.countDocuments(orgFilter);
    const activeLoans = await Loan.countDocuments({ ...orgFilter, status: { $in: ['borrowed', 'late'] } });
    const lateLoans = await Loan.countDocuments({ ...orgFilter, status: 'late' });
    const returnedLoans = await Loan.countDocuments({ ...orgFilter, status: 'returned' });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orgMatch = { $match: { organizationId: req.organizationId } };

    const monthlyLoans = await Loan.aggregate([
      { $match: { organizationId: req.organizationId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const popularBooks = await Loan.aggregate([
      { $match: { organizationId: req.organizationId } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', author: '$book.author', count: 1 } },
    ]);

    const categoryDistribution = await Book.aggregate([
      { $match: { organizationId: req.organizationId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentLoans = await Loan.find(orgFilter)
      .populate('user', 'fullName')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Répartition des rôles
    const roleDistribution = await User.aggregate([
      { $match: { organizationId: req.organizationId } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers, totalBooks, totalLoans, activeLoans, lateLoans, returnedLoans,
      monthlyLoans, popularBooks, categoryDistribution, recentLoans, roleDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/export — Export Excel
export const exportData = async (req, res) => {
  try {
    const ExcelJS = (await import('exceljs')).default;
    const { type = 'loans' } = req.query;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Export');

    if (type === 'loans') {
      sheet.columns = [
        { header: 'Membre', key: 'user', width: 25 },
        { header: 'Livre', key: 'book', width: 30 },
        { header: 'Date emprunt', key: 'borrowDate', width: 15 },
        { header: 'Échéance', key: 'dueDate', width: 15 },
        { header: 'Statut', key: 'status', width: 12 },
      ];
      const loans = await Loan.find({ organizationId: req.organizationId }).populate('user', 'fullName').populate('book', 'title');
      loans.forEach(l => {
        sheet.addRow({
          user: l.user?.fullName || '—',
          book: l.book?.title || '—',
          borrowDate: l.borrowDate?.toLocaleDateString('fr-FR'),
          dueDate: l.dueDate?.toLocaleDateString('fr-FR'),
          status: l.status,
        });
      });
    } else if (type === 'users') {
      sheet.columns = [
        { header: 'Nom', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Rôle', key: 'role', width: 15 },
        { header: 'Inscrit le', key: 'createdAt', width: 15 },
      ];
      const users = await User.find({ organizationId: req.organizationId });
      users.forEach(u => {
        sheet.addRow({ fullName: u.fullName, email: u.email, role: u.role, createdAt: u.createdAt?.toLocaleDateString('fr-FR') });
      });
    } else if (type === 'books') {
      sheet.columns = [
        { header: 'Titre', key: 'title', width: 30 },
        { header: 'Auteur', key: 'author', width: 25 },
        { header: 'ISBN', key: 'isbn', width: 18 },
        { header: 'Catégorie', key: 'category', width: 15 },
        { header: 'Exemplaires', key: 'copies', width: 12 },
        { header: 'Disponibles', key: 'available', width: 12 },
      ];
      const books = await Book.find({ organizationId: req.organizationId });
      books.forEach(b => {
        sheet.addRow({ title: b.title, author: b.author?.join(', '), isbn: b.isbn, category: b.category, copies: b.copies, available: b.availableCopies });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=smartlib-${type}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/export-pdf — Export PDF
export const exportPdf = async (req, res) => {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const { type = 'loans' } = req.query;
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=smartlib-${type}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('SmartLib — Export', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Type : ${type}`, { align: 'center' });
    doc.moveDown(2);

    if (type === 'loans') {
      const loans = await Loan.find({ organizationId: req.organizationId }).populate('user', 'fullName').populate('book', 'title').sort({ createdAt: -1 }).limit(100);
      doc.fontSize(10);
      loans.forEach(l => {
        doc.text(`${l.user?.fullName || '—'} — ${l.book?.title || '—'} — ${l.status} — ${l.borrowDate?.toLocaleDateString('fr-FR')}`);
      });
    } else if (type === 'users') {
      const users = await User.find({ organizationId: req.organizationId }).sort({ createdAt: -1 }).limit(100);
      doc.fontSize(10);
      users.forEach(u => {
        doc.text(`${u.fullName} — ${u.email} — ${u.role}`);
      });
    } else if (type === 'books') {
      const books = await Book.find({ organizationId: req.organizationId }).sort({ title: 1 }).limit(100);
      doc.fontSize(10);
      books.forEach(b => {
        doc.text(`${b.title} — ${b.author?.join(', ')} — ${b.category} — ${b.availableCopies}/${b.copies} dispo.`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/kpis — Indicateurs de performance clés
export const getKPIs = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const orgFilter = { organizationId: orgId };

    const totalBooks = await Book.countDocuments(orgFilter);
    const totalCopies = await Book.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: null, total: { $sum: '$copies' }, available: { $sum: '$availableCopies' } } },
    ]);

    const copies = totalCopies[0] || { total: 0, available: 0 };
    const totalLoans = await Loan.countDocuments(orgFilter);
    const activeLoans = await Loan.countDocuments({ ...orgFilter, status: { $in: ['borrowed', 'late'] } });
    const lateLoans = await Loan.countDocuments({ ...orgFilter, status: 'late' });
    const returnedLoans = await Loan.countDocuments({ ...orgFilter, status: 'returned' });

    // Durée moyenne de prêt (en jours) — sur les emprunts retournés
    const avgDuration = await Loan.aggregate([
      { $match: { organizationId: orgId, status: 'returned', returnDate: { $ne: null } } },
      { $project: { duration: { $divide: [{ $subtract: ['$returnDate', '$borrowDate'] }, 1000 * 60 * 60 * 24] } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } },
    ]);

    // Taux de circulation (emprunts / exemplaires)
    const circulationRate = copies.total > 0 ? ((copies.total - copies.available) / copies.total * 100) : 0;
    // Taux de retard
    const lateRate = activeLoans > 0 ? (lateLoans / activeLoans * 100) : 0;
    // Ratio de rotation (total emprunts / total exemplaires)
    const turnoverRatio = copies.total > 0 ? (totalLoans / copies.total) : 0;

    // Amendes
    const fineStats = await Fine.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      totalBooks,
      totalCopies: copies.total,
      availableCopies: copies.available,
      totalLoans,
      activeLoans,
      lateLoans,
      returnedLoans,
      avgLoanDuration: Math.round((avgDuration[0]?.avg || 0) * 10) / 10,
      circulationRate: Math.round(circulationRate * 10) / 10,
      lateRate: Math.round(lateRate * 10) / 10,
      turnoverRatio: Math.round(turnoverRatio * 100) / 100,
      fines: fineStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/trends — Comparaisons mois par mois
export const getTrends = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const monthlyLoans = await Loan.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startDate } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        returned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyMembers = await User.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startDate } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Évolution en pourcentage
    const trends = monthlyLoans.map((m, i) => {
      const prev = i > 0 ? monthlyLoans[i - 1].total : m.total;
      return {
        ...m,
        evolution: prev > 0 ? Math.round(((m.total - prev) / prev) * 100) : 0,
      };
    });

    res.json({ loans: trends, members: monthlyMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/members — Statistiques des membres
export const getMemberStats = async (req, res) => {
  try {
    const orgId = req.organizationId;

    const totalMembers = await User.countDocuments({ organizationId: orgId });

    // Membres actifs (ayant emprunté dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeMembers = await Loan.distinct('user', { organizationId: orgId, createdAt: { $gte: thirtyDaysAgo } });

    // Top emprunteurs
    const topBorrowers = await Loan.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { fullName: '$user.fullName', email: '$user.email', count: 1 } },
    ]);

    // Croissance des membres par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const memberGrowth = await User.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalMembers,
      activeMembers: activeMembers.length,
      inactiveMembers: totalMembers - activeMembers.length,
      topBorrowers,
      memberGrowth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/collection — Analyse de la collection
export const getCollectionStats = async (req, res) => {
  try {
    const orgId = req.organizationId;

    // Distribution par catégorie
    const categoryDistribution = await Book.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalCopies: { $sum: '$copies' }, available: { $sum: '$availableCopies' } } },
      { $sort: { count: -1 } },
    ]);

    // Distribution par état
    const conditionDistribution = await Book.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Distribution par format
    const formatDistribution = await Book.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$format', count: { $sum: 1 } } },
    ]);

    // Analyse d'âge (par décennie de publication)
    const ageAnalysis = await Book.aggregate([
      { $match: { organizationId: orgId, year: { $ne: '' } } },
      { $project: { decade: { $concat: [{ $substr: ['$year', 0, 3] }, '0s'] } } },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Langues
    const languageDistribution = await Book.aggregate([
      { $match: { organizationId: orgId, language: { $ne: '' } } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ categoryDistribution, conditionDistribution, formatDistribution, ageAnalysis, languageDistribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stats/circulation — Heatmap d'activité
export const getCirculationStats = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Activité par jour de la semaine et heure
    const heatmap = await Loan.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { dayOfWeek: { $dayOfWeek: '$createdAt' }, hour: { $hour: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
    ]);

    // Activité par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyActivity = await Loan.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        loans: { $sum: 1 },
        returns: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Présences (30 derniers jours)
    const dailyPresence = await Presence.aggregate([
      { $match: { organizationId: orgId, checkIn: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ heatmap, dailyActivity, dailyPresence });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
