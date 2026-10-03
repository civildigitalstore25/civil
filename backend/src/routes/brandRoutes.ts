import { Router } from 'express';
import {
  addBrandCategory,
  createBrand,
  deleteBrand,
  deleteBrandCategory,
  getBrands,
} from '../controllers/brandController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getBrands);
router.post('/', authenticate, authorizeRoles('admin', 'superadmin'), createBrand);
router.post('/:id/categories', authenticate, authorizeRoles('admin', 'superadmin'), addBrandCategory);
router.delete('/:id/categories/:slug', authenticate, authorizeRoles('admin', 'superadmin'), deleteBrandCategory);
router.delete('/:id', authenticate, authorizeRoles('admin', 'superadmin'), deleteBrand);

export default router;
