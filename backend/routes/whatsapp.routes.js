import { Router } from 'express';
import { initWhatsApp, getWhatsAppStatus, disconnectWhatsApp, sendTestMessage } from '../controllers/whatsapp.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/init', protect(['admin', 'owner']), tenantIsolation, initWhatsApp);
router.get('/status', protect(['admin', 'owner']), tenantIsolation, getWhatsAppStatus);
router.post('/disconnect', protect(['admin', 'owner']), tenantIsolation, disconnectWhatsApp);
router.post('/send', protect(['admin', 'owner']), tenantIsolation, sendTestMessage);

export default router;
