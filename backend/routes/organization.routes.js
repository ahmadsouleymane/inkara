import { Router } from 'express';
import {
  getMyOrganization,
  updateOrganization,
  publishSite,
  unpublishSite,
  inviteMember,
  getMembers,
  updateMemberRole,
  removeMember,
  getPublicSite,
  getPublicBooks,
  getPublicEvents,
} from '../controllers/organization.controller.js';
import { getPublicPages, getPublicPage, getPublicTheme } from '../controllers/sitebuilder.controller.js';
import { getPublicReadingLists } from '../controllers/readinglist.controller.js';
import { getSitemap, getRobotsTxt, getPageMeta } from '../controllers/seo.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes — no auth
router.get('/public/:slug', getPublicSite);
router.get('/public/:slug/books', getPublicBooks);
router.get('/public/:slug/events', getPublicEvents);
router.get('/public/:slug/pages', getPublicPages);
router.get('/public/:slug/pages/:pageSlug', getPublicPage);
router.get('/public/:slug/theme', getPublicTheme);
router.get('/public/:slug/reading-lists', getPublicReadingLists);
router.get('/public/:slug/sitemap.xml', getSitemap);
router.get('/public/:slug/robots.txt', getRobotsTxt);
router.get('/public/:slug/meta', getPageMeta);
router.get('/public/:slug/meta/:pageSlug', getPageMeta);

// Protected routes — owner/admin
router.get('/', protect(['owner', 'admin', 'superadmin']), getMyOrganization);
router.put('/', protect(['owner', 'admin', 'superadmin']), upload.single('logo'), updateOrganization);
router.put('/publish', protect(['owner', 'admin', 'superadmin']), publishSite);
router.put('/unpublish', protect(['owner', 'admin', 'superadmin']), unpublishSite);
router.post('/invite', protect(['owner', 'admin', 'superadmin']), inviteMember);
router.get('/members', protect(['owner', 'admin', 'librarian', 'superadmin']), tenantIsolation, getMembers);
router.put('/members/:userId/role', protect(['owner', 'admin', 'superadmin']), updateMemberRole);
router.delete('/members/:userId', protect(['owner', 'admin', 'superadmin']), removeMember);

export default router;
