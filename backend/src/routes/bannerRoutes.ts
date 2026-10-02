import { Router } from 'express';
import {
  createBanner,
  deleteBanner,
  getActiveBanners,
  getAllBanners,
  updateBanner,
} from '../controllers/bannerController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();
const admins = [authenticate, authorizeRoles('admin', 'superadmin')] as const;

router.get('/', getActiveBanners);
router.get('/manage', ...admins, getAllBanners);
router.post('/', ...admins, createBanner);
router.put('/:id', ...admins, updateBanner);
router.delete('/:id', ...admins, deleteBanner);

export default router;
