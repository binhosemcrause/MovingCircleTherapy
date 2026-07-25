import type { Router } from 'express';
import type { Pool } from 'pg';
import { GetResourceUseCase } from './application/GetResourceUseCase';
import { ListResourcesUseCase } from './application/ListResourcesUseCase';
import { PgResourceRepository } from './infrastructure/PgResourceRepository';
import { ResourcesController } from './presentation/ResourcesController';
import { createResourcesRoutes } from './presentation/resources.routes';

export function createResourcesModule(pool: Pool): Router {
  const resourceRepository = new PgResourceRepository(pool);

  const controller = new ResourcesController(
    new ListResourcesUseCase(resourceRepository),
    new GetResourceUseCase(resourceRepository),
  );

  return createResourcesRoutes(controller);
}
