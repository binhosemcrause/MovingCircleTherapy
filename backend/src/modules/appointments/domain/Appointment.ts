import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  scheduledAt: Date;
  format: SessionFormat;
  status: AppointmentStatus;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
