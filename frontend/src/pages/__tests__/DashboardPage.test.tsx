import { screen } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import { requestsService } from '@/services/requests.service';
import { atendente, renderWithProviders } from '@/test/utils';
import { DashboardPage } from '../DashboardPage';

jest.mock('@/contexts/AuthContext');
jest.mock('@/services/requests.service');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedService = requestsService as jest.Mocked<typeof requestsService>;

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: atendente,
      loading: false,
      isAttendant: true,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('exibe os indicadores retornados pela API', async () => {
    mockedService.dashboard.mockResolvedValue({
      total: 10,
      aberto: 4,
      emAtendimento: 3,
      concluido: 3,
      porCategoria: { TI: 3, RH: 2, COMPRAS: 2, FINANCEIRO: 2, INFRAESTRUTURA: 1 },
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByLabelText('Total de solicitações')).toHaveTextContent('10');
    expect(screen.getByLabelText('Abertas')).toHaveTextContent('4');
    expect(screen.getByLabelText('Em atendimento')).toHaveTextContent('3');
    expect(screen.getByLabelText('Concluídas')).toHaveTextContent('3');
    expect(screen.getByText('Olá, Ana!')).toBeInTheDocument();
  });

  it('exibe mensagem quando a API falha', async () => {
    mockedService.dashboard.mockRejectedValue(new Error('falha'));

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os indicadores');
  });
});
