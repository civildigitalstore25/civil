// Database and application configuration
export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Civil',
  jwtSecret: process.env.JWT_SECRET || 'civil_store_super_secret_jwt_key_2026',
  superAdminEmail: process.env.SUPERADMIN_EMAIL || 'civildigitalstore25@gmail.com',
  superAdminPassword: process.env.SUPERADMIN_PASSWORD || 'CivilDigitalStore25@#',
};

