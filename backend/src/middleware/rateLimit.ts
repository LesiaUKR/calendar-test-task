import rateLimit from 'express-rate-limit';

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many write requests, please try again later.' },
});
