import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import * as controller from './requests.controller';
import {
  createRequestSchema,
  idParamSchema,
  listRequestsSchema,
  updateRequestSchema,
  updateStatusSchema,
} from './requests.schemas';

export const requestRoutes = Router();

requestRoutes.use(authenticate);

requestRoutes.get('/', validate(listRequestsSchema, 'query'), asyncHandler(controller.list));
requestRoutes.post('/', validate(createRequestSchema), asyncHandler(controller.create));
requestRoutes.get('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.show));
requestRoutes.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateRequestSchema),
  asyncHandler(controller.update),
);
requestRoutes.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.remove));
requestRoutes.patch(
  '/:id/status',
  requireRole(Role.ATENDENTE),
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  asyncHandler(controller.updateStatus),
);
