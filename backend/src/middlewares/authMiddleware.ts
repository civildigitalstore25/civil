import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AUTH } from '../constants/auth.js';
import User, { type IUser, type UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  tokenVersion: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const token = req.cookies?.[AUTH.cookieName] ?? bearerToken;

    if (!token) {
      res.status(401).json({ message: 'Authorization token missing or invalid' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User associated with token no longer exists' });
      return;
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      res.status(401).json({ message: 'Authentication token is no longer valid' });
      return;
    }

    if (
      user.passwordChangedAt &&
      Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
    ) {
      res.status(401).json({ message: 'Authentication token is no longer valid' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      return;
    }

    next();
  };
};
