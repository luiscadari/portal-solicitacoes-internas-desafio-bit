import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/contexts/AuthContext';
import { atendente, colaborador, renderWithProviders } from '@/test/utils';
import type { ServiceRequest } from '@/types';
import { RequestsTable } from '../RequestsTable';

jest.mock('@/contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const requests: ServiceRequest[] = [
  {
    id: 7,
    title: 'Notebook não liga',
    description: 'Descrição',
    category: 'TI',
    status: 'ABERTO',
    requesterId: colaborador.id,
    createdAt: new Date(2026, 8, 5, 10).toISOString(),
    updatedAt: new Date(2026, 8, 5, 10).toISOString(),
    requester: { id: colaborador.id, name: colaborador.name, username: colaborador.username },
  },
];

function mockUser(user: typeof colaborador) {
  mockedUseAuth.mockReturnValue({
    user,
    loading: false,
    isAttendant: user.role === 'ATENDENTE',
    login: jest.fn(),
    logout: jest.fn(),
  });
}

describe('RequestsTable', () => {
  it('exibe as colunas da listagem', () => {
    mockUser(colaborador);
    renderWithProviders(<RequestsTable requests={requests} onChangeStatus={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByRole('table');
    ['Código', 'Título', 'Categoria', 'Solicitante', 'Abertura', 'Status'].forEach((header) =>
      expect(within(table).getByRole('columnheader', { name: header })).toBeInTheDocument(),
    );
    expect(within(table).getByText('#0007')).toBeInTheDocument();
    expect(within(table).getByText('Notebook não liga')).toBeInTheDocument();
    expect(within(table).getByText('Carlos Colaborador')).toBeInTheDocument();
    expect(within(table).getByText('05/09/2026')).toBeInTheDocument();
    expect(within(table).getByText('Aberto')).toBeInTheDocument();
  });

  it('oferece editar/excluir ao solicitante e não oferece alterar status', async () => {
    mockUser(colaborador);
    const onDelete = jest.fn();
    renderWithProviders(<RequestsTable requests={requests} onChangeStatus={jest.fn()} onDelete={onDelete} />);

    await userEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /ações/i }));

    expect(await screen.findByRole('menuitem', { name: /editar/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /alterar status/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: /excluir/i }));
    expect(onDelete).toHaveBeenCalledWith(requests[0]);
  });

  it('oferece alterar status ao atendente', async () => {
    mockUser(atendente);
    const onChangeStatus = jest.fn();
    renderWithProviders(<RequestsTable requests={requests} onChangeStatus={onChangeStatus} onDelete={jest.fn()} />);

    await userEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /ações/i }));

    expect(screen.queryByRole('menuitem', { name: /editar/i })).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole('menuitem', { name: /alterar status/i }));
    expect(onChangeStatus).toHaveBeenCalledWith(requests[0]);
  });
});
