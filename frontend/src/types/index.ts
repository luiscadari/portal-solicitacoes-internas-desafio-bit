export type Role = 'COLABORADOR' | 'ATENDENTE';
export type Category = 'TI' | 'RH' | 'COMPRAS' | 'FINANCEIRO' | 'INFRAESTRUTURA';
export type RequestStatus = 'ABERTO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';

export interface User {
  id: number;
  username: string;
  name: string;
  role: Role;
}

export interface UserSummary {
  id: number;
  name: string;
  username: string;
}

export interface StatusHistoryEntry {
  id: number;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  changedAt: string;
  changedBy: UserSummary;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category: Category;
  status: RequestStatus;
  requesterId: number;
  createdAt: string;
  updatedAt: string;
  requester: UserSummary;
  history?: StatusHistoryEntry[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface RequestFilters {
  from?: string;
  to?: string;
  category?: Category | '';
  status?: RequestStatus | '';
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface RequestInput {
  title: string;
  description: string;
  category: Category;
}

export interface DashboardSummary {
  total: number;
  aberto: number;
  emAtendimento: number;
  concluido: number;
  porCategoria: Record<Category, number>;
}
