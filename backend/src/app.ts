import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import routes from './routes/index.js';
import { config } from './config/index.js';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

export default app;
