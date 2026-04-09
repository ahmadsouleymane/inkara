import { Router } from 'express';
import { register, login, getMe, updateMe, forgotPassword, resetPassword, addFavorite, removeFavorite, getFavorites, getUserStats, getNotificationPreferences, updateNotificationPreferences } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect(), getMe);
router.put('/me', protect(), updateMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Favoris
router.get('/favorites', protect(), getFavorites);
router.post('/favorites/:bookId', protect(), addFavorite);
router.delete('/favorites/:bookId', protect(), removeFavorite);

// Notification preferences
router.get('/notification-preferences', protect(), getNotificationPreferences);
router.put('/notification-preferences', protect(), updateNotificationPreferences);

// Stats utilisateur
router.get('/stats/:userId', protect(), getUserStats);

export default router;
