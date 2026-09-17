import { AUTH } from '../constants/auth.js';
import { config } from '../config/index.js';
export const sendPasswordResetEmail = async ({ recipientEmail, recipientName, resetUrl, }) => {
    if (!config.brevoApiKey || !config.brevoSenderEmail) {
        throw new Error('Brevo email configuration is incomplete');
    }
    const response = await fetch(AUTH.brevoEndpoint, {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'api-key': config.brevoApiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: {
                email: config.brevoSenderEmail,
                name: config.brevoSenderName,
            },
            to: [{ email: recipientEmail, name: recipientName }],
            subject: 'Reset your Civil Digital Store password',
            htmlContent: `
        <p>Hello ${escapeHtml(recipientName)},</p>
        <p>Use the secure link below to reset your password. It expires in 30 minutes.</p>
        <p><a href="${escapeHtml(resetUrl)}">Reset password</a></p>
        <p>If you did not request this change, you can ignore this email.</p>
      `,
        }),
    });
    if (!response.ok) {
        throw new Error(`Brevo rejected the email request with status ${response.status}`);
    }
};
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
})[character] ?? character);
//# sourceMappingURL=emailService.js.map