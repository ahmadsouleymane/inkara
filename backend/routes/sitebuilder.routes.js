import { Router } from 'express';
import {
  getPages, getPage, createPage, updatePage, deletePage, reorderPages,
  getTheme, updateTheme,
  getPublicPages, getPublicPage, getPublicTheme,
} from '../controllers/sitebuilder.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Admin — gestion des pages
router.get('/pages', protect(['admin', 'owner']), tenantIsolation, getPages);
router.get('/pages/:slug', protect(['admin', 'owner']), tenantIsolation, getPage);
router.post('/pages', protect(['admin', 'owner']), tenantIsolation, createPage);
router.put('/pages/reorder', protect(['admin', 'owner']), tenantIsolation, reorderPages);
router.put('/pages/:slug', protect(['admin', 'owner']), tenantIsolation, updatePage);
router.delete('/pages/:slug', protect(['admin', 'owner']), tenantIsolation, deletePage);

// Admin — thème
router.get('/theme', protect(['admin', 'owner']), tenantIsolation, getTheme);
router.put('/theme', protect(['admin', 'owner']), tenantIsolation, updateTheme);

export default router;
