import { Router } from 'express';
import { getPhonePePaymentStatus, initiatePhonePePayment, phonePeWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/phonepe/initiate', authenticate, initiatePhonePePayment);
router.get('/phonepe/status/:merchantOrderId', getPhonePePaymentStatus);
router.post('/phonepe/webhook', phonePeWebhook);

export default router;