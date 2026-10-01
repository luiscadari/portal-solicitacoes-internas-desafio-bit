import { formatCode, formatDate, formatDateTime, localDayBoundary } from './format';

describe('format', () => {
  it('formata o código com zeros à esquerda', () => {
    expect(formatCode(7)).toBe('#0007');
    expect(formatCode(12345)).toBe('#12345');
  });

  it('formata datas no padrão brasileiro', () => {
    const local = new Date(2026, 8, 5, 14, 30).toISOString();
    expect(formatDate(local)).toBe('05/09/2026');
    expect(formatDateTime(local)).toBe('05/09/2026 às 14:30');
  });

  it('converte datas locais no início e no fim do dia', () => {
    expect(new Date(localDayBoundary('2026-09-05', 'start')).getTime()).toBe(
      new Date(2026, 8, 5, 0, 0, 0, 0).getTime(),
    );
    expect(new Date(localDayBoundary('2026-09-05', 'end')).getTime()).toBe(
      new Date(2026, 8, 5, 23, 59, 59, 999).getTime(),
    );
  });
});
