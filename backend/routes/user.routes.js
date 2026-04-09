import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser, createUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(['admin']), tenantIsolation, getAllUsers);
router.post('/', protect(['admin']), tenantIsolation, createUser);
router.get('/:id', protect(), tenantIsolation, getUserById);
router.put('/:id/role', protect(['admin']), tenantIsolation, updateUserRole);
router.delete('/:id', protect(['admin']), tenantIsolation, deleteUser);

export default router;
