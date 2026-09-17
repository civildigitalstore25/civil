import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const configDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(configDirectory, '../../.env.local') });
const required = (name) => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};
const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
}
export const config = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT) || 5000,
    mongoUri: required('MONGO_URI'),
    jwtSecret,
    frontendUrl: required('FRONTEND_URL'),
    googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? '',
    brevoApiKey: process.env.BREVO_API_KEY?.trim() ?? '',
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL?.trim() ?? '',
    brevoSenderName: process.env.BREVO_SENDER_NAME?.trim() || 'Civil Digital Store',
    superAdminEmail: required('SUPERADMIN_EMAIL'),
    superAdminPassword: required('SUPERADMIN_PASSWORD'),
    isProduction: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=index.js.map