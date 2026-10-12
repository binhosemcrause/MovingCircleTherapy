import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { TherapistsController } from './TherapistsController';
import {
  createTherapistSchema,
  listTherapistsQuerySchema,
  therapistIdParamsSchema,
  updateTherapistSchema,
} from './therapists.schemas';

export function createTherapistsRoutes(controller: TherapistsController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.get('/therapists', validate({ query: listTherapistsQuerySchema }), asyncHandler(controller.list));
  router.post(
    '/therapists',
    authMiddleware,
    validate({ body: createTherapistSchema }),
    asyncHandler(controller.create),
  );
  router.get(
    '/therapists/:therapistId',
    validate({ params: therapistIdParamsSchema }),
    asyncHandler(controller.get),
  );
  router.patch(
    '/therapists/:therapistId',
    authMiddleware,
    validate({ params: therapistIdParamsSchema, body: updateTherapistSchema }),
    asyncHandler(controller.update),
  );
  router.delete(
    '/therapists/:therapistId',
    authMiddleware,
    validate({ params: therapistIdParamsSchema }),
    asyncHandler(controller.delete),
  );

  return router;
}
