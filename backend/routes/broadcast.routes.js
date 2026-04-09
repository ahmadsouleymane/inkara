import { Router } from 'express';
import { sendBroadcast, getAudienceCount } from '../controllers/broadcast.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/', protect(['admin', 'owner']), tenantIsolation, sendBroadcast);
router.get('/audience-count', protect(['admin', 'owner']), tenantIsolation, getAudienceCount);

export default router;
