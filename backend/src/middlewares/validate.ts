import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Valida e normaliza a parte indicada da requisição com um schema zod.
 * O resultado convertido fica disponível em `res.locals[source]`.
 */
export const validate =
  (schema: ZodTypeAny, source: Source = 'body'): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({ message: 'Dados inválidos', details: result.error.flatten().fieldErrors });
      return;
    }
    res.locals[source] = result.data;
    next();
  };
