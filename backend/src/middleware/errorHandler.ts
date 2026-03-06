import { NextFunction, Request, Response } from 'express';

import HttpError from '../utils/HttpError';

function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

export default errorHandler;
