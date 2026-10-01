import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestsService } from '@/services/requests.service';
import type { RequestFilters, RequestInput, RequestStatus } from '@/types';

export const requestKeys = {
  all: ['requests'] as const,
  list: (filters: RequestFilters) => ['requests', 'list', filters] as const,
  detail: (id: number) => ['requests', 'detail', id] as const,
  dashboard: ['dashboard'] as const,
};

export function useRequestList(filters: RequestFilters) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => requestsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRequest(id: number) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsService.get(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useDashboard() {
  return useQuery({ queryKey: requestKeys.dashboard, queryFn: requestsService.dashboard });
}

function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: requestKeys.all });
    void queryClient.invalidateQueries({ queryKey: requestKeys.dashboard });
  };
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: (input: RequestInput) => requestsService.create(input), onSuccess: invalidate });
}

export function useUpdateRequest(id: number) {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (input: RequestInput) => requestsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => requestsService.remove(id),
    onSuccess: (_data, id) => {
      // Remove o detalhe do cache para não refazer o GET de um registro que não existe mais.
      queryClient.removeQueries({ queryKey: requestKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      void queryClient.invalidateQueries({ queryKey: requestKeys.dashboard });
    },
  });
}

export function useUpdateStatus() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) => requestsService.updateStatus(id, status),
    onSuccess: invalidate,
  });
}
