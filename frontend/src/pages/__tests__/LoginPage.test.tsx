import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { colaborador, renderWithProviders } from '@/test/utils';
import { LoginPage } from '../LoginPage';

jest.mock('@/contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setup(login = jest.fn()) {
  mockedUseAuth.mockReturnValue({ user: null, loading: false, isAttendant: false, login, logout: jest.fn() });
  renderWithProviders(<LoginPage />, { route: '/login' });
  return { login };
}

describe('LoginPage', () => {
  it('exibe os campos de usuário e senha', () => {
    setup();
    expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('valida campos obrigatórios', async () => {
    const { login } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o usuário')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('envia as credenciais', async () => {
    const { login } = setup(jest.fn().mockResolvedValue(colaborador));

    await userEvent.type(screen.getByLabelText('Usuário'), 'colaborador');
    await userEvent.type(screen.getByLabelText('Senha'), 'colaborador123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('colaborador', 'colaborador123'));
  });

  it('exibe a mensagem de erro da API', async () => {
    const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
      status: 401,
      statusText: 'Unauthorized',
      data: { message: 'Usuário ou senha inválidos' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    setup(jest.fn().mockRejectedValue(error));

    await userEvent.type(screen.getByLabelText('Usuário'), 'colaborador');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuário ou senha inválidos');
  });
});
