import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import { validate } from '../../../shared/http/validate';
import type { AuthController } from './AuthController';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas';

export function createAuthRoutes(controller: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.post('/auth/register', validate({ body: registerSchema }), asyncHandler(controller.register));
  router.post('/auth/login', validate({ body: loginSchema }), asyncHandler(controller.login));
  router.post('/auth/refresh', validate({ body: refreshSchema }), asyncHandler(controller.refresh));
  router.post('/auth/logout', authMiddleware, asyncHandler(controller.logout));

  return router;
}
