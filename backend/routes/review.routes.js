import { Router } from 'express';
import { upsertReview, getBookReviews, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/', protect(), tenantIsolation, upsertReview);
router.get('/book/:bookId', protect(), tenantIsolation, getBookReviews);
router.delete('/:id', protect(), tenantIsolation, deleteReview);

export default router;
