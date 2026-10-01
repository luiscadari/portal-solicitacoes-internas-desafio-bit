import request from 'supertest';
import { createApp } from '../src/app';
import { atendente, authCookie, colaborador } from './helpers';
import { prismaMock } from './prisma-mock';

const app = createApp();

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    (prismaMock.request.groupBy as unknown as jest.Mock)
      .mockResolvedValueOnce([
        { status: 'ABERTO', _count: { _all: 4 } },
        { status: 'EM_ATENDIMENTO', _count: { _all: 2 } },
        { status: 'CONCLUIDO', _count: { _all: 1 } },
      ] as never)
      .mockResolvedValueOnce([
        { category: 'TI', _count: { _all: 5 } },
        { category: 'RH', _count: { _all: 2 } },
      ] as never);
  });

  it('retorna os indicadores consolidados', async () => {
    const res = await request(app).get('/api/dashboard').set('Cookie', authCookie(atendente));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 7,
      aberto: 4,
      emAtendimento: 2,
      concluido: 1,
      porCategoria: { TI: 5, RH: 2, COMPRAS: 0, FINANCEIRO: 0, INFRAESTRUTURA: 0 },
    });
    expect(prismaMock.request.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it('restringe os indicadores às solicitações do colaborador', async () => {
    await request(app).get('/api/dashboard').set('Cookie', authCookie(colaborador));

    expect(prismaMock.request.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { requesterId: colaborador.id } }),
    );
  });

  it('exige autenticação', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});
