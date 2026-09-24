import app from './app.js';
import { config } from './config/index.js';
import { ensureDbReady } from './config/db.js';

const startServer = async () => {
  try {
    await ensureDbReady();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// On Vercel, the platform invokes the exported app — do not call listen().
if (!process.env.VERCEL) {
  void startServer();
}

export default app;
