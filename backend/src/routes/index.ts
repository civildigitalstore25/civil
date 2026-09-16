import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

// API routes entry point
router.use('/auth', authRoutes);

export default router;

