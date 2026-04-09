import { Router } from 'express';
import { lookupISBN } from '../controllers/lookup.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/isbn/:isbn', protect(['admin', 'librarian']), lookupISBN);

export default router;
