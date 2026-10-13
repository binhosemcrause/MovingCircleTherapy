import type { ITherapistNotificationRepository } from '../domain/ITherapistNotificationRepository';

export class MarkNotificationsReadUseCase {
  constructor(private readonly notificationRepository: ITherapistNotificationRepository) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllReadByUser(userId);
  }
}
