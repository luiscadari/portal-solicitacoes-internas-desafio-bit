import type { Request, Response } from 'express';
import type {
  CreateRequestInput,
  ListRequestsQuery,
  UpdateRequestInput,
  UpdateStatusInput,
} from './requests.schemas';
import * as service from './requests.service';

const idOf = (res: Response) => (res.locals.params as { id: number }).id;

export async function list(req: Request, res: Response) {
  res.json(await service.list(req.user!, res.locals.query as ListRequestsQuery));
}

export async function show(req: Request, res: Response) {
  res.json(await service.getById(req.user!, idOf(res)));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.create(req.user!, res.locals.body as CreateRequestInput));
}

export async function update(req: Request, res: Response) {
  res.json(await service.update(req.user!, idOf(res), res.locals.body as UpdateRequestInput));
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.user!, idOf(res));
  res.status(204).send();
}

export async function updateStatus(req: Request, res: Response) {
  res.json(await service.updateStatus(req.user!, idOf(res), res.locals.body as UpdateStatusInput));
}
