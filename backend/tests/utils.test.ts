import { durationToMs } from '../src/config/cookies';
import { endBoundary } from '../src/modules/requests/requests.schemas';

describe('durationToMs', () => {
  it.each([
    ['30s', 30_000],
    ['15m', 900_000],
    ['8h', 28_800_000],
    ['1d', 86_400_000],
    ['60', 60_000],
  ])('converte %s', (input, expected) => {
    expect(durationToMs(input)).toBe(expected);
  });

  it('usa 8h como padrão para valores inválidos', () => {
    expect(durationToMs('abc')).toBe(28_800_000);
  });
});

describe('endBoundary', () => {
  it('inclui o dia inteiro quando a data não possui hora', () => {
    expect(endBoundary('2026-09-30').toISOString()).toBe('2026-10-01T00:00:00.000Z');
  });

  it('mantém o instante informado quando há hora (limite inclusivo)', () => {
    expect(endBoundary('2026-09-30T23:59:59.999Z').toISOString()).toBe('2026-10-01T00:00:00.000Z');
  });
});
