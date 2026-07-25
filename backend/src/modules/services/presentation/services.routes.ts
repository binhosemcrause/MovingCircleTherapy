import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { ServicesController } from './ServicesController';
import {
  availabilityQuerySchema,
  createServiceSchema,
  listServicesQuerySchema,
  serviceIdParamsSchema,
} from './services.schemas';

export function createServicesRoutes(controller: ServicesController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.get('/services', validate({ query: listServicesQuerySchema }), asyncHandler(controller.listServices));
  router.post(
    '/services',
    authMiddleware,
    validate({ body: createServiceSchema }),
    asyncHandler(controller.createService),
  );
  router.get(
    '/services/:serviceId',
    validate({ params: serviceIdParamsSchema }),
    asyncHandler(controller.getService),
  );
  router.get(
    '/services/:serviceId/availability',
    validate({ params: serviceIdParamsSchema, query: availabilityQuerySchema }),
    asyncHandler(controller.listAvailability),
  );

  return router;
}
