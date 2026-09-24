import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { ensureDbReady } from './config/db.js';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
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
