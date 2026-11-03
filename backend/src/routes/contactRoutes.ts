import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const router = Router();

// Simple in-memory throttle: max 5 messages per IP per 10 minutes.
const hits = new Map<string, number[]>();
router.post(
  '/',
  (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (recent.length >= 5) {
      res.status(429).json({ success: false, message: 'Too many messages. Please try again later.' });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  },
  submitContactForm,
);

export default router;