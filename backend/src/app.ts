import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { ensureDbReady } from './config/db.js';

const app: Express = express();

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !config.isProduction) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Liveness only — does not touch MongoDB (use this to confirm the function boots).
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDbReady();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'civil-backend' });
});

app.use('/api', routes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('Request failed:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
});

export default app;
