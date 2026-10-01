import axios, { AxiosError } from 'axios';

/**
 * Cliente HTTP da aplicação. A API é servida na mesma origem sob /api
 * (proxy do Vite em desenvolvimento e do Nginx no Docker), e a sessão
 * trafega no cookie httpOnly enviado automaticamente pelo navegador.
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

type UnauthorizedListener = () => void;
let onUnauthorized: UnauthorizedListener | null = null;

export function setUnauthorizedListener(listener: UnauthorizedListener | null) {
  onUnauthorized = listener;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrai uma mensagem amigável de um erro da API. */
export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) return 'Não foi possível conectar ao servidor';
  }
  return fallback;
}
