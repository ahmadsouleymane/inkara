import UserBadge from '../models/Badge.js';
import Loan from '../models/Loan.js';
import Review from '../models/Review.js';
import Event from '../models/Event.js';
import ReadingList from '../models/ReadingList.js';
import User from '../models/User.js';

const BADGE_META = {
  first_loan:      { label: 'Premier Emprunt', description: 'Votre premier livre emprunté', icon: '📖', color: '#10b981' },
  bookworm_10:     { label: 'Lecteur Assidu', description: '10 livres empruntés', icon: '📚', color: '#3b82f6' },
  bookworm_50:     { label: 'Dévoreur de Livres', description: '50 livres empruntés', icon: '🏆', color: '#f59e0b' },
  bookworm_100:    { label: 'Légende Littéraire', description: '100 livres empruntés', icon: '👑', color: '#8b5cf6' },
  speed_reader:    { label: 'Lecteur Express', description: '5 livres en un mois', icon: '⚡', color: '#ec4899' },
  genre_explorer:  { label: 'Explorateur', description: '5 catégories différentes lues', icon: '🧭', color: '#14b8a6' },
  early_bird:      { label: 'Ponctuel', description: '10 retours avant échéance', icon: '⏰', color: '#6366f1' },
  event_goer:      { label: 'Événementiel', description: '5 événements rejoints', icon: '🎪', color: '#f97316' },
  reviewer:        { label: 'Critique Littéraire', description: '10 avis rédigés', icon: '✍️', color: '#06b6d4' },
  list_curator:    { label: 'Curateur', description: '3 listes de lecture créées', icon: '📋', color: '#84cc16' },
  loyal_member:    { label: 'Membre Fidèle', description: 'Membre depuis 1 an', icon: '💎', color: '#a855f7' },
  perfect_record:  { label: 'Sans Faute', description: 'Aucun retard sur 20+ emprunts', icon: '🌟', color: '#eab308' },
};

// GET /api/gamification/badges — Liste des badges de l'utilisateur
export const getMyBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.user._id, organizationId: req.organizationId });
    const result = badges.map(b => ({
      ...b.toObject(),
      meta: BADGE_META[b.badge],
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/gamification/badges/:userId — Badges d'un utilisateur (admin)
export const getUserBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.params.userId, organizationId: req.organizationId });
    const result = badges.map(b => ({
      ...b.toObject(),
      meta: BADGE_META[b.badge],
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/gamification/all-badges — Liste de tous les badges possibles
export const getAllBadges = async (req, res) => {
  try {
    const earned = await UserBadge.find({ user: req.user._id, organizationId: req.organizationId });
    const earnedSet = new Set(earned.map(b => b.badge));

    const allBadges = Object.entries(BADGE_META).map(([key, meta]) => ({
      badge: key,
      ...meta,
      earned: earnedSet.has(key),
      awardedAt: earned.find(b => b.badge === key)?.awardedAt || null,
    }));

    res.json(allBadges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/gamification/progress — Progression vers les badges
export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const orgId = req.organizationId;

    const totalLoans = await Loan.countDocuments({ user: userId, organizationId: orgId });
    const returnedLoans = await Loan.countDocuments({ user: userId, organizationId: orgId, status: 'returned' });
    const lateLoans = await Loan.countDocuments({ user: userId, organizationId: orgId, status: 'late' });
    const reviews = await Review.countDocuments({ user: userId, organizationId: orgId });
    const lists = await ReadingList.countDocuments({ createdBy: userId, organizationId: orgId });

    // Catégories différentes
    const categories = await Loan.distinct('book', { user: userId, organizationId: orgId });

    // Retours en avance
    const earlyReturns = await Loan.countDocuments({
      user: userId, organizationId: orgId, status: 'returned',
      $expr: { $lt: ['$returnDate', '$dueDate'] },
    });

    // Livres ce mois
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const loansThisMonth = await Loan.countDocuments({ user: userId, organizationId: orgId, createdAt: { $gte: monthStart } });

    // Événements
    const eventsJoined = await Event.countDocuments({ organizationId: orgId, registrations: userId });

    // Ancienneté
    const user = await User.findById(userId);
    const memberSince = user?.createdAt || new Date();
    const daysMember = Math.floor((Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24));

    res.json({
      totalLoans,
      returnedLoans,
      lateLoans,
      reviews,
      lists,
      earlyReturns,
      loansThisMonth,
      eventsJoined,
      daysMember,
      progress: {
        first_loan: { current: totalLoans, target: 1 },
        bookworm_10: { current: totalLoans, target: 10 },
        bookworm_50: { current: totalLoans, target: 50 },
        bookworm_100: { current: totalLoans, target: 100 },
        speed_reader: { current: loansThisMonth, target: 5 },
        early_bird: { current: earlyReturns, target: 10 },
        event_goer: { current: eventsJoined, target: 5 },
        reviewer: { current: reviews, target: 10 },
        list_curator: { current: lists, target: 3 },
        loyal_member: { current: daysMember, target: 365 },
        perfect_record: { current: totalLoans >= 20 && lateLoans === 0 ? 1 : 0, target: 1 },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/gamification/check — Vérifier et attribuer les badges
export const checkAndAwardBadges = async (userId, orgId) => {
  try {
    const totalLoans = await Loan.countDocuments({ user: userId, organizationId: orgId });
    const lateLoans = await Loan.countDocuments({ user: userId, organizationId: orgId, status: 'late' });
    const reviews = await Review.countDocuments({ user: userId, organizationId: orgId });
    const lists = await ReadingList.countDocuments({ createdBy: userId, organizationId: orgId });
    const eventsJoined = await Event.countDocuments({ organizationId: orgId, registrations: userId });

    const earlyReturns = await Loan.countDocuments({
      user: userId, organizationId: orgId, status: 'returned',
      $expr: { $lt: ['$returnDate', '$dueDate'] },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const loansThisMonth = await Loan.countDocuments({ user: userId, organizationId: orgId, createdAt: { $gte: monthStart } });

    const user = await User.findById(userId);
    const daysMember = Math.floor((Date.now() - new Date(user?.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    const checks = [
      { badge: 'first_loan', condition: totalLoans >= 1 },
      { badge: 'bookworm_10', condition: totalLoans >= 10 },
      { badge: 'bookworm_50', condition: totalLoans >= 50 },
      { badge: 'bookworm_100', condition: totalLoans >= 100 },
      { badge: 'speed_reader', condition: loansThisMonth >= 5 },
      { badge: 'early_bird', condition: earlyReturns >= 10 },
      { badge: 'event_goer', condition: eventsJoined >= 5 },
      { badge: 'reviewer', condition: reviews >= 10 },
      { badge: 'list_curator', condition: lists >= 3 },
      { badge: 'loyal_member', condition: daysMember >= 365 },
      { badge: 'perfect_record', condition: totalLoans >= 20 && lateLoans === 0 },
    ];

    const newBadges = [];
    for (const { badge, condition } of checks) {
      if (condition) {
        const exists = await UserBadge.findOne({ user: userId, organizationId: orgId, badge });
        if (!exists) {
          await UserBadge.create({ user: userId, organizationId: orgId, badge });
          newBadges.push(badge);
        }
      }
    }

    return newBadges;
  } catch (error) {
    console.error('[Gamification] Erreur:', error.message);
    return [];
  }
};
