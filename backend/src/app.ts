import express from 'express';

import corsMiddleware from './middleware/cors';
import errorHandler from './middleware/errorHandler';
import securityHeaders from './middleware/securityHeaders';
import tasksRouter from './routes/tasks';
import { setupSwagger } from './swagger';

const app = express();
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));

setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

app.use(errorHandler);

export default app;
