import type { IUser } from '../models/User.js';

const DEFAULT_ADMIN_PERMISSIONS = [
  'dashboard',
  'products',
  'categories',
  'orders',
  'users',
  'admins',
  'profile',
];

export const formatUserResponse = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  permissions:
    user.permissions.length > 0 ? user.permissions : DEFAULT_ADMIN_PERMISSIONS,
  createdAt: user.createdAt,
});
