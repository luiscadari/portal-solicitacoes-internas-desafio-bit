import { Category, RequestStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { scopeByUser } from '../requests/requests.service';

export interface DashboardSummary {
  total: number;
  aberto: number;
  emAtendimento: number;
  concluido: number;
  porCategoria: Record<Category, number>;
}

export async function getSummary(user: AuthUser): Promise<DashboardSummary> {
  const where = scopeByUser(user);

  const [byStatus, byCategory] = await Promise.all([
    prisma.request.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.request.groupBy({ by: ['category'], where, _count: { _all: true } }),
  ]);

  const countStatus = (status: RequestStatus) =>
    byStatus.find((row) => row.status === status)?._count._all ?? 0;

  const porCategoria = Object.values(Category).reduce(
    (acc, category) => {
      acc[category] = byCategory.find((row) => row.category === category)?._count._all ?? 0;
      return acc;
    },
    {} as Record<Category, number>,
  );

  const aberto = countStatus(RequestStatus.ABERTO);
  const emAtendimento = countStatus(RequestStatus.EM_ATENDIMENTO);
  const concluido = countStatus(RequestStatus.CONCLUIDO);

  return { total: aberto + emAtendimento + concluido, aberto, emAtendimento, concluido, porCategoria };
}
