import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import type { Appointment } from './Appointment';

export interface CreateAppointmentInput {
  userId: string;
  serviceId: string;
  scheduledAt: Date;
  format: SessionFormat;
  notes?: string;
}

export interface UpdateAppointmentInput {
  scheduledAt?: Date;
  notes?: string;
  status?: AppointmentStatus;
  cancelledAt?: Date | null;
}

export interface IAppointmentRepository {
  findByUser(userId: string, status?: AppointmentStatus): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment>;

  // Atomically reserves the slot and inserts the appointment; returns null if the slot lost the race and is already booked.
  bookWithSlot(slotId: string, input: CreateAppointmentInput): Promise<Appointment | null>;
}
