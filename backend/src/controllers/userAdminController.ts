import type { Response } from 'express';
import { AUTH } from '../constants/auth.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import User, { type UserRole } from '../models/User.js';
import { formatUserResponse } from '../services/userPresenter.js';

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users: users.map(formatUserResponse) });
  } catch {
    res.status(500).json({ success: false, error: 'Unable to retrieve users' });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role: UserRole };
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role specified' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    if (
      (role === 'superadmin' || user.role === 'superadmin') &&
      req.user?.role !== 'superadmin'
    ) {
      res.status(403).json({
        success: false,
        error: 'Only Superadmin can modify superadmin roles',
      });
      return;
    }

    user.role = role;
    await user.save();
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: formatUserResponse(user),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Unable to update role' });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (req.user?._id.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot delete your own account' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    if (user.role === 'superadmin') {
      res.status(403).json({
        success: false,
        error: 'Superadmin account cannot be deleted',
      });
      return;
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Unable to delete user' });
  }
};

export const updateUserPermissions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { permissions } = req.body as { permissions: string[] };
    if (!Array.isArray(permissions)) {
      res.status(400).json({
        success: false,
        error: 'Permissions must be an array of menu keys',
      });
      return;
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    user.permissions = permissions;
    await user.save();
    res.json({
      success: true,
      message: 'User menu permissions updated successfully',
      user: formatUserResponse(user),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Unable to update permissions' });
  }
};

export const createAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, phone, password, role, permissions } = req.body;
    const adminName = typeof name === 'string' ? name.trim() : '';
    const adminEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const adminPhone =
      typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
    if (
      !adminName ||
      !AUTH.emailPattern.test(adminEmail) ||
      !AUTH.phonePattern.test(adminPhone) ||
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

    if (await User.exists({ email: adminEmail })) {
      res.status(400).json({
        success: false,
        error: 'An account with this email address already exists',
      });
      return;
    }

    const assignedRole =
      role === 'superadmin' && req.user?.role === 'superadmin'
        ? 'superadmin'
        : 'admin';
    const user = await User.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password,
      role: assignedRole,
      ...(Array.isArray(permissions) ? { permissions } : {}),
    });
    res.status(201).json({
      success: true,
      message: `${assignedRole === 'superadmin' ? 'Superadmin' : 'Admin'} account created successfully`,
      user: formatUserResponse(user),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Unable to create administrator' });
  }
};
