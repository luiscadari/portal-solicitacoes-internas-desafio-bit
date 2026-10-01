import request from 'supertest';
import { Category, RequestStatus } from '@prisma/client';
import { createApp } from '../src/app';
import { atendente, authCookie, colaborador, makeRequest, outroColaborador } from './helpers';
import { prismaMock } from './prisma-mock';

const app = createApp();

describe('Solicitações', () => {
  it('exige autenticação', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
  });

  describe('GET /api/requests', () => {
    it('lista apenas as solicitações do colaborador, com paginação', async () => {
      prismaMock.request.count.mockResolvedValue(1);
      prismaMock.request.findMany.mockResolvedValue([makeRequest()] as never);

      const res = await request(app).get('/api/requests?page=1&pageSize=5').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({ page: 1, pageSize: 5, total: 1, totalPages: 1 });
      expect(prismaMock.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { requesterId: colaborador.id }, skip: 0, take: 5 }),
      );
    });

    it('atendente lista todas as solicitações e aplica os filtros', async () => {
      prismaMock.request.count.mockResolvedValue(0);
      prismaMock.request.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/requests?category=TI&status=ABERTO&q=notebook&from=2026-09-01&to=2026-09-30')
        .set('Cookie', authCookie(atendente));

      expect(res.status).toBe(200);
      const { where } = prismaMock.request.findMany.mock.calls[0][0]!;
      expect(where).toEqual({
        category: 'TI',
        status: 'ABERTO',
        title: { contains: 'notebook', mode: 'insensitive' },
        createdAt: { gte: new Date('2026-09-01'), lt: new Date('2026-10-01') },
      });
    });

    it('rejeita filtros inválidos', async () => {
      const res = await request(app)
        .get('/api/requests?status=PENDENTE&from=2026-10-10&to=2026-10-01')
        .set('Cookie', authCookie(atendente));

      expect(res.status).toBe(400);
      expect(res.body.details).toHaveProperty('status');
    });
  });

  describe('GET /api/requests/:id', () => {
    it('retorna os detalhes com histórico', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);

      const res = await request(app).get('/api/requests/10').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(10);
    });

    it('impede colaborador de ver solicitação de outra pessoa', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);

      const res = await request(app).get('/api/requests/10').set('Cookie', authCookie(outroColaborador));

      expect(res.status).toBe(403);
    });

    it('retorna 404 quando não existe', async () => {
      prismaMock.request.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/requests/999').set('Cookie', authCookie(atendente));

      expect(res.status).toBe(404);
    });

    it('retorna 400 para código inválido', async () => {
      const res = await request(app).get('/api/requests/abc').set('Cookie', authCookie(atendente));
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/requests', () => {
    it('cria solicitação com campos automáticos (solicitante e status Aberto)', async () => {
      prismaMock.request.create.mockResolvedValue(makeRequest() as never);

      const res = await request(app)
        .post('/api/requests')
        .set('Cookie', authCookie(colaborador))
        .send({ title: 'Notebook não liga', description: 'Meu notebook não liga.', category: 'TI', status: 'CONCLUIDO' });

      expect(res.status).toBe(201);
      const { data } = prismaMock.request.create.mock.calls[0][0];
      expect(data).toMatchObject({
        title: 'Notebook não liga',
        category: Category.TI,
        status: RequestStatus.ABERTO,
        requesterId: colaborador.id,
        history: { create: { fromStatus: null, toStatus: RequestStatus.ABERTO, changedById: colaborador.id } },
      });
    });

    it('valida título, descrição e categoria', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Cookie', authCookie(colaborador))
        .send({ title: 'a', description: '', category: 'MARKETING' });

      expect(res.status).toBe(400);
      expect(Object.keys(res.body.details)).toEqual(expect.arrayContaining(['title', 'description', 'category']));
      expect(prismaMock.request.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/requests/:id', () => {
    const payload = { title: 'Novo título', description: 'Nova descrição', category: 'RH' };

    it('permite ao solicitante editar solicitação aberta', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);
      prismaMock.request.update.mockResolvedValue(makeRequest(payload) as never);

      const res = await request(app).put('/api/requests/10').set('Cookie', authCookie(colaborador)).send(payload);

      expect(res.status).toBe(200);
      expect(prismaMock.request.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 10 }, data: payload }));
    });

    it('bloqueia edição de solicitação que não está aberta', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest({ status: RequestStatus.EM_ATENDIMENTO }) as never);

      const res = await request(app).put('/api/requests/10').set('Cookie', authCookie(colaborador)).send(payload);

      expect(res.status).toBe(409);
      expect(prismaMock.request.update).not.toHaveBeenCalled();
    });

    it('bloqueia edição por quem não é o solicitante', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);

      const res = await request(app).put('/api/requests/10').set('Cookie', authCookie(atendente)).send(payload);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('permite ao solicitante excluir solicitação aberta', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);
      prismaMock.request.delete.mockResolvedValue(makeRequest() as never);

      const res = await request(app).delete('/api/requests/10').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(204);
      expect(prismaMock.request.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it('bloqueia exclusão de solicitação concluída', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest({ status: RequestStatus.CONCLUIDO }) as never);

      const res = await request(app).delete('/api/requests/10').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(409);
      expect(prismaMock.request.delete).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/requests/:id/status', () => {
    it('permite ao atendente alterar o status e registra o histórico', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);
      prismaMock.request.update.mockResolvedValue(makeRequest({ status: RequestStatus.EM_ATENDIMENTO }) as never);

      const res = await request(app)
        .patch('/api/requests/10/status')
        .set('Cookie', authCookie(atendente))
        .send({ status: 'EM_ATENDIMENTO' });

      expect(res.status).toBe(200);
      expect(prismaMock.request.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 10 },
          data: {
            status: RequestStatus.EM_ATENDIMENTO,
            history: {
              create: { fromStatus: RequestStatus.ABERTO, toStatus: RequestStatus.EM_ATENDIMENTO, changedById: atendente.id },
            },
          },
        }),
      );
    });

    it('impede colaborador de alterar status', async () => {
      const res = await request(app)
        .patch('/api/requests/10/status')
        .set('Cookie', authCookie(colaborador))
        .send({ status: 'CONCLUIDO' });

      expect(res.status).toBe(403);
      expect(prismaMock.request.update).not.toHaveBeenCalled();
    });

    it('rejeita status igual ao atual', async () => {
      prismaMock.request.findUnique.mockResolvedValue(makeRequest() as never);

      const res = await request(app)
        .patch('/api/requests/10/status')
        .set('Cookie', authCookie(atendente))
        .send({ status: 'ABERTO' });

      expect(res.status).toBe(409);
    });

    it('rejeita status inválido', async () => {
      const res = await request(app)
        .patch('/api/requests/10/status')
        .set('Cookie', authCookie(atendente))
        .send({ status: 'CANCELADO' });

      expect(res.status).toBe(400);
    });
  });
});
