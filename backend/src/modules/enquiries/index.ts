import type { Router } from 'express';
import type { Pool } from 'pg';
import { SubmitEnquiryUseCase } from './application/SubmitEnquiryUseCase';
import { PgEnquiryRepository } from './infrastructure/PgEnquiryRepository';
import { EnquiriesController } from './presentation/EnquiriesController';
import { createEnquiriesRoutes } from './presentation/enquiries.routes';

export function createEnquiriesModule(pool: Pool): Router {
  const enquiryRepository = new PgEnquiryRepository(pool);
  const controller = new EnquiriesController(new SubmitEnquiryUseCase(enquiryRepository));
  return createEnquiriesRoutes(controller);
}
