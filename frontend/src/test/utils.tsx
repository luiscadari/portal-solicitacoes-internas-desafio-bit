import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { routerFuture } from '@/lib/router';
import type { User } from '@/types';

export const colaborador: User = { id: 1, username: 'colaborador', name: 'Carlos Colaborador', role: 'COLABORADOR' };
export const atendente: User = { id: 3, username: 'atendente', name: 'Ana Atendente', role: 'ATENDENTE' };

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]} future={routerFuture}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
