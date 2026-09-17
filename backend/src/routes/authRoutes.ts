import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import {
  getAllUsers,
  updateUserRole,
  updateUserPermissions,
  deleteUser,
  createAdmin,
} from '../controllers/userAdminController.js';
import { googleSignIn } from '../controllers/googleAuthController.js';
import {
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/passwordController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

// Public auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleSignIn);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/logout', logout);

// Authenticated user profile route
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

// Admin / Superadmin user management routes
router.get('/users', authenticate, authorizeRoles('admin', 'superadmin'), getAllUsers);
router.post('/admins', authenticate, authorizeRoles('admin', 'superadmin'), createAdmin);
router.put('/users/:userId/role', authenticate, authorizeRoles('admin', 'superadmin'), updateUserRole);
router.put('/users/:userId/permissions', authenticate, authorizeRoles('admin', 'superadmin'), updateUserPermissions);
router.delete('/users/:userId', authenticate, authorizeRoles('admin', 'superadmin'), deleteUser);

export default router;
