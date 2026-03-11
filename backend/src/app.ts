import express from 'express';
import helmet from 'helmet';

import corsMiddleware from './middleware/cors';
import errorHandler from './middleware/errorHandler';
import tasksRouter from './routes/tasks';
import { setupSwagger } from './swagger';

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));

setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

app.use(errorHandler);

export default app;
