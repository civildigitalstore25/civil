import { Router } from 'express';
import {
  getPhonePePaymentStatus,
  initiatePhonePePayment,
  listAdminOrders,
  listMyOrders,
  phonePeWebhook,
  updateAdminOrderStatus,
} from '../controllers/paymentController.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/phonepe/initiate', optionalAuthenticate, initiatePhonePePayment);
router.get('/phonepe/status/:merchantOrderId', getPhonePePaymentStatus);
router.post('/phonepe/webhook', phonePeWebhook);
router.get('/orders/mine', authenticate, listMyOrders);
router.get('/orders', authenticate, authorizeRoles('admin', 'superadmin'), listAdminOrders);
router.patch(
  '/orders/:merchantOrderId/status',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  updateAdminOrderStatus
);

export default router;
