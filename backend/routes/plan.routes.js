import { Router } from 'express';
import { getCurrentPlan, comparePlans, updatePlan } from '../controllers/plan.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(['admin', 'owner']), tenantIsolation, getCurrentPlan);
router.get('/compare', protect(['admin', 'owner']), tenantIsolation, comparePlans);
router.put('/', protect(['superadmin', 'owner']), tenantIsolation, updatePlan);

export default router;
