import { createHash, randomBytes } from 'node:crypto';
import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
import User from '../models/User.js';
import { clearSessionCookie, setSessionCookie } from '../services/authTokenService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
const hashResetToken = (token) => createHash('sha256').update(token).digest('hex');
const validPassword = (password) => typeof password === 'string' && password.length >= AUTH.passwordMinLength;
export const forgotPassword = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!AUTH.emailPattern.test(email)) {
        res.status(400).json({ success: false, error: 'Enter a valid email address' });
        return;
    }
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) {
        res.status(404).json({
            success: false,
            error: 'No account is registered with this email address',
        });
        return;
    }
    const token = randomBytes(AUTH.resetTokenBytes).toString('hex');
    user.passwordResetTokenHash = hashResetToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + AUTH.resetTokenTtlMs);
    await user.save({ validateBeforeSave: false });
    const resetUrl = new URL(AUTH.resetRoute, config.frontendUrl);
    resetUrl.searchParams.set('token', token);
    try {
        await sendPasswordResetEmail({
            recipientEmail: user.email,
            recipientName: user.name,
            resetUrl: resetUrl.toString(),
        });
        res.json({
            success: true,
            message: 'Password reset link sent successfully. Check your email.',
        });
    }
    catch (error) {
        user.set('passwordResetTokenHash', undefined);
        user.set('passwordResetExpiresAt', undefined);
        await user.save({ validateBeforeSave: false });
        console.error('Password reset email failed:', error);
        res.status(502).json({
            success: false,
            error: 'Unable to send the reset email. Please try again later.',
        });
    }
};
export const resetPassword = async (req, res) => {
    const token = typeof req.body.token === 'string' ? req.body.token : '';
    const password = req.body.password;
    if (!token || !validPassword(password)) {
        res.status(400).json({
            success: false,
            error: 'A valid token and password of at least 8 characters are required',
        });
        return;
    }
    const user = await User.findOne({
        passwordResetTokenHash: hashResetToken(token),
        passwordResetExpiresAt: { $gt: new Date() },
    }).select('+password +passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) {
        res.status(400).json({ success: false, error: 'Reset link is invalid or expired' });
        return;
    }
    user.password = password;
    user.authProvider = 'local';
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;
    user.set('passwordResetTokenHash', undefined);
    user.set('passwordResetExpiresAt', undefined);
    await user.save();
    clearSessionCookie(res);
    res.json({ success: true, message: 'Password reset successfully' });
};
export const changePassword = async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    if (typeof currentPassword !== 'string' ||
        !validPassword(newPassword) ||
        !req.user) {
        res.status(400).json({ success: false, error: 'Current and valid new passwords are required' });
        return;
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user?.password || !(await user.comparePassword(currentPassword))) {
        res.status(400).json({ success: false, error: 'Current password is incorrect' });
        return;
    }
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;
    await user.save();
    setSessionCookie(res, user);
    res.json({ success: true, message: 'Password changed successfully' });
};
//# sourceMappingURL=passwordController.js.map