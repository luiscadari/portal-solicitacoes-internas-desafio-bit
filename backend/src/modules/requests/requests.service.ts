import { Prisma, RequestStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/app-error';
import type {
  CreateRequestInput,
  ListRequestsQuery,
  UpdateRequestInput,
  UpdateStatusInput,
} from './requests.schemas';

const userSummary = { select: { id: true, name: true, username: true } } as const;

const listInclude = { requester: userSummary } satisfies Prisma.RequestInclude;

const detailInclude = {
  requester: userSummary,
  history: { include: { changedBy: userSummary }, orderBy: { changedAt: 'asc' } },
} satisfies Prisma.RequestInclude;

/** Colaboradores enxergam apenas as próprias solicitações; atendentes enxergam todas. */
export function scopeByUser(user: AuthUser): Prisma.RequestWhereInput {
  return user.role === Role.ATENDENTE ? {} : { requesterId: user.id };
}

export async function list(user: AuthUser, query: ListRequestsQuery) {
  const where: Prisma.RequestWhereInput = scopeByUser(user);
  const { page, pageSize } = query;

  const [total, data] = await prisma.$transaction([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where,
      include: listInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function findAccessible(user: AuthUser, id: number) {
  const request = await prisma.request.findUnique({ where: { id }, include: detailInclude });
  if (!request) throw new AppError('Solicitação não encontrada', 404);
  if (user.role !== Role.ATENDENTE && request.requesterId !== user.id) {
    throw new AppError('Você não tem permissão para acessar esta solicitação', 403);
  }
  return request;
}

export function getById(user: AuthUser, id: number) {
  return findAccessible(user, id);
}

export function create(user: AuthUser, input: CreateRequestInput) {
  return prisma.request.create({
    data: {
      ...input,
      status: RequestStatus.ABERTO,
      requesterId: user.id,
      history: { create: { fromStatus: null, toStatus: RequestStatus.ABERTO, changedById: user.id } },
    },
    include: detailInclude,
  });
}

/** Apenas o solicitante pode alterar/excluir, e somente enquanto a solicitação estiver aberta. */
function assertEditable(user: AuthUser, request: { requesterId: number; status: RequestStatus }) {
  if (request.requesterId !== user.id) {
    throw new AppError('Apenas o solicitante pode modificar esta solicitação', 403);
  }
  if (request.status !== RequestStatus.ABERTO) {
    throw new AppError('Apenas solicitações com status Aberto podem ser modificadas', 409);
  }
}

export async function update(user: AuthUser, id: number, input: UpdateRequestInput) {
  const request = await findAccessible(user, id);
  assertEditable(user, request);
  return prisma.request.update({ where: { id }, data: input, include: detailInclude });
}

export async function remove(user: AuthUser, id: number) {
  const request = await findAccessible(user, id);
  assertEditable(user, request);
  await prisma.request.delete({ where: { id } });
}

export async function updateStatus(user: AuthUser, id: number, { status }: UpdateStatusInput) {
  const request = await findAccessible(user, id);
  if (request.status === status) {
    throw new AppError('A solicitação já está com este status', 409);
  }

  return prisma.request.update({
    where: { id },
    data: {
      status,
      history: { create: { fromStatus: request.status, toStatus: status, changedById: user.id } },
    },
    include: detailInclude,
  });
}
