import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllOrganizations,
  updateOrganizationPlan,
  suspendOrganization,
} from '../controllers/superadmin.controller.js';

const router = Router();

router.get('/', protect(['superadmin']), getDashboardStats);
router.get('/organizations', protect(['superadmin']), getAllOrganizations);
router.put('/organizations/:id/plan', protect(['superadmin']), updateOrganizationPlan);
router.put('/organizations/:id/suspend', protect(['superadmin']), suspendOrganization);

export default router;
