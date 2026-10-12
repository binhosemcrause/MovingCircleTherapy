import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import type { Appointment } from './Appointment';

export interface CreateAppointmentInput {
  userId: string;
  serviceId: string;
  therapistId?: string;
  scheduledAt: Date;
  format: SessionFormat;
  notes?: string;
  // Stored for the chosen therapist in the same transaction as the booking.
  therapistNotification?: { title: string; body: string };
}

export type BookingResult =
  | { appointment: Appointment }
  | { conflict: 'slot_unavailable' | 'therapist_unavailable' };

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
  hasLiveAppointmentAt(therapistId: string, scheduledAt: Date, excludeAppointmentId?: string): Promise<boolean>;

  // Atomically reserves the slot and inserts the appointment (plus the
  // therapist's notification). Reports a conflict instead if the slot lost
  // the race or the therapist is already booked at that time.
  bookWithSlot(slotId: string, input: CreateAppointmentInput): Promise<BookingResult>;
}
