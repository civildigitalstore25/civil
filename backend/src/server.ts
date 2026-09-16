import app from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';
import { seedSuperAdmin } from './seed.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

