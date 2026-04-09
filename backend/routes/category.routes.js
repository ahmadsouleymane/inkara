import { Router } from 'express';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getCategories);
router.post('/', protect(['admin']), tenantIsolation, addCategory);
router.put('/:id', protect(['admin']), tenantIsolation, updateCategory);
router.delete('/:id', protect(['admin']), tenantIsolation, deleteCategory);

export default router;
