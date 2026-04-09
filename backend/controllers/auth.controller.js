import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Organization from '../models/Organization.js';
import { createDefaultPages } from './sitebuilder.controller.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
// Si libraryName est fourni → inscription owner (crée User + Organization)
// Sinon → inscription membre classique
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, department, libraryName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    if (libraryName) {
      // Inscription Owner : crée l'utilisateur + l'organisation
      const user = await User.create({ fullName, email, password, phone, department, role: 'owner' });

      const qrData = await QRCode.toDataURL(user._id.toString());
      user.qrCode = qrData;

      const org = await Organization.create({ name: libraryName, owner: user._id });
      user.organizationId = org._id;
      await user.save();

      // Créer les pages par défaut du site builder
      await createDefaultPages(org._id);

      const token = generateToken(user._id);
      return res.status(201).json({ user, token, organization: org, isNewOwner: true });
    }

    // Inscription membre classique
    const user = await User.create({ fullName, email, password, phone, department });

    const qrData = await QRCode.toDataURL(user._id.toString());
    user.qrCode = qrData;
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Identifiants incorrects.' });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites').populate('organizationId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/me
export const updateMe = async (req, res) => {
  try {
    const { fullName, phone, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, department },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.json({ message: 'Un lien de réinitialisation a été généré.', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré.' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== FAVORIS =====

// POST /api/auth/favorites/:bookId
export const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(req.params.bookId)) {
      return res.status(400).json({ message: 'Déjà dans les favoris.' });
    }
    user.favorites.push(req.params.bookId);
    await user.save();
    res.json({ message: 'Ajouté aux favoris.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/auth/favorites/:bookId
export const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.bookId);
    await user.save();
    res.json({ message: 'Retiré des favoris.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== PRÉFÉRENCES NOTIFICATIONS =====

// GET /api/auth/notification-preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.notificationPreferences || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/notification-preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { new: true, runValidators: true }
    );
    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== STATS UTILISATEUR =====

// GET /api/auth/stats/:userId
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Vérifier que l'utilisateur cible appartient à la même organisation
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    if (req.user.organizationId && targetUser.organizationId?.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const orgFilter = req.organizationId ? { organizationId: req.organizationId } : {};
    const totalLoans = await Loan.countDocuments({ user: userId, ...orgFilter });
    const activeLoans = await Loan.countDocuments({ user: userId, status: { $in: ['borrowed', 'late'] }, ...orgFilter });
    const returnedLoans = await Loan.countDocuments({ user: userId, status: 'returned', ...orgFilter });
    const lateLoans = await Loan.countDocuments({ user: userId, status: 'late', ...orgFilter });

    // Emprunts par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyLoans = await Loan.aggregate([
      { $match: { user: userObjectId, createdAt: { $gte: sixMonthsAgo }, ...(req.organizationId ? { organizationId: new mongoose.Types.ObjectId(req.organizationId) } : {}) } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ totalLoans, activeLoans, returnedLoans, lateLoans, monthlyLoans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
