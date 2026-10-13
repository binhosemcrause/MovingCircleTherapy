import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import type { GetServiceUseCase } from '../services/application/GetServiceUseCase';
import type { IAvailabilityRepository } from '../services/domain/IAvailabilityRepository';
import type { IServiceRepository } from '../services/domain/IServiceRepository';
import type { ITherapistRepository } from '../therapists/domain/ITherapistRepository';
import { PgUserRepository } from '../users/infrastructure/PgUserRepository';
import { BookAppointmentUseCase } from './application/BookAppointmentUseCase';
import { CancelAppointmentUseCase } from './application/CancelAppointmentUseCase';
import { GetAppointmentUseCase } from './application/GetAppointmentUseCase';
import { ListAssignedAppointmentsUseCase } from './application/ListAssignedAppointmentsUseCase';
import { ListAppointmentsUseCase } from './application/ListAppointmentsUseCase';
import { RescheduleAppointmentUseCase } from './application/RescheduleAppointmentUseCase';
import type { IBookingNotifier } from './domain/IBookingNotifier';
import { PgAppointmentRepository } from './infrastructure/PgAppointmentRepository';
import { AppointmentsController } from './presentation/AppointmentsController';
import { createAppointmentsRoutes } from './presentation/appointments.routes';

export function createAppointmentsModule(
  pool: Pool,
  authMiddleware: RequestHandler,
  serviceRepository: IServiceRepository,
  availabilityRepository: IAvailabilityRepository,
  getServiceUseCase: GetServiceUseCase,
  therapistRepository: ITherapistRepository,
  bookingNotifier: IBookingNotifier,
): Router {
  const appointmentRepository = new PgAppointmentRepository(pool);

  const controller = new AppointmentsController(
    new ListAppointmentsUseCase(appointmentRepository),
    new GetAppointmentUseCase(appointmentRepository),
    new BookAppointmentUseCase(
      appointmentRepository,
      serviceRepository,
      therapistRepository,
      new PgUserRepository(pool),
      bookingNotifier,
    ),
    new RescheduleAppointmentUseCase(appointmentRepository, availabilityRepository),
    new CancelAppointmentUseCase(appointmentRepository),
    new ListAssignedAppointmentsUseCase(appointmentRepository),
    { getServiceUseCase, therapistRepository },
  );

  return createAppointmentsRoutes(controller, authMiddleware);
}
