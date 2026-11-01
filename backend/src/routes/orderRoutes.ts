import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
} from '../middlewares/authMiddleware.js';

const router = Router();

// Customer creates an order (handles logged in user or guest checkout)
router.post('/', optionalAuthenticate, createOrder);

// Authenticated user gets their purchase history
router.get('/my-orders', authenticate, getMyOrders);

// Admin lists all orders with search/filtering
router.get('/admin', authenticate, authorizeRoles('admin', 'superadmin'), getAdminOrders);

// Get single order details
router.get('/:id', optionalAuthenticate, getOrderById);

// Admin updates order status
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'superadmin'), updateOrderStatus);

export default router;

