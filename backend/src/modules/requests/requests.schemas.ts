import { Category, RequestStatus } from '@prisma/client';
import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: 'Código inválido' }).int().positive('Código inválido'),
});

export const createRequestSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .trim()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(120, 'Título deve ter no máximo 120 caracteres'),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(5, 'Descrição deve ter ao menos 5 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  category: z.nativeEnum(Category, { errorMap: () => ({ message: 'Categoria inválida' }) }),
});

export const updateRequestSchema = createRequestSchema;

export const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus, { errorMap: () => ({ message: 'Status inválido' }) }),
});

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Aceita data (AAAA-MM-DD) ou data/hora ISO 8601. */
const dateParam = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida')
  .optional();

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const listRequestsSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    from: z.preprocess(emptyToUndefined, dateParam),
    to: z.preprocess(emptyToUndefined, dateParam),
    category: z.preprocess(emptyToUndefined, z.nativeEnum(Category, { errorMap: () => ({ message: 'Categoria inválida' }) }).optional()),
    status: z.preprocess(emptyToUndefined, z.nativeEnum(RequestStatus, { errorMap: () => ({ message: 'Status inválido' }) }).optional()),
    q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  })
  .refine((data) => !data.from || !data.to || Date.parse(data.from) <= Date.parse(data.to), {
    message: 'A data inicial deve ser menor ou igual à data final',
    path: ['to'],
  });

/** Converte o parâmetro "to" em limite exclusivo: datas sem hora incluem o dia inteiro. */
export function endBoundary(to: string): Date {
  const date = new Date(to);
  if (DATE_ONLY.test(to)) {
    date.setUTCDate(date.getUTCDate() + 1);
  } else {
    date.setTime(date.getTime() + 1);
  }
  return date;
}

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsSchema>;
