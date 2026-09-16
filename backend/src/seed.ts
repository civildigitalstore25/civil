import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from './config/index.js';
import User from './models/User.js';

dotenv.config();

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const email = config.superAdminEmail.toLowerCase().trim();
    const password = config.superAdminPassword;

    console.log(`Checking for Superadmin account (${email})...`);

    let superAdmin = await User.findOne({ email });

    if (superAdmin) {
      console.log('Superadmin account already exists.');
      let updated = false;

      if (superAdmin.role !== 'superadmin') {
        superAdmin.role = 'superadmin';
        updated = true;
      }

      // Explicitly update password if changed
      const isMatch = await superAdmin.comparePassword(password);
      if (!isMatch) {
        superAdmin.password = password;
        updated = true;
      }

      if (updated) {
        await superAdmin.save();
        console.log('Superadmin credentials updated successfully.');
      } else {
        console.log('Superadmin profile is up to date.');
      }
    } else {
      console.log('Creating new Superadmin account...');
      superAdmin = new User({
        name: 'Super Admin',
        email,
        phone: '9999999999',
        password,
        role: 'superadmin',
      });

      await superAdmin.save();
      console.log('✅ Superadmin created successfully!');
    }
  } catch (error) {
    console.error('Error seeding Superadmin:', error);
    throw error;
  }
};

// Executed directly when calling `npm run seed`
const runStandaloneSeed = async () => {
  try {
    console.log(`Connecting to database at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    await seedSuperAdmin();
    console.log('Seeding completed cleanly.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed process failed:', err);
    process.exit(1);
  }
};

// If file run directly via CLI (e.g. ts-node-dev src/seed.ts)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  runStandaloneSeed();
}
