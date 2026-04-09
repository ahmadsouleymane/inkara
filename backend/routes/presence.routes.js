import { Router } from 'express';
import { checkIn, checkOut, getTodayPresence, getPresenceHistory } from '../controllers/presence.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/checkin', protect(['admin', 'librarian']), tenantIsolation, checkIn);
router.put('/:id/checkout', protect(['admin', 'librarian']), tenantIsolation, checkOut);
router.get('/today', protect(['admin', 'librarian']), tenantIsolation, getTodayPresence);
router.get('/history', protect(['admin', 'librarian']), tenantIsolation, getPresenceHistory);

export default router;
