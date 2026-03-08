import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import HttpError from '../utils/HttpError';

const validateBody = (schema: z.ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map(e => e.message).join(', ');
        throw new HttpError(400, message);
      }
      throw error;
    }
  };
};

export default validateBody;
