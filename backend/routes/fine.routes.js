import { Router } from 'express';
import { getAllFines, getUserFines, payFine, createManualFine, deleteFine } from '../controllers/fine.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(['admin', 'librarian']), tenantIsolation, getAllFines);
router.get('/user/:userId', protect(['admin', 'librarian']), tenantIsolation, getUserFines);
router.put('/:id/pay', protect(['admin', 'librarian']), tenantIsolation, payFine);
router.post('/', protect(['admin', 'librarian']), tenantIsolation, createManualFine);
router.delete('/:id', protect(['admin']), tenantIsolation, deleteFine);

export default router;
