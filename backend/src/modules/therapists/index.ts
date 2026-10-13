import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import { env } from '../../config/env';
import type { PasswordHasher } from '../../shared/security/PasswordHasher';
import { PgUserRepository } from '../users/infrastructure/PgUserRepository';
import { CreateTherapistAccountUseCase } from './application/CreateTherapistAccountUseCase';
import { CreateTherapistUseCase } from './application/CreateTherapistUseCase';
import { DeleteTherapistUseCase } from './application/DeleteTherapistUseCase';
import { GetTherapistUseCase } from './application/GetTherapistUseCase';
import { ListTherapistsUseCase } from './application/ListTherapistsUseCase';
import { UpdateTherapistUseCase } from './application/UpdateTherapistUseCase';
import { PgTherapistRepository } from './infrastructure/PgTherapistRepository';
import { TherapistsController } from './presentation/TherapistsController';
import { createTherapistsRoutes } from './presentation/therapists.routes';

export interface TherapistsModule {
  router: Router;
  therapistRepository: PgTherapistRepository;
}

export function createTherapistsModule(
  pool: Pool,
  authMiddleware: RequestHandler,
  requireAdmin: RequestHandler,
  passwordHasher: PasswordHasher,
): TherapistsModule {
  const therapistRepository = new PgTherapistRepository(pool);

  const controller = new TherapistsController(
    new ListTherapistsUseCase(therapistRepository),
    new GetTherapistUseCase(therapistRepository),
    new CreateTherapistUseCase(therapistRepository),
    new UpdateTherapistUseCase(therapistRepository),
    new DeleteTherapistUseCase(therapistRepository),
    new CreateTherapistAccountUseCase(
      therapistRepository,
      new PgUserRepository(pool),
      passwordHasher,
      env.ADMIN_EMAILS,
    ),
  );

  return {
    router: createTherapistsRoutes(controller, authMiddleware, requireAdmin),
    therapistRepository,
  };
}
