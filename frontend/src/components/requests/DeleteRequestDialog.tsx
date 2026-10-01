import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { useDeleteRequest } from '@/hooks/useRequests';
import { formatCode } from '@/lib/format';
import { getErrorMessage } from '@/services/api';
import type { ServiceRequest } from '@/types';

interface Props {
  request: Pick<ServiceRequest, 'id' | 'title'> | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteRequestDialog({ request, onOpenChange, onDeleted }: Props) {
  const mutation = useDeleteRequest();

  const handleDelete = async () => {
    if (!request) return;
    try {
      await mutation.mutateAsync(request.id);
      toast.success('Solicitação excluída');
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível excluir a solicitação'));
    }
  };

  return (
    <AlertDialog open={!!request} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir solicitação?</AlertDialogTitle>
          <AlertDialogDescription>
            {request && `A solicitação ${formatCode(request.id)} · "${request.title}" será removida permanentemente.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
