import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { createAppointmentsModule } from './modules/appointments';
import { createAuthModule } from './modules/auth';
import { createDocsModule } from './modules/docs';
import { createEnquiriesModule } from './modules/enquiries';
import { createNotificationsModule } from './modules/notifications';
import { createProfileModule } from './modules/profile';
import { createResourcesModule } from './modules/resources';
import { createServicesModule } from './modules/services';
import { createTherapistsModule } from './modules/therapists';
import { errorHandler, notFoundHandler } from './shared/http/errorHandler';
import { createAuthMiddleware } from './shared/http/authMiddleware';
import { pool } from './shared/infrastructure/db';
import { BcryptPasswordHasher } from './shared/security/BcryptPasswordHasher';
import { JwtTokenService } from './shared/security/JwtTokenService';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  const tokenService = new JwtTokenService();
  const passwordHasher = new BcryptPasswordHasher();
  const authMiddleware = createAuthMiddleware(tokenService);

  const services = createServicesModule(pool, authMiddleware);
  const therapists = createTherapistsModule(pool, authMiddleware);
  const notifications = createNotificationsModule(pool, authMiddleware);

  const router = express.Router();
  router.use(createAuthModule(pool, passwordHasher, tokenService, authMiddleware));
  router.use(createProfileModule(pool, authMiddleware));
  router.use(services.router);
  router.use(therapists.router);
  router.use(
    createAppointmentsModule(
      pool,
      authMiddleware,
      services.serviceRepository,
      services.availabilityRepository,
      services.getServiceUseCase,
      therapists.therapistRepository,
      { appointmentBooked: (appointmentId) => notifications.emailAppointmentNotificationsUseCase.execute(appointmentId) },
    ),
  );
  router.use(notifications.router);
  router.use(createResourcesModule(pool));
  router.use(createEnquiriesModule(pool));

  app.use('/v1', router);
  app.use(createDocsModule());
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
