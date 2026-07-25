import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { ProfileController } from './ProfileController';
import { updateProfileSchema } from './profile.schemas';

export function createProfileRoutes(controller: ProfileController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use('/profile', authMiddleware);
  router.get('/profile', asyncHandler(controller.getProfile));
  router.patch('/profile', validate({ body: updateProfileSchema }), asyncHandler(controller.updateProfile));

  return router;
}
