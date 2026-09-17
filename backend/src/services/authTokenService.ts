import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
import type { IUser } from '../models/User.js';

export const signSessionToken = (user: IUser): string =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwtSecret,
    { expiresIn: AUTH.jwtExpiresIn },
  );

export const setSessionCookie = (res: Response, user: IUser): void => {
  res.cookie(AUTH.cookieName, signSessionToken(user), {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: AUTH.cookieMaxAgeMs,
    path: '/',
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(AUTH.cookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
  });
};
