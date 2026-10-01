import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { routerFuture } from '@/lib/router';
import { colaborador } from '@/test/utils';
import { ProtectedRoute } from '../ProtectedRoute';

jest.mock('@/contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderAt(path: string) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]} future={routerFuture}>
        <Routes>
          <Route path="/login" element={<p>Tela de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/solicitacoes" element={<p>Conteúdo protegido</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const base = { isAttendant: false, login: jest.fn(), logout: jest.fn() };

describe('ProtectedRoute', () => {
  it('redireciona para o login sem sessão', () => {
    mockedUseAuth.mockReturnValue({ ...base, user: null, loading: false });
    renderAt('/solicitacoes');
    expect(screen.getByText('Tela de login')).toBeInTheDocument();
  });

  it('exibe carregamento enquanto valida a sessão', () => {
    mockedUseAuth.mockReturnValue({ ...base, user: null, loading: true });
    renderAt('/solicitacoes');
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
  });

  it('renderiza o conteúdo para usuário autenticado', () => {
    mockedUseAuth.mockReturnValue({ ...base, user: colaborador, loading: false });
    renderAt('/solicitacoes');
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });
});
