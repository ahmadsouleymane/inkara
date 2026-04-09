import { Router } from 'express';
import {
  getReadingLists, getReadingList, createReadingList, updateReadingList,
  deleteReadingList, addBookToList, removeBookFromList,
} from '../controllers/readinglist.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getReadingLists);
router.get('/:id', protect(), tenantIsolation, getReadingList);
router.post('/', protect(['admin', 'owner', 'librarian']), tenantIsolation, createReadingList);
router.put('/:id', protect(['admin', 'owner', 'librarian']), tenantIsolation, updateReadingList);
router.delete('/:id', protect(['admin', 'owner']), tenantIsolation, deleteReadingList);
router.post('/:id/books/:bookId', protect(['admin', 'owner', 'librarian']), tenantIsolation, addBookToList);
router.delete('/:id/books/:bookId', protect(['admin', 'owner', 'librarian']), tenantIsolation, removeBookFromList);

export default router;
