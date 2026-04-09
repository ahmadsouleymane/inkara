import { Router } from 'express';
import { getBooks, getBookById, getBookByIsbn, addBook, updateBook, deleteBook, getBookStats, getRecommendations, importBooksFromCsv, bulkUpdate, bulkDelete, bulkCategoryChange } from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';
import { upload, uploadCsv } from '../middleware/upload.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getBooks);
router.get('/stats', protect(), tenantIsolation, getBookStats);
router.get('/recommendations', protect(), tenantIsolation, getRecommendations);
router.get('/isbn/:isbn', protect(), tenantIsolation, getBookByIsbn);
router.post('/import-csv', protect(['admin']), tenantIsolation, uploadCsv.single('file'), importBooksFromCsv);
router.put('/bulk/update', protect(['admin']), tenantIsolation, bulkUpdate);
router.delete('/bulk/delete', protect(['admin']), tenantIsolation, bulkDelete);
router.put('/bulk/category', protect(['admin']), tenantIsolation, bulkCategoryChange);
router.get('/:id', protect(), tenantIsolation, getBookById);
router.post('/', protect(['admin', 'librarian']), tenantIsolation, upload.single('cover'), addBook);
router.put('/:id', protect(['admin', 'librarian']), tenantIsolation, upload.single('cover'), updateBook);
router.delete('/:id', protect(['admin']), tenantIsolation, deleteBook);

export default router;
