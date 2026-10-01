import { Category, RequestStatus, Role } from '@prisma/client';
import { SEED_USERS, TEMPLATES, createRandom, generateRequests } from '../prisma/seed-data';

describe('dados fictícios do seed', () => {
  const now = new Date('2026-10-01T12:00:00.000Z');
  const requests = generateRequests({ now });

  it('mantém os usuários de teste documentados e usernames únicos', () => {
    const usernames = SEED_USERS.map((u) => u.username);
    expect(new Set(usernames).size).toBe(usernames.length);
    expect(SEED_USERS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'colaborador', password: 'colaborador123', role: Role.COLABORADOR }),
        expect.objectContaining({ username: 'maria', password: 'maria123', role: Role.COLABORADOR }),
        expect.objectContaining({ username: 'atendente', password: 'atendente123', role: Role.ATENDENTE }),
      ]),
    );
  });

  it('possui modelos de demanda para todas as categorias', () => {
    Object.values(Category).forEach((category) => expect(TEMPLATES[category].length).toBeGreaterThan(0));
  });

  it('gera o volume esperado, cobrindo todas as categorias e status', () => {
    expect(requests).toHaveLength(80);
    expect(new Set(requests.map((r) => r.category))).toEqual(new Set(Object.values(Category)));
    expect(new Set(requests.map((r) => r.status))).toEqual(new Set(Object.values(RequestStatus)));
  });

  it('é determinístico para a mesma semente e data', () => {
    expect(generateRequests({ now })).toEqual(requests);
    expect(createRandom(1)()).toBe(createRandom(1)());
  });

  it('gera datas dentro da janela e nunca no futuro', () => {
    const start = now.getTime() - 91 * 24 * 60 * 60 * 1000;
    requests.forEach((r) => {
      expect(r.createdAt.getTime()).toBeGreaterThanOrEqual(start);
      expect(r.createdAt.getTime()).toBeLessThan(now.getTime());
      expect(r.updatedAt.getTime()).toBeLessThan(now.getTime());
    });
  });

  it('gera histórico coerente com o status atual', () => {
    const colaboradores = new Set(SEED_USERS.filter((u) => u.role === Role.COLABORADOR).map((u) => u.username));
    const atendentes = new Set(SEED_USERS.filter((u) => u.role === Role.ATENDENTE).map((u) => u.username));

    requests.forEach((r) => {
      expect(colaboradores.has(r.requester)).toBe(true);
      expect(r.history[0]).toMatchObject({ fromStatus: null, toStatus: RequestStatus.ABERTO, changedBy: r.requester });
      expect(r.history[r.history.length - 1].toStatus).toBe(r.status);
      expect(r.updatedAt).toEqual(r.history[r.history.length - 1].changedAt);

      for (let i = 1; i < r.history.length; i++) {
        expect(r.history[i].fromStatus).toBe(r.history[i - 1].toStatus);
        expect(r.history[i].changedAt.getTime()).toBeGreaterThan(r.history[i - 1].changedAt.getTime());
        expect(atendentes.has(r.history[i].changedBy)).toBe(true);
      }
    });
  });
});
