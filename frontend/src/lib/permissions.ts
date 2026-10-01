import type { ServiceRequest, User } from '@/types';

/** Solicitante pode editar/excluir enquanto a solicitação estiver aberta. */
export function canModify(user: User | null, request: Pick<ServiceRequest, 'requesterId' | 'status'>): boolean {
  return !!user && request.requesterId === user.id && request.status === 'ABERTO';
}

/** Somente atendentes alteram o status. */
export function canChangeStatus(user: User | null): boolean {
  return user?.role === 'ATENDENTE';
}
