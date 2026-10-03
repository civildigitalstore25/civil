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
  toggleOutOfStock
} from '../controllers/productController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes for product viewing
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', authenticate, authorizeRoles('admin', 'superadmin'), createProduct);
router.put('/:id', authenticate, authorizeRoles('admin', 'superadmin'), updateProduct);
router.delete('/bulk', authenticate, authorizeRoles('admin', 'superadmin'), bulkDeleteProducts);
router.delete('/:id', authenticate, authorizeRoles('admin', 'superadmin'), deleteProduct);
router.patch('/:id/toggle-bestseller', authenticate, authorizeRoles('admin', 'superadmin'), toggleBestSeller);
router.patch('/:id/toggle-outofstock', authenticate, authorizeRoles('admin', 'superadmin'), toggleOutOfStock);

export default router;
