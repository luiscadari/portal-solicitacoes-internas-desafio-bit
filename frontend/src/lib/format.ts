import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/** Formata o código da solicitação com zeros à esquerda (ex.: #0007). */
export function formatCode(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

/**
 * Converte uma data local (AAAA-MM-DD, vinda de <input type="date">) no
 * instante ISO de início ou fim do dia no fuso horário do navegador.
 */
export function localDayBoundary(date: string, boundary: 'start' | 'end'): string {
  const [year, month, day] = date.split('-').map(Number);
  const value =
    boundary === 'start' ? new Date(year, month - 1, day, 0, 0, 0, 0) : new Date(year, month - 1, day, 23, 59, 59, 999);
  return value.toISOString();
}
