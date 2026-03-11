import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
});

export default function securityHeaders(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api-docs')) {
    return next();
  }

  return helmetMiddleware(req, res, next);
}
