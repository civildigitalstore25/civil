import { Router } from 'express';
import {
  clearMyCart,
  getAdminCarts,
  getMyCart,
  syncMyCart,
} from '../controllers/cartController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getMyCart);
router.put('/', authenticate, syncMyCart);
router.delete('/', authenticate, clearMyCart);

router.get('/admin', authenticate, authorizeRoles('admin', 'superadmin'), getAdminCarts);

export default router;
