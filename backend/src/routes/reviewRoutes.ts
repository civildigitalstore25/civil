import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  getProductReviews,
  getRecentReviews,
  getMyProductReview,
  getMyReviewsForProducts,
  createReview,
  updateReview,
  deleteReview,
  getAdminReviews,
  getPendingReviewCount,
  adminCreateReview,
  approveReview,
  rejectReview,
} from '../controllers/reviewController.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

const reviewWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many review requests. Please wait a few minutes and try again.' },
});

const admin = [authenticate, authorizeRoles('admin', 'superadmin')];

// Admin moderation (declared before /:reviewId routes)
router.get('/admin', ...admin, getAdminReviews);
router.get('/admin/pending-count', ...admin, getPendingReviewCount);
router.post('/admin', ...admin, adminCreateReview);
router.put('/admin/:reviewId/approve', ...admin, approveReview);
router.put('/admin/:reviewId/reject', ...admin, rejectReview);
router.put('/admin/:reviewId', ...admin, updateReview);
router.delete('/admin/:reviewId', ...admin, deleteReview);

// Public
router.get('/recent', getRecentReviews);
// optionalAuthenticate: admins additionally receive isAdminCreated so they can edit reviews from the product page.
router.get('/product/:productId', optionalAuthenticate, getProductReviews);

// Signed-in customers (admins posting from the product page get an auto-approved custom-name review)
router.get('/product/:productId/mine', authenticate, getMyProductReview);
router.get('/mine', authenticate, getMyReviewsForProducts);
router.post('/product/:productId', authenticate, reviewWriteLimiter, createReview);
router.put('/:reviewId', authenticate, reviewWriteLimiter, updateReview);
router.delete('/:reviewId', authenticate, reviewWriteLimiter, deleteReview);

export default router;
