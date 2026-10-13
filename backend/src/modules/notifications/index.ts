import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import { env } from '../../config/env';
import { EmailAppointmentNotificationsUseCase } from './application/EmailAppointmentNotificationsUseCase';
import { ListMyNotificationsUseCase } from './application/ListMyNotificationsUseCase';
import { MarkNotificationsReadUseCase } from './application/MarkNotificationsReadUseCase';
import { PgTherapistNotificationRepository } from './infrastructure/PgTherapistNotificationRepository';
import { ResendEmailSender } from './infrastructure/ResendEmailSender';
import { NotificationsController } from './presentation/NotificationsController';
import { createNotificationsRoutes } from './presentation/notifications.routes';

export interface NotificationsModule {
  router: Router;
  emailAppointmentNotificationsUseCase: EmailAppointmentNotificationsUseCase;
}

export function createNotificationsModule(pool: Pool, authMiddleware: RequestHandler): NotificationsModule {
  const notificationRepository = new PgTherapistNotificationRepository(pool);

  const emailSender =
    env.RESEND_API_KEY && env.EMAIL_FROM ? new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM) : null;
  if (!emailSender) {
    console.warn('RESEND_API_KEY / EMAIL_FROM not set: therapists will not be emailed about bookings.');
  }

  const controller = new NotificationsController(
    new ListMyNotificationsUseCase(notificationRepository),
    new MarkNotificationsReadUseCase(notificationRepository),
  );

  return {
    router: createNotificationsRoutes(controller, authMiddleware),
    emailAppointmentNotificationsUseCase: new EmailAppointmentNotificationsUseCase(notificationRepository, emailSender),
  };
}
