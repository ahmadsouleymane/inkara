import { Router } from 'express';
import { borrowBook, returnBook, renewLoan, returnByUserAndIsbn, getAllLoans, getUserLoans, getDashboardStats } from '../controllers/loan.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/borrow', protect(['admin', 'librarian']), tenantIsolation, borrowBook);
router.put('/:id/return', protect(['admin', 'librarian']), tenantIsolation, returnBook);
router.put('/:id/renew', protect(['admin', 'librarian']), tenantIsolation, renewLoan);
router.post('/return-by-scan', protect(['admin', 'librarian']), tenantIsolation, returnByUserAndIsbn);
router.get('/dashboard-stats', protect(['admin', 'librarian']), tenantIsolation, getDashboardStats);
router.get('/user/:userId', protect(), tenantIsolation, getUserLoans);
router.get('/', protect(['admin', 'librarian']), tenantIsolation, getAllLoans);

export default router;
