import { Router } from 'express';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getMyNotifications);
router.put('/read-all', protect(), tenantIsolation, markAllRead);
router.put('/:id/read', protect(), tenantIsolation, markRead);

export default router;
