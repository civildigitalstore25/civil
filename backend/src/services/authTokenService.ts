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

const sessionCookieOptions = {
  httpOnly: true,
  // Frontend and backend are on different Vercel domains → cross-site.
  // Browsers only send cross-site cookies with SameSite=None; Secure.
  secure: config.isProduction,
  sameSite: config.isProduction ? ('none' as const) : ('lax' as const),
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
  });
};
