import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { requestRoutes } from './modules/requests/requests.routes';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

routes.use('/auth', authRoutes);
routes.use('/requests', requestRoutes);
routes.use('/dashboard', dashboardRoutes);
