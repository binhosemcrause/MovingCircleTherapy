import type { PendingNotificationEmail, TherapistNotification } from './TherapistNotification';

export interface ITherapistNotificationRepository {
  // Newest first; empty when the user is not a therapist.
  findByUser(userId: string): Promise<TherapistNotification[]>;
  markAllReadByUser(userId: string): Promise<void>;
  findUndeliveredByAppointment(appointmentId: string): Promise<PendingNotificationEmail[]>;
  markDelivered(id: string): Promise<void>;
}
