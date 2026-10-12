import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
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

export function createTherapistsModule(pool: Pool, authMiddleware: RequestHandler): TherapistsModule {
  const therapistRepository = new PgTherapistRepository(pool);

  const controller = new TherapistsController(
    new ListTherapistsUseCase(therapistRepository),
    new GetTherapistUseCase(therapistRepository),
    new CreateTherapistUseCase(therapistRepository),
    new UpdateTherapistUseCase(therapistRepository),
    new DeleteTherapistUseCase(therapistRepository),
  );

  return {
    router: createTherapistsRoutes(controller, authMiddleware),
    therapistRepository,
  };
}
