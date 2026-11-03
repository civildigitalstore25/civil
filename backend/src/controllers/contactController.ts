import type { Request, Response } from 'express';
import { sendContactFormEmail } from '../services/emailService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** POST /api/contact - emails the contact form to the store inbox via Brevo. */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  const name = clip(req.body?.name, 100);
  const email = clip(req.body?.email, 150).toLowerCase();
  const phone = clip(req.body?.phone, 30);
  const subject = clip(req.body?.subject, 150);
  const message = clip(req.body?.message, 5000);

  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    res.status(400).json({ success: false, message: 'Name, a valid email and a message are required.' });
    return;
  }

  try {
    await sendContactFormEmail({ name, email, phone, subject, message });
    res.json({ success: true, message: 'Thanks! Your message has been sent.' });
  } catch (error) {
    console.error('[email] contact form failed:', error instanceof Error ? error.message : error);
    res.status(502).json({ success: false, message: 'Unable to send your message right now. Please try again later.' });
  }
};