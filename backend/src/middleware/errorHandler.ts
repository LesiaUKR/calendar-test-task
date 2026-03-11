import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { NextFunction, Request, Response } from 'express';

import HttpError from '../utils/HttpError';

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON in request body' });
    return;
  }

  if ('type' in err && err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }

  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: 'Resource already exists (unique constraint violation)' });
    return;
  }

  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS policy blocked this origin' });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

export default errorHandler;
