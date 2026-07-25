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
      const newSlot = await this.availabilityRepository.findOpenSlot(appointment.serviceId, scheduledAt);
      if (!newSlot) {
        throw new ConflictError('Requested slot is no longer available.', 'slot_unavailable');
      }

      const oldSlot = await this.availabilityRepository.findByAppointmentId(appointment.id);
      await this.availabilityRepository.markBooked(newSlot.id, appointment.id);
      if (oldSlot) {
        await this.availabilityRepository.release(oldSlot.id);
      }
    }

    return this.appointmentRepository.update(input.id, { scheduledAt, notes: input.notes });
  }
}
