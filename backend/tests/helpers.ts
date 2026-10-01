import { RequestStatus, Role, Category } from '@prisma/client';
import { AUTH_COOKIE } from '../src/config/cookies';
import { signToken } from '../src/lib/jwt';
import type { AuthUser } from '../src/types/express';

export const colaborador: AuthUser = { id: 1, username: 'colaborador', name: 'Carlos Colaborador', role: Role.COLABORADOR };
export const outroColaborador: AuthUser = { id: 2, username: 'maria', name: 'Maria Souza', role: Role.COLABORADOR };
export const atendente: AuthUser = { id: 3, username: 'atendente', name: 'Ana Atendente', role: Role.ATENDENTE };

export function authCookie(user: AuthUser): string {
  const token = signToken({ sub: String(user.id), username: user.username, name: user.name, role: user.role });
  return `${AUTH_COOKIE}=${token}`;
}

export function makeRequest(overrides: Partial<Record<string, unknown>> = {}) {
  const now = new Date('2026-09-01T12:00:00.000Z');
  return {
    id: 10,
    title: 'Notebook não liga',
    description: 'Meu notebook não liga desde ontem.',
    category: Category.TI,
    status: RequestStatus.ABERTO,
    requesterId: colaborador.id,
    createdAt: now,
    updatedAt: now,
    requester: { id: colaborador.id, name: colaborador.name, username: colaborador.username },
    history: [],
    ...overrides,
  };
}
