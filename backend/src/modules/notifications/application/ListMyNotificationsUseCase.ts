import type { ITherapistNotificationRepository } from '../domain/ITherapistNotificationRepository';
import type { TherapistNotification } from '../domain/TherapistNotification';

export class ListMyNotificationsUseCase {
  constructor(private readonly notificationRepository: ITherapistNotificationRepository) {}

  async execute(userId: string): Promise<TherapistNotification[]> {
    return this.notificationRepository.findByUser(userId);
  }
}
