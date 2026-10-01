import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateStatus } from '@/hooks/useRequests';
import { STATUSES, STATUS_LABELS } from '@/lib/constants';
import { formatCode } from '@/lib/format';
import { getErrorMessage } from '@/services/api';
import type { RequestStatus, ServiceRequest } from '@/types';

interface Props {
  request: Pick<ServiceRequest, 'id' | 'title' | 'status'> | null;
  onOpenChange: (open: boolean) => void;
}

export function ChangeStatusDialog({ request, onOpenChange }: Props) {
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const mutation = useUpdateStatus();

  useEffect(() => {
    if (request) setStatus('');
  }, [request]);

  const handleConfirm = async () => {
    if (!request || !status) return;
    try {
      await mutation.mutateAsync({ id: request.id, status });
      toast.success(`Status alterado para "${STATUS_LABELS[status]}"`);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível alterar o status'));
    }
  };

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar status</DialogTitle>
          <DialogDescription>{request && `${formatCode(request.id)} · ${request.title}`}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-status">Novo status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
            <SelectTrigger id="new-status" aria-label="Novo status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.filter((s) => s !== request?.status).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {request && <p className="text-xs text-muted-foreground">Status atual: {STATUS_LABELS[request.status]}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!status || mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
