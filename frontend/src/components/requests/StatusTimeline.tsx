import { STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { StatusHistoryEntry } from '@/types';
import { StatusBadge } from './StatusBadge';

export function StatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l pl-6">
      {history.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary ring-2 ring-primary/30" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.toStatus} />
            <span className="text-sm">
              {entry.fromStatus ? `alterado de "${STATUS_LABELS[entry.fromStatus]}"` : 'solicitação aberta'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(entry.changedAt)} · por {entry.changedBy.name}
          </p>
        </li>
      ))}
    </ol>
  );
}
