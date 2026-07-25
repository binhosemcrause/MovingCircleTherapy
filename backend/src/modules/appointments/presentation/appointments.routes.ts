import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { AppointmentsController } from './AppointmentsController';
import {
  appointmentIdParamsSchema,
  bookAppointmentSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentSchema,
} from './appointments.schemas';

export function createAppointmentsRoutes(controller: AppointmentsController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use('/appointments', authMiddleware);

  router.get('/appointments', validate({ query: listAppointmentsQuerySchema }), asyncHandler(controller.list));
  router.post('/appointments', validate({ body: bookAppointmentSchema }), asyncHandler(controller.book));
  router.get(
    '/appointments/:appointmentId',
    validate({ params: appointmentIdParamsSchema }),
    asyncHandler(controller.get),
  );
  router.patch(
    '/appointments/:appointmentId',
    validate({ params: appointmentIdParamsSchema, body: rescheduleAppointmentSchema }),
    asyncHandler(controller.reschedule),
  );
  router.delete(
    '/appointments/:appointmentId',
    validate({ params: appointmentIdParamsSchema }),
    asyncHandler(controller.cancel),
  );

  return router;
}
