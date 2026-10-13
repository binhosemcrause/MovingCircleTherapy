import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { TherapistsController } from './TherapistsController';
import {
  createTherapistSchema,
  listTherapistsQuerySchema,
  therapistAccountSchema,
  therapistIdParamsSchema,
  updateTherapistSchema,
} from './therapists.schemas';

// Reading the team is public; changing it is for admins.
export function createTherapistsRoutes(
  controller: TherapistsController,
  authMiddleware: RequestHandler,
  requireAdmin: RequestHandler,
): Router {
  const router = Router();

  router.get('/therapists', validate({ query: listTherapistsQuerySchema }), asyncHandler(controller.list));
  router.post(
    '/therapists',
    authMiddleware,
    requireAdmin,
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
    requireAdmin,
    validate({ params: therapistIdParamsSchema, body: updateTherapistSchema }),
    asyncHandler(controller.update),
  );
  router.delete(
    '/therapists/:therapistId',
    authMiddleware,
    requireAdmin,
    validate({ params: therapistIdParamsSchema }),
    asyncHandler(controller.delete),
  );

  router.put(
    '/therapists/:therapistId/account',
    authMiddleware,
    requireAdmin,
    validate({ params: therapistIdParamsSchema, body: therapistAccountSchema }),
    asyncHandler(controller.createAccount),
  );

  return router;
}
