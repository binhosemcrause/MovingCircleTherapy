import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler';
import type { NotificationsController } from './NotificationsController';

export function createNotificationsRoutes(controller: NotificationsController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use('/notifications', authMiddleware);
  router.get('/notifications', asyncHandler(controller.list));
  router.post('/notifications/read', asyncHandler(controller.markAllRead));

  return router;
}
