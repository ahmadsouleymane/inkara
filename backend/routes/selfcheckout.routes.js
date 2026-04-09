import { Router } from 'express';
import { identifyMember, selfBorrow, selfReturn } from '../controllers/selfcheckout.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/identify', protect(), tenantIsolation, identifyMember);
router.post('/borrow', protect(), tenantIsolation, selfBorrow);
router.post('/return', protect(), tenantIsolation, selfReturn);

export default router;
