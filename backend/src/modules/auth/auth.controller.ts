import type { Request, Response } from 'express';
import { AUTH_COOKIE, authCookieOptions } from '../../config/cookies';
import type { LoginInput } from './auth.schemas';
import * as authService from './auth.service';

export async function login(_req: Request, res: Response) {
  const { token, user } = await authService.login(res.locals.body as LoginInput);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  res.json({ user });
}

export function logout(_req: Request, res: Response) {
  const { maxAge: _maxAge, ...options } = authCookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await authService.getProfile(req.user!.id);
  res.json({ user });
}
