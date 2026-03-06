import { NextFunction, Request, Response } from 'express';

type Controller = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const ctrlWrapper = (ctrl: Controller) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default ctrlWrapper;
