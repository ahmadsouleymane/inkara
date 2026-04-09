import { Router } from 'express';
import { getLibrary, updateLibrary } from '../controllers/library.controller.js';
import { protect } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', protect(), tenantIsolation, getLibrary);
router.put('/', protect(['admin']), tenantIsolation, upload.single('logo'), updateLibrary);

export default router;
