import { apiFetch } from './client';

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  // The session the notification is about, as it stands now.
  appointment: {
    id: string;
    scheduledAt: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    serviceName: string;
    clientName: string;
  } | null;
}

// Empty unless the signed-in user is one of the practice's therapists.
export function listNotifications(): Promise<ApiNotification[]> {
  return apiFetch<ApiNotification[]>('/notifications');
}

export function markNotificationsRead(): Promise<void> {
  return apiFetch<void>('/notifications/read', { method: 'POST' });
}
