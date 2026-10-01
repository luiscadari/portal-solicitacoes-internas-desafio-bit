import type { CookieOptions } from 'express';
import { env } from './env';

export const AUTH_COOKIE = 'portal_token';

/** Converte expressões como "8h", "30m", "1d" ou segundos em milissegundos. */
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd]?)$/.exec(value.trim());
  if (!match) return 8 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2] || 's';
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit as 's' | 'm' | 'h' | 'd'];
  return amount * factor;
}

export const authCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.COOKIE_SECURE,
  path: '/',
  maxAge: durationToMs(env.JWT_EXPIRES_IN),
});
