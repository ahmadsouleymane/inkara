import { Router } from 'express';
import { getMyBadges, getUserBadges, getAllBadges, getProgress } from '../controllers/gamification.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/badges', protect(), tenantIsolation, getMyBadges);
router.get('/badges/:userId', protect(['admin', 'librarian']), tenantIsolation, getUserBadges);
router.get('/all-badges', protect(), tenantIsolation, getAllBadges);
router.get('/progress', protect(), tenantIsolation, getProgress);

export default router;
