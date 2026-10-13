import type { AppointmentStatus } from '../../../shared/domain/enums';

export interface TherapistNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
  // The session the notification is about, as it stands now.
  appointment: {
    id: string;
    scheduledAt: Date;
    status: AppointmentStatus;
    serviceName: string;
    clientName: string;
  } | null;
}

// A notification that still has to be emailed to its therapist.
export interface PendingNotificationEmail {
  id: string;
  title: string;
  body: string;
  therapistFirstName: string;
  // The therapist's login email, else the contact email on their record.
  email: string | null;
}
