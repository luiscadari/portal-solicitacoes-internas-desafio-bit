import type { Category, RequestStatus, Role } from '@/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  TI: 'TI',
  RH: 'RH',
  COMPRAS: 'Compras',
  FINANCEIRO: 'Financeiro',
  INFRAESTRUTURA: 'Infraestrutura',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDO: 'Concluído',
};

export const ROLE_LABELS: Record<Role, string> = {
  COLABORADOR: 'Colaborador',
  ATENDENTE: 'Atendente',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
export const STATUSES = Object.keys(STATUS_LABELS) as RequestStatus[];
