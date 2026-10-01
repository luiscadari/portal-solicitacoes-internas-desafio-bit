import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string({ required_error: 'Usuário é obrigatório' }).trim().min(1, 'Usuário é obrigatório'),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;
