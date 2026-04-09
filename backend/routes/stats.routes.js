import { Router } from 'express';
import { getDashboardStats, exportData, exportPdf, getKPIs, getTrends, getMemberStats, getCollectionStats, getCirculationStats } from '../controllers/stats.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', protect(['admin', 'librarian']), tenantIsolation, getDashboardStats);
router.get('/kpis', protect(['admin', 'librarian']), tenantIsolation, getKPIs);
router.get('/trends', protect(['admin', 'librarian']), tenantIsolation, getTrends);
router.get('/members', protect(['admin', 'librarian']), tenantIsolation, getMemberStats);
router.get('/collection', protect(['admin', 'librarian']), tenantIsolation, getCollectionStats);
router.get('/circulation', protect(['admin', 'librarian']), tenantIsolation, getCirculationStats);
router.get('/export', protect(['admin']), tenantIsolation, exportData);
router.get('/export-pdf', protect(['admin']), tenantIsolation, exportPdf);

export default router;
