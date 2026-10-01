import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestForm } from '@/components/requests/RequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRequest, useUpdateRequest } from '@/hooks/useRequests';
import { formatCode } from '@/lib/format';
import { canModify } from '@/lib/permissions';
import { getErrorMessage } from '@/services/api';

export function EditRequestPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useRequest(id);
  const mutation = useUpdateRequest(id);

  if (isLoading) return <Skeleton className="mx-auto h-96 max-w-2xl" />;

  if (isError || !data) {
    return (
      <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        {getErrorMessage(error, 'Solicitação não encontrada')}
      </p>
    );
  }

  if (!canModify(user, data)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p role="alert" className="rounded-md bg-amber-100 p-3 text-sm text-amber-900">
          Apenas o solicitante pode editar, e somente enquanto a solicitação estiver com status Aberto.
        </p>
        <Button variant="outline" asChild>
          <Link to={`/solicitacoes/${id}`}>Ver detalhes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={`Editar solicitação ${formatCode(data.id)}`} />
      <Card>
        <CardContent className="pt-6">
          <RequestForm
            defaultValues={{ title: data.title, description: data.description, category: data.category }}
            submitLabel="Salvar alterações"
            onCancel={() => navigate(-1)}
            onSubmit={async (values) => {
              try {
                await mutation.mutateAsync(values);
                toast.success('Solicitação atualizada');
                navigate(`/solicitacoes/${id}`);
              } catch (err) {
                toast.error(getErrorMessage(err, 'Não foi possível atualizar a solicitação'));
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
