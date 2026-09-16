import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User, { type IUser, type UserRole } from '../models/User.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

const signToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

const formatUserResponse = (user: IUser) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions && user.permissions.length > 0 ? user.permissions : ['dashboard', 'products', 'categories', 'orders', 'users', 'admins', 'profile'],
    createdAt: user.createdAt,
  };
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, fullName, email, phone, mobileNumber, password } = req.body;

    const userName = (name || fullName || '').trim();
    const userEmail = (email || '').trim().toLowerCase();
    const userPhone = (phone || mobileNumber || '').trim();

    if (!userName || !userEmail || !userPhone || !password) {
      res.status(400).json({ success: false, error: 'All fields (name, email, phone, password) are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email address is already registered' });
      return;
    }

    const newUser = new User({
      name: userName,
      email: userEmail,
      phone: userPhone,
      password,
      role: 'user',
    });

    await newUser.save();

    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier, email, phone, password } = req.body;

    const inputId = (identifier || email || phone || '').trim();

    if (!inputId || !password) {
      res.status(400).json({ success: false, error: 'Email/Phone and password are required' });
      return;
    }

    const cleanInput = inputId.toLowerCase();
    const cleanPhoneInput = inputId.replace(/\s+/g, '');

    // Search by email or phone
    const user = await User.findOne({
      $or: [
        { email: cleanInput },
        { phone: inputId },
        { phone: cleanPhoneInput },
      ],
    }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
      return;
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    res.json({
      success: true,
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const formatted = users.map(formatUserResponse);

    res.json({
      success: true,
      users: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role: UserRole };

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role specified' });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Only superadmin can set or change superadmin role
    if ((role === 'superadmin' || targetUser.role === 'superadmin') && req.user?.role !== 'superadmin') {
      res.status(403).json({ success: false, error: 'Only Superadmin can modify superadmin roles' });
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: formatUserResponse(targetUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (req.user?._id.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot delete your own account' });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (targetUser.role === 'superadmin') {
      res.status(403).json({ success: false, error: 'Superadmin account cannot be deleted' });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body as { permissions: string[] };

    if (!Array.isArray(permissions)) {
      res.status(400).json({ success: false, error: 'Permissions must be an array of menu keys' });
      return;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    targetUser.permissions = permissions;
    await targetUser.save();

    res.json({
      success: true,
      message: 'User menu permissions updated successfully',
      user: formatUserResponse(targetUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, permissions } = req.body;

    const adminName = (name || '').trim();
    const adminEmail = (email || '').trim().toLowerCase();
    const adminPhone = (phone || '').trim();

    if (!adminName || !adminEmail || !adminPhone || !password) {
      res.status(400).json({ success: false, error: 'Name, Email, Phone, and Password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'An account with this email address already exists' });
      return;
    }

    const assignedRole = role === 'superadmin' && req.user?.role === 'superadmin' ? 'superadmin' : 'admin';
    const defaultMenuPermissions = ['dashboard', 'products', 'categories', 'orders', 'users', 'admins', 'profile'];
    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0 ? permissions : defaultMenuPermissions;

    const newAdmin = new User({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password,
      role: assignedRole,
      permissions: assignedPermissions,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: `${assignedRole === 'superadmin' ? 'Superadmin' : 'Admin'} account created successfully`,
      user: formatUserResponse(newAdmin),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};


