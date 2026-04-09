import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(['admin']), tenantIsolation, getAuditLogs);

export default router;
