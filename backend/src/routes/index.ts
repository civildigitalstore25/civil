import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import couponRoutes from './couponRoutes.js';
import brandRoutes from './brandRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import orderRoutes from './orderRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import contactRoutes from './contactRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import cartRoutes from './cartRoutes.js';

const router = Router();

// API routes entry point
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/coupons', couponRoutes);
router.use('/brands', brandRoutes);
router.use('/banners', bannerRoutes);
router.use('/orders', orderRoutes);
router.use('/downloads', downloadRoutes);
router.use('/payments', paymentRoutes);
router.use('/contact', contactRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);

export default router;
