import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import couponRoutes from './couponRoutes.js';
import brandRoutes from './brandRoutes.js';
import bannerRoutes from './bannerRoutes.js';

const router = Router();

// API routes entry point
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/coupons', couponRoutes);
router.use('/brands', brandRoutes);
router.use('/banners', bannerRoutes);

export default router;
