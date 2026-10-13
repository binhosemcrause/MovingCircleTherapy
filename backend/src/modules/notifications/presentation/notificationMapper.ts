import type { TherapistNotification } from '../domain/TherapistNotification';

export function toNotificationResponse(notification: TherapistNotification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    read: notification.readAt !== null,
    createdAt: notification.createdAt.toISOString(),
    appointment: notification.appointment
      ? {
          id: notification.appointment.id,
          scheduledAt: notification.appointment.scheduledAt.toISOString(),
          status: notification.appointment.status,
          serviceName: notification.appointment.serviceName,
          clientName: notification.appointment.clientName,
        }
      : null,
  };
}
