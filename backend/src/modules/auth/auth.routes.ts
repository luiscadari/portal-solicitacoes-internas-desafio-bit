import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import * as controller from './auth.controller';
import { loginSchema } from './auth.schemas';

// Limita tentativas de login malsucedidas por IP (proteção contra força bruta).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.LOGIN_RATE_LIMIT,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login));
authRoutes.post('/logout', controller.logout);
authRoutes.get('/me', authenticate, asyncHandler(controller.me));
