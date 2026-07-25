import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { EnquiriesController } from './EnquiriesController';
import { submitEnquirySchema } from './enquiries.schemas';

export function createEnquiriesRoutes(controller: EnquiriesController): Router {
  const router = Router();

  router.post('/enquiries', validate({ body: submitEnquirySchema }), asyncHandler(controller.submit));

  return router;
}
