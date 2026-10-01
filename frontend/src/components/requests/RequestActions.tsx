import { ArrowRightLeft, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { canChangeStatus, canModify } from '@/lib/permissions';
import type { ServiceRequest } from '@/types';

interface Props {
  request: ServiceRequest;
  onChangeStatus: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
}

export function RequestActions({ request, onChangeStatus, onDelete }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const modifiable = canModify(user, request);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Ações da solicitação ${request.id}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => navigate(`/solicitacoes/${request.id}`)}>
          <Eye />
          Detalhes
        </DropdownMenuItem>
        {canChangeStatus(user) && (
          <DropdownMenuItem onSelect={() => onChangeStatus(request)}>
            <ArrowRightLeft />
            Alterar status
          </DropdownMenuItem>
        )}
        {modifiable && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(`/solicitacoes/${request.id}/editar`)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(request)}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
