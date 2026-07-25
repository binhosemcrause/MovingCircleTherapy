import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { ResourcesController } from './ResourcesController';
import { listResourcesQuerySchema, resourceIdParamsSchema } from './resources.schemas';

export function createResourcesRoutes(controller: ResourcesController): Router {
  const router = Router();

  router.get('/resources', validate({ query: listResourcesQuerySchema }), asyncHandler(controller.list));
  router.get(
    '/resources/:resourceId',
    validate({ params: resourceIdParamsSchema }),
    asyncHandler(controller.get),
  );

  return router;
}
