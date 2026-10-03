import { Router } from 'express';
import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
} from '../controllers/couponController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Public / User checkout route
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', getCoupons);
router.get('/:id', getCouponById);
router.post('/', authenticate, authorizeRoles('admin', 'superadmin'), createCoupon);
router.put('/:id', authenticate, authorizeRoles('admin', 'superadmin'), updateCoupon);
router.delete('/:id', authenticate, authorizeRoles('admin', 'superadmin'), deleteCoupon);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'superadmin'), toggleCouponStatus);

export default router;
