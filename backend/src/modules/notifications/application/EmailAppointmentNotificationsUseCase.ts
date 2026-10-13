import type { IEmailSender } from '../domain/IEmailSender';
import type { ITherapistNotificationRepository } from '../domain/ITherapistNotificationRepository';

// Emails the therapist the notifications stored for an appointment. Rows
// that can't be sent (email not configured, or no address for the therapist)
// keep delivered_at null; the therapist still sees them in the app.
export class EmailAppointmentNotificationsUseCase {
  constructor(
    private readonly notificationRepository: ITherapistNotificationRepository,
    private readonly emailSender: IEmailSender | null,
  ) {}

  async execute(appointmentId: string): Promise<void> {
    if (!this.emailSender) {
      return;
    }

    const pending = await this.notificationRepository.findUndeliveredByAppointment(appointmentId);
    for (const notification of pending) {
      if (!notification.email) {
        console.warn(`No email address for ${notification.therapistFirstName}; notification ${notification.id} not emailed.`);
        continue;
      }
      await this.emailSender.send({
        to: notification.email,
        subject: notification.title,
        text: [
          `Hi ${notification.therapistFirstName},`,
          notification.body,
          'Open the Moving Circle Therapy app and go to your profile to see the request.',
        ].join('\n\n'),
      });
      await this.notificationRepository.markDelivered(notification.id);
    }
  }
}
