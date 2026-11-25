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

/**
 * Production storefront (civildigitalstore.com) and API (*.vercel.app) are cross-site.
 * Chrome only keeps/sends that cookie with SameSite=None; Secure (and Partitioned helps
 * under third-party cookie restrictions). Localhost uses Lax.
 */
const sessionCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ('none' as const) : ('lax' as const),
  ...(config.isProduction ? { partitioned: true } : {}),
  maxAge: AUTH.cookieMaxAgeMs,
  path: '/',
};

export const setSessionCookie = (res: Response, user: IUser): void => {
  res.cookie(AUTH.cookieName, signSessionToken(user), sessionCookieOptions);
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(AUTH.cookieName, {
    httpOnly: sessionCookieOptions.httpOnly,
    secure: sessionCookieOptions.secure,
    sameSite: sessionCookieOptions.sameSite,
    path: sessionCookieOptions.path,
    ...(config.isProduction ? { partitioned: true } : {}),
  });
};
