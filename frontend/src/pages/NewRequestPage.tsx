import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestForm } from '@/components/requests/RequestForm';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateRequest } from '@/hooks/useRequests';
import { formatCode } from '@/lib/format';
import { getErrorMessage } from '@/services/api';

export function NewRequestPage() {
  const navigate = useNavigate();
  const mutation = useCreateRequest();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nova solicitação"
        description="Data de abertura, solicitante e status (Aberto) são preenchidos automaticamente."
      />
      <Card>
        <CardContent className="pt-6">
          <RequestForm
            submitLabel="Criar solicitação"
            onCancel={() => navigate(-1)}
            onSubmit={async (values) => {
              try {
                const created = await mutation.mutateAsync(values);
                toast.success(`Solicitação ${formatCode(created.id)} criada com sucesso`);
                navigate(`/solicitacoes/${created.id}`);
              } catch (error) {
                toast.error(getErrorMessage(error, 'Não foi possível criar a solicitação'));
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
