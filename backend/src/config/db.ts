import mongoose from 'mongoose';
import { config } from './index.js';
import { seedSuperAdmin } from '../seed.js';

declare global {
  // eslint-disable-next-line no-var
  var __civilDbReady: Promise<void> | undefined;
}

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    throw error;
  }
};

/** Connect DB (and seed superadmin once) for local + Vercel serverless cold starts. */
export const ensureDbReady = async (): Promise<void> => {
  if (!globalThis.__civilDbReady) {
    globalThis.__civilDbReady = (async () => {
      await connectDB();
      await seedSuperAdmin();
    })();
  }

  await globalThis.__civilDbReady;
};
