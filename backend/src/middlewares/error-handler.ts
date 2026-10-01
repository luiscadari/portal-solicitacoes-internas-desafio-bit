import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Recurso não encontrado' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Dados inválidos', details: err.flatten().fieldErrors });
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  res.status(500).json({ message: 'Erro interno do servidor' });
};
