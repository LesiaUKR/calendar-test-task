import express from 'express';

import corsMiddleware from './middleware/cors';
import errorHandler from './middleware/errorHandler';
import tasksRouter from './routes/tasks';
import { setupSwagger } from './swagger';

const app = express();

app.use(corsMiddleware);
app.use(express.json());

setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
