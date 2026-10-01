import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { AUTH_COOKIE } from '../config/cookies';
import { verifyToken } from '../lib/jwt';

/** Exige um JWT válido no cookie de sessão e popula `req.user`. */
export const authenticate: RequestHandler = (req, res, next) => {
  const token: string | undefined = req.cookies?.[AUTH_COOKIE];
  if (!token) {
    res.status(401).json({ message: 'Não autenticado' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub), username: payload.username, name: payload.name, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Sessão expirada ou inválida' });
  }
};

/** Restringe a rota aos perfis informados. Deve ser usado após `authenticate`. */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso negado para o seu perfil' });
      return;
    }
    next();
  };
