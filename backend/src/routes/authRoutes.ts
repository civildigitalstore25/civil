import { Router } from 'express';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  updateUserPermissions,
  deleteUser,
  createAdmin,
} from '../controllers/authController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Authenticated user profile route
router.get('/me', authenticate, getMe);

// Admin / Superadmin user management routes
router.get('/users', authenticate, authorizeRoles('admin', 'superadmin'), getAllUsers);
router.post('/admins', authenticate, authorizeRoles('admin', 'superadmin'), createAdmin);
router.put('/users/:userId/role', authenticate, authorizeRoles('admin', 'superadmin'), updateUserRole);
router.put('/users/:userId/permissions', authenticate, authorizeRoles('admin', 'superadmin'), updateUserPermissions);
router.delete('/users/:userId', authenticate, authorizeRoles('admin', 'superadmin'), deleteUser);

export default router;
