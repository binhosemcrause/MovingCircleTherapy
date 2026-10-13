import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import type { Appointment, AssignedAppointment } from './Appointment';

export interface CreateAppointmentInput {
  userId: string;
  serviceId: string;
  therapistId: string;
  scheduledAt: Date;
  format: SessionFormat;
  notes?: string;
  // Stored for the therapist in the same transaction as the booking.
  therapistNotification: { title: string; body: string };
}

export type BookingResult = { appointment: Appointment } | { conflict: 'therapist_unavailable' };

export interface UpdateAppointmentInput {
  scheduledAt?: Date;
  notes?: string;
  status?: AppointmentStatus;
  cancelledAt?: Date | null;
}

export interface IAppointmentRepository {
  findByUser(userId: string, status?: AppointmentStatus): Promise<Appointment[]>;
  // Sessions booked with the therapist this user account belongs to.
  findByTherapistUser(userId: string): Promise<AssignedAppointment[]>;
  findById(id: string): Promise<Appointment | null>;
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment>;

  // Atomically checks the therapist is open at that time for the service
  // and inserts the appointment plus the therapist's notification. Reports
  // a conflict instead if the therapist can't take it.
  book(input: CreateAppointmentInput): Promise<BookingResult>;
}
