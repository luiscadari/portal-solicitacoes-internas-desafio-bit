import { useMemo, useState } from 'react';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChangeStatusDialog } from '@/components/requests/ChangeStatusDialog';
import { DeleteRequestDialog } from '@/components/requests/DeleteRequestDialog';
import { Pagination } from '@/components/requests/Pagination';
import { RequestFiltersBar } from '@/components/requests/RequestFiltersBar';
import { RequestsTable } from '@/components/requests/RequestsTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRequestList } from '@/hooks/useRequests';
import { CATEGORIES, STATUSES } from '@/lib/constants';
import { getErrorMessage } from '@/services/api';
import type { Category, RequestFilters, RequestStatus, ServiceRequest } from '@/types';

const PAGE_SIZE = 10;

/** Lê os filtros da URL (permite compartilhar/atualizar a página mantendo a busca). */
function readFilters(params: URLSearchParams): RequestFilters {
  const category = params.get('category') ?? '';
  const status = params.get('status') ?? '';
  return {
    q: params.get('q') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    category: CATEGORIES.includes(category as Category) ? (category as Category) : '',
    status: STATUSES.includes(status as RequestStatus) ? (status as RequestStatus) : '',
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: PAGE_SIZE,
  };
}

export function RequestsPage() {
  const { isAttendant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const { data, isLoading, isError, error, isFetching } = useRequestList(filters);

  const [statusTarget, setStatusTarget] = useState<ServiceRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequest | null>(null);

  const updateParams = (next: Partial<RequestFilters>) => {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    (['q', 'category', 'status', 'from', 'to'] as const).forEach((key) => {
      const value = merged[key];
      if (value) params.set(key, String(value));
    });
    if (merged.page && merged.page > 1) params.set('page', String(merged.page));
    setSearchParams(params);
  };

  const filterValues = useMemo(
    () => ({ q: filters.q, category: filters.category, status: filters.status, from: filters.from, to: filters.to }),
    [filters.q, filters.category, filters.status, filters.from, filters.to],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitações"
        description={
          isAttendant ? 'Todas as solicitações registradas no portal.' : 'Solicitações registradas por você.'
        }
        actions={
          <Button asChild>
            <Link to="/solicitacoes/nova">
              <PlusCircle />
              Nova solicitação
            </Link>
          </Button>
        }
      />

      <RequestFiltersBar value={filterValues} onApply={(values) => updateParams({ ...values, page: 1 })} />

      {isError && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(error, 'Não foi possível carregar as solicitações')}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-label="Carregando solicitações">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
          <RequestsTable requests={data.data} onChangeStatus={setStatusTarget} onDelete={setDeleteTarget} />
        </div>
      ) : (
        !isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card py-16 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Nenhuma solicitação encontrada</p>
            <p className="text-sm text-muted-foreground">Ajuste os filtros ou registre uma nova solicitação.</p>
          </div>
        )
      )}

      {data && data.meta.total > 0 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={(page) => updateParams({ page })}
        />
      )}

      <ChangeStatusDialog request={statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)} />
      <DeleteRequestDialog request={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}
