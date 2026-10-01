import { useState } from 'react';
import { ArrowLeft, ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChangeStatusDialog } from '@/components/requests/ChangeStatusDialog';
import { DeleteRequestDialog } from '@/components/requests/DeleteRequestDialog';
import { StatusBadge } from '@/components/requests/StatusBadge';
import { StatusTimeline } from '@/components/requests/StatusTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRequest } from '@/hooks/useRequests';
import { CATEGORY_LABELS } from '@/lib/constants';
import { formatCode, formatDateTime } from '@/lib/format';
import { canChangeStatus, canModify } from '@/lib/permissions';
import { getErrorMessage } from '@/services/api';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function RequestDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useRequest(id);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/solicitacoes">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(error, 'Solicitação não encontrada')}
        </p>
      </div>
    );
  }

  const modifiable = canModify(user, data);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link to="/solicitacoes">
          <ArrowLeft />
          Solicitações
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{formatCode(data.id)}</span>
            <StatusBadge status={data.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canChangeStatus(user) && (
            <Button onClick={() => setStatusOpen(true)}>
              <ArrowRightLeft />
              Alterar status
            </Button>
          )}
          {modifiable && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/solicitacoes/${data.id}/editar`}>
                  <Pencil />
                  Editar
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria">{CATEGORY_LABELS[data.category]}</Field>
              <Field label="Solicitante">{data.requester.name}</Field>
              <Field label="Data de abertura">{formatDateTime(data.createdAt)}</Field>
              <Field label="Última atualização">{formatDateTime(data.updatedAt)}</Field>
            </dl>
            <div className="space-y-1">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descrição</h2>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{data.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline history={data.history ?? []} />
          </CardContent>
        </Card>
      </div>

      <ChangeStatusDialog request={statusOpen ? data : null} onOpenChange={setStatusOpen} />
      <DeleteRequestDialog
        request={deleteOpen ? data : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/solicitacoes', { replace: true })}
      />
    </div>
  );
}
