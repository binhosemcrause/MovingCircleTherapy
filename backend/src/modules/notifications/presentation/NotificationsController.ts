import type { Request, Response } from 'express';
import type { ListMyNotificationsUseCase } from '../application/ListMyNotificationsUseCase';
import type { MarkNotificationsReadUseCase } from '../application/MarkNotificationsReadUseCase';
import { toNotificationResponse } from './notificationMapper';

export class NotificationsController {
  constructor(
    private readonly listMyNotificationsUseCase: ListMyNotificationsUseCase,
    private readonly markNotificationsReadUseCase: MarkNotificationsReadUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const notifications = await this.listMyNotificationsUseCase.execute(req.userId!);
    res.status(200).json(notifications.map(toNotificationResponse));
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    await this.markNotificationsReadUseCase.execute(req.userId!);
    res.status(204).send();
  };
}
