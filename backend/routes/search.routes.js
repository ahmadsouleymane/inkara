import { Router } from 'express';
import { getSuggestions, searchBooks } from '../controllers/search.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/suggest', protect(), tenantIsolation, getSuggestions);
router.get('/', protect(), tenantIsolation, searchBooks);

export default router;
