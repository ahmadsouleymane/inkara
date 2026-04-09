import { Router } from 'express';
import { getEvents, addEvent, deleteEvent, registerForEvent, unregisterFromEvent, getRegistrations } from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getEvents);
router.post('/', protect(['admin']), tenantIsolation, upload.single('poster'), addEvent);
router.delete('/:id', protect(['admin']), tenantIsolation, deleteEvent);
router.post('/:id/register', protect(), tenantIsolation, registerForEvent);
router.delete('/:id/register', protect(), tenantIsolation, unregisterFromEvent);
router.get('/:id/registrations', protect(['admin']), tenantIsolation, getRegistrations);

export default router;
