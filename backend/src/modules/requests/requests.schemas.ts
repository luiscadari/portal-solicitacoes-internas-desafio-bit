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

export const listRequestsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsSchema>;
