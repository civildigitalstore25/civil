import type { Response } from 'express';
import { AUTH } from '../constants/auth.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import { clearSessionCookie, setSessionCookie } from '../services/authTokenService.js';
import { formatUserResponse } from '../services/userPresenter.js';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, fullName, email, phone, mobileNumber, password } = req.body;
    const userName =
      typeof (name || fullName) === 'string' ? (name || fullName).trim() : '';
    const userEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    const userPhone =
      typeof (phone || mobileNumber) === 'string'
        ? (phone || mobileNumber).replace(/[\s-]/g, '')
        : '';

    if (
      !userName ||
      !AUTH.emailPattern.test(userEmail) ||
      !AUTH.phonePattern.test(userPhone) ||
      typeof password !== 'string'
    ) {
      res.status(400).json({
        success: false,
        error: 'A valid name, email, phone number, and password are required',
      });
      return;
    }
    if (password.length < AUTH.passwordMinLength) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
      return;
    }
    if (await User.exists({ email: userEmail })) {
      res.status(400).json({
        success: false,
        error: 'Email address is already registered',
      });
      return;
    }

    const user = await User.create({
      name: userName,
      email: userEmail,
      phone: userPhone,
      password,
      role: 'user',
    });
    setSessionCookie(res, user);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: formatUserResponse(user),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier, email, phone, password } = req.body;
    const suppliedIdentifier = identifier || email || phone;
    const inputId =
      typeof suppliedIdentifier === 'string' ? suppliedIdentifier.trim() : '';
    if (!inputId || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email/Phone and password are required',
      });
      return;
    }

    const user = await User.findOne({
      $or: [
        { email: inputId.toLowerCase() },
        { phone: inputId },
        { phone: inputId.replace(/\s+/g, '') },
      ],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        success: false,
        error: 'Invalid email/phone or password',
      });
      return;
    }

    setSessionCookie(res, user);
    res.json({
      success: true,
      message: 'Logged in successfully',
      user: formatUserResponse(user),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const logout = (_req: AuthRequest, res: Response): void => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  res.json({ success: true, user: formatUserResponse(req.user) });
};
