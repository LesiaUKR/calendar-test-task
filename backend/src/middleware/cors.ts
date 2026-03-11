import cors from 'cors';

const explicitOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isAllowedVercelPreview = (origin: string) =>
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true); // Postman/curl/server-to-server

    if (explicitOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

export default corsMiddleware;
