import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';
import User from '../models/User.js';
import { setSessionCookie } from '../services/authTokenService.js';
import { formatUserResponse } from '../services/userPresenter.js';
const googleClient = new OAuth2Client();
export const googleSignIn = async (req, res) => {
    try {
        const credential = typeof req.body.credential === 'string' ? req.body.credential : '';
        if (!credential || !config.googleClientId) {
            res.status(400).json({ success: false, error: 'Google sign-in is not configured' });
            return;
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload.email || !payload.email_verified) {
            res.status(401).json({ success: false, error: 'Google account could not be verified' });
            return;
        }
        const email = payload.email.toLowerCase();
        let user = await User.findOne({
            $or: [{ googleId: payload.sub }, { email }],
        }).select('+googleId');
        if (!user) {
            const emailName = email.slice(0, email.indexOf('@'));
            user = await User.create({
                name: payload.name?.trim() || emailName || 'Google User',
                email,
                googleId: payload.sub,
                authProvider: 'google',
                role: 'user',
            });
        }
        else if (!user.googleId) {
            user.googleId = payload.sub;
            await user.save();
        }
        setSessionCookie(res, user);
        res.json({
            success: true,
            message: 'Signed in with Google successfully',
            user: formatUserResponse(user),
        });
    }
    catch {
        res.status(401).json({ success: false, error: 'Google sign-in failed' });
    }
};
//# sourceMappingURL=googleAuthController.js.map