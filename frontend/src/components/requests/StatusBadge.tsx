import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { RequestStatus } from '@/types';

const STATUS_STYLES: Record<RequestStatus, string> = {
  ABERTO: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  EM_ATENDIMENTO: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  CONCLUIDO: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
};

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('whitespace-nowrap', STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
