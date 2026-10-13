import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  therapistId: string | null;
  scheduledAt: Date;
  format: SessionFormat;
  status: AppointmentStatus;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// An appointment as its therapist sees it.
export interface AssignedAppointment extends Appointment {
  clientName: string;
}
