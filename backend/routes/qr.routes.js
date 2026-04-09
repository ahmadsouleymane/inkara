import { Router } from 'express';
import { generateBookQR, generateBatchQR, generateQRLabelsPdf, scanBook, generateAllMissingQR } from '../controllers/qr.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Génération QR (admin/librarian)
router.post('/book/:bookId', protect(['admin', 'librarian']), tenantIsolation, generateBookQR);
router.post('/books/batch', protect(['admin', 'librarian']), tenantIsolation, generateBatchQR);
router.post('/books/generate-all', protect(['admin', 'librarian']), tenantIsolation, generateAllMissingQR);
router.get('/books/pdf', protect(['admin', 'librarian']), tenantIsolation, generateQRLabelsPdf);

// Scan (authentifié — utilisé par le kiosque et les bibliothécaires)
router.get('/scan/book/:bookId', protect(), tenantIsolation, scanBook);

export default router;
