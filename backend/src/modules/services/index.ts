import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import { CreateServiceUseCase } from './application/CreateServiceUseCase';
import { GetServiceUseCase } from './application/GetServiceUseCase';
import { ListAvailabilityUseCase } from './application/ListAvailabilityUseCase';
import { ListServicesUseCase } from './application/ListServicesUseCase';
import { PgAvailabilityRepository } from './infrastructure/PgAvailabilityRepository';
import { PgServiceRepository } from './infrastructure/PgServiceRepository';
import { ServicesController } from './presentation/ServicesController';
import { createServicesRoutes } from './presentation/services.routes';

export interface ServicesModule {
  router: Router;
  serviceRepository: PgServiceRepository;
  availabilityRepository: PgAvailabilityRepository;
  getServiceUseCase: GetServiceUseCase;
}

export function createServicesModule(pool: Pool, authMiddleware: RequestHandler): ServicesModule {
  const serviceRepository = new PgServiceRepository(pool);
  const availabilityRepository = new PgAvailabilityRepository(pool);
  const getServiceUseCase = new GetServiceUseCase(serviceRepository);

  const controller = new ServicesController(
    new ListServicesUseCase(serviceRepository),
    getServiceUseCase,
    new ListAvailabilityUseCase(serviceRepository, availabilityRepository),
    new CreateServiceUseCase(serviceRepository),
  );

  return {
    router: createServicesRoutes(controller, authMiddleware),
    serviceRepository,
    availabilityRepository,
    getServiceUseCase,
  };
}
