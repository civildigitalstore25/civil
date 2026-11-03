import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Local only — on Vercel, env vars come from the project settings.
try {
  const configDirectory = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(configDirectory, '../../.env.local') });
  dotenv.config({ path: path.resolve(configDirectory, '../../.env') });
} catch {
  // Ignore missing env files in production/serverless.
}

const required = (name: string): string => {
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

const formatPrivateKey = (key?: string): string => {
  if (!key) return '';
  return key.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').trim();
};

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
  googleDriveEnabled: process.env.GOOGLE_DRIVE_ENABLED === 'true',
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? '',
  googlePrivateKey: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() ?? '',
  // Order alerts go here; falls back to the super admin address.
  adminEmail: process.env.ADMIN_EMAIL?.trim() || process.env.SUPERADMIN_EMAIL?.trim() || '',
  contactEmail:
    process.env.CONTACT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || process.env.SUPERADMIN_EMAIL?.trim() || '',
  // Email images are served as hosted assets (same approach as civil-ecommerce):
  // <EMAIL_ASSET_BASE_URL || FRONTEND_URL>/logo.png, i.e. frontend/public/logo.png.
  // EMAIL_LOGO_URL is an optional override only.
  emailAssetBaseUrl: (process.env.EMAIL_ASSET_BASE_URL?.trim() || process.env.FRONTEND_URL?.trim() || '').replace(/\/$/, ''),
  emailLogoUrl: process.env.EMAIL_LOGO_URL?.trim() ?? '',
  phonepe: {
    env: process.env.PHONEPE_ENV?.trim().toUpperCase() === 'PRODUCTION' ? 'production' : 'sandbox',
    clientId: process.env.PHONEPE_CLIENT_ID?.trim() ?? '',
    clientSecret: process.env.PHONEPE_CLIENT_SECRET?.trim() ?? '',
    clientVersion: process.env.PHONEPE_CLIENT_VERSION?.trim() || '1',
    // Production (PG V1, live dashboard): API key + key index
    merchantId: process.env.PHONEPE_MERCHANT_ID?.trim() ?? '',
    apiKey: process.env.PHONEPE_API_KEY?.trim() ?? '',
    keyIndex: process.env.PHONEPE_KEY_INDEX?.trim() || '1',
  },
};
