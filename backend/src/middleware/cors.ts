import cors from 'cors';

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});

export default corsMiddleware;
