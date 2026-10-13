import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import type { IAvailabilityRepository } from '../../services/domain/IAvailabilityRepository';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface RescheduleAppointmentInput {
  id: string;
  userId: string;
  scheduledAt?: string;
  notes?: string;
}

export class RescheduleAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
  ) {}

  async execute(input: RescheduleAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.id);
    if (!appointment || appointment.userId !== input.userId) {
      throw new NotFoundError('Appointment not found.');
    }

    let scheduledAt: Date | undefined;

    if (input.scheduledAt) {
      scheduledAt = new Date(input.scheduledAt);
      // Same therapist, new time: they must be open then, not counting
      // this appointment's current time.
      const slot = await this.availabilityRepository.findOpenSlotAt(appointment.serviceId, scheduledAt, {
        therapistId: appointment.therapistId ?? undefined,
        excludeAppointmentId: appointment.id,
      });
      if (!slot) {
        throw new ConflictError('Requested slot is no longer available.', 'slot_unavailable');
      }
    }

    return this.appointmentRepository.update(input.id, { scheduledAt, notes: input.notes });
  }
}
