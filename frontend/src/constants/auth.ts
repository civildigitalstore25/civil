export const AUTH_ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  google: '/auth/google',
  logout: '/auth/logout',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  account: '/account',
  accountPassword: '/account/password',
  adminDashboard: '/admin/dashboard',
} as const;

export const PASSWORD_MIN_LENGTH = 8;
export const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;
export const AUTH_SUCCESS_MESSAGE_DURATION_MS = 5000;
export const AUTH_SUCCESS_MESSAGES = {
  login: 'Logged in successfully.',
  register: 'Registered successfully.',
  google: 'Signed in with Google successfully.',
} as const;

// Production uses same-origin `/api` (Vercel rewrite → backend) so the session
// cookie is first-party. Cross-site calls to *.vercel.app drop the cookie in Chrome.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
