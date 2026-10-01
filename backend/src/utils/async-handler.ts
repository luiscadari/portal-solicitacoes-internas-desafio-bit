import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Encaminha erros de handlers assíncronos para o errorHandler (Express 4). */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
