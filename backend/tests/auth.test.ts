import bcrypt from 'bcryptjs';
import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { AUTH_COOKIE } from '../src/config/cookies';
import { authCookie, colaborador } from './helpers';
import { prismaMock } from './prisma-mock';

const app = createApp();

describe('Autenticação', () => {
  const passwordHash = bcrypt.hashSync('colaborador123', 4);
  const dbUser = { ...colaborador, passwordHash, createdAt: new Date() };

  describe('POST /api/auth/login', () => {
    it('autentica com credenciais válidas e define cookie httpOnly', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'colaborador', password: 'colaborador123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({
        id: 1,
        username: 'colaborador',
        name: 'Carlos Colaborador',
        role: Role.COLABORADOR,
      });
      expect(res.body.user.passwordHash).toBeUndefined();
      const cookie = String(res.headers['set-cookie']);
      expect(cookie).toContain(`${AUTH_COOKIE}=`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('rejeita senha incorreta com 401', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);

      const res = await request(app).post('/api/auth/login').send({ username: 'colaborador', password: 'errada' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Usuário ou senha inválidos');
      expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('rejeita usuário inexistente com 401', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({ username: 'ninguem', password: '123' });

      expect(res.status).toBe(401);
    });

    it('valida campos obrigatórios', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.details).toHaveProperty('username');
      expect(res.body.details).toHaveProperty('password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna 401 sem cookie de sessão', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('retorna 401 com token inválido', async () => {
      const res = await request(app).get('/api/auth/me').set('Cookie', `${AUTH_COOKIE}=token-invalido`);
      expect(res.status).toBe(401);
    });

    it('retorna o usuário autenticado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(colaborador as never);

      const res = await request(app).get('/api/auth/me').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('colaborador');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('remove o cookie de sessão', async () => {
      const res = await request(app).post('/api/auth/logout').set('Cookie', authCookie(colaborador));

      expect(res.status).toBe(204);
      expect(String(res.headers['set-cookie'])).toMatch(new RegExp(`${AUTH_COOKIE}=;.*Expires=Thu, 01 Jan 1970`));
    });
  });
});
