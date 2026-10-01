import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CATEGORY_LABELS } from '@/lib/constants';
import { formatCode, formatDate } from '@/lib/format';
import type { ServiceRequest } from '@/types';
import { RequestActions } from './RequestActions';
import { StatusBadge } from './StatusBadge';

interface Props {
  requests: ServiceRequest[];
  onChangeStatus: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
}

/** Tabela no desktop e lista de cartões em telas pequenas. */
export function RequestsTable({ requests, onChangeStatus, onDelete }: Props) {
  return (
    <>
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 pl-4">Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Abertura</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-14">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{formatCode(request.id)}</TableCell>
                <TableCell className="max-w-xs">
                  <Link to={`/solicitacoes/${request.id}`} className="line-clamp-1 font-medium hover:underline">
                    {request.title}
                  </Link>
                </TableCell>
                <TableCell>{CATEGORY_LABELS[request.category]}</TableCell>
                <TableCell>{request.requester.name}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <RequestActions request={request} onChangeStatus={onChangeStatus} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {requests.map((request) => (
          <li key={request.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs text-muted-foreground">{formatCode(request.id)}</span>
                <Link to={`/solicitacoes/${request.id}`} className="block font-medium leading-snug hover:underline">
                  {request.title}
                </Link>
              </div>
              <RequestActions request={request} onChangeStatus={onChangeStatus} onDelete={onDelete} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <StatusBadge status={request.status} />
              <span>{CATEGORY_LABELS[request.category]}</span>
              <span>{request.requester.name}</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
