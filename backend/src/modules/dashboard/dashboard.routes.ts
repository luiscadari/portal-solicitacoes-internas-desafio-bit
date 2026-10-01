import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { asyncHandler } from '../../utils/async-handler';
import { getSummary } from './dashboard.service';

export const dashboardRoutes = Router();

dashboardRoutes.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(await getSummary(req.user!));
  }),
);
