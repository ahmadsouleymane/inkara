import { Router } from 'express';
import { createReservation, cancelReservation, getMyReservations, getBookQueue, getAllReservations } from '../controllers/reservation.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.post('/', protect(), tenantIsolation, createReservation);
router.delete('/:id', protect(), tenantIsolation, cancelReservation);
router.get('/me', protect(), tenantIsolation, getMyReservations);
router.get('/book/:bookId', protect(['admin', 'librarian']), tenantIsolation, getBookQueue);
router.get('/', protect(['admin', 'librarian']), tenantIsolation, getAllReservations);

export default router;
