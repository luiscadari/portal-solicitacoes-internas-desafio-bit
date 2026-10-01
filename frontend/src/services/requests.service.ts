import type {
  DashboardSummary,
  PaginatedResponse,
  RequestFilters,
  RequestInput,
  RequestStatus,
  ServiceRequest,
} from '@/types';
import { localDayBoundary } from '@/lib/format';
import { api } from './api';

/** Converte os filtros da tela nos parâmetros aceitos pela API (descarta vazios). */
export function toQueryParams(filters: RequestFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;
  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.from) params.from = localDayBoundary(filters.from, 'start');
  if (filters.to) params.to = localDayBoundary(filters.to, 'end');
  return params;
}

export const requestsService = {
  async list(filters: RequestFilters): Promise<PaginatedResponse<ServiceRequest>> {
    const { data } = await api.get<PaginatedResponse<ServiceRequest>>('/requests', { params: toQueryParams(filters) });
    return data;
  },
  async get(id: number): Promise<ServiceRequest> {
    const { data } = await api.get<ServiceRequest>(`/requests/${id}`);
    return data;
  },
  async create(input: RequestInput): Promise<ServiceRequest> {
    const { data } = await api.post<ServiceRequest>('/requests', input);
    return data;
  },
  async update(id: number, input: RequestInput): Promise<ServiceRequest> {
    const { data } = await api.put<ServiceRequest>(`/requests/${id}`, input);
    return data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/requests/${id}`);
  },
  async updateStatus(id: number, status: RequestStatus): Promise<ServiceRequest> {
    const { data } = await api.patch<ServiceRequest>(`/requests/${id}/status`, { status });
    return data;
  },
  async dashboard(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard');
    return data;
  },
};
