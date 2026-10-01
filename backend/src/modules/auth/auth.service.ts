import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/app-error';
import type { LoginInput } from './auth.schemas';

export async function login({ username, password }: LoginInput): Promise<{ token: string; user: AuthUser }> {
  const found = await prisma.user.findUnique({ where: { username } });
  const valid = found ? await bcrypt.compare(password, found.passwordHash) : false;

  if (!found || !valid) {
    throw new AppError('Usuário ou senha inválidos', 401);
  }

  const user: AuthUser = { id: found.id, username: found.username, name: found.name, role: found.role };
  const token = signToken({ sub: String(user.id), username: user.username, name: user.name, role: user.role });
  return { token, user };
}

export async function getProfile(userId: number): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, name: true, role: true },
  });
  if (!user) throw new AppError('Usuário não encontrado', 401);
  return user;
}
