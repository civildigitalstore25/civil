import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  toggleBestSeller,
  toggleOutOfStock,
  incrementProductViewCount,
  getProductViewCount,
} from '../controllers/productController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes for product viewing
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.post('/:id/increment-view', incrementProductViewCount);
router.get('/:id/view-count', getProductViewCount);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', authenticate, authorizeRoles('admin', 'superadmin'), createProduct);
router.put('/:id', authenticate, authorizeRoles('admin', 'superadmin'), updateProduct);
router.delete('/bulk', authenticate, authorizeRoles('admin', 'superadmin'), bulkDeleteProducts);
router.delete('/:id', authenticate, authorizeRoles('admin', 'superadmin'), deleteProduct);
router.patch('/:id/toggle-bestseller', authenticate, authorizeRoles('admin', 'superadmin'), toggleBestSeller);
router.patch('/:id/toggle-outofstock', authenticate, authorizeRoles('admin', 'superadmin'), toggleOutOfStock);

export default router;
