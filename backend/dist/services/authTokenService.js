import jwt from 'jsonwebtoken';
import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
export const signSessionToken = (user) => jwt.sign({
    id: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion,
}, config.jwtSecret, { expiresIn: AUTH.jwtExpiresIn });
export const setSessionCookie = (res, user) => {
    res.cookie(AUTH.cookieName, signSessionToken(user), {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        maxAge: AUTH.cookieMaxAgeMs,
        path: '/',
    });
};
export const clearSessionCookie = (res) => {
    res.clearCookie(AUTH.cookieName, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        path: '/',
    });
};
//# sourceMappingURL=authTokenService.js.map