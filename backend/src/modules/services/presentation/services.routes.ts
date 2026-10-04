import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { ServicesController } from './ServicesController';
import {
  availabilityQuerySchema,
  createServiceSchema,
  listServicesQuerySchema,
  serviceIdParamsSchema,
  updateServiceSchema,
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
  router.patch(
    '/services/:serviceId',
    authMiddleware,
    validate({ params: serviceIdParamsSchema, body: updateServiceSchema }),
    asyncHandler(controller.updateService),
  );
  router.delete(
    '/services/:serviceId',
    authMiddleware,
    validate({ params: serviceIdParamsSchema }),
    asyncHandler(controller.deleteService),
  );

  return router;
}
