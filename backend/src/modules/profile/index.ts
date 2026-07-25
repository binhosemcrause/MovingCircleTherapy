import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import { PgUserRepository } from '../users/infrastructure/PgUserRepository';
import { GetProfileUseCase } from './application/GetProfileUseCase';
import { UpdateProfileUseCase } from './application/UpdateProfileUseCase';
import { ProfileController } from './presentation/ProfileController';
import { createProfileRoutes } from './presentation/profile.routes';

export function createProfileModule(pool: Pool, authMiddleware: RequestHandler): Router {
  const userRepository = new PgUserRepository(pool);

  const controller = new ProfileController(
    new GetProfileUseCase(userRepository),
    new UpdateProfileUseCase(userRepository),
  );

  return createProfileRoutes(controller, authMiddleware);
}
