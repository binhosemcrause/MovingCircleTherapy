import { NotFoundError } from '../../../shared/errors/AppError';
import type { IAvailabilityRepository } from '../../services/domain/IAvailabilityRepository';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface CancelAppointmentInput {
  id: string;
  userId: string;
}

export class CancelAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<void> {
    const appointment = await this.appointmentRepository.findById(input.id);
    if (!appointment || appointment.userId !== input.userId) {
      throw new NotFoundError('Appointment not found.');
    }

    const slot = await this.availabilityRepository.findByAppointmentId(appointment.id);
    if (slot) {
      await this.availabilityRepository.release(slot.id);
    }

    await this.appointmentRepository.update(input.id, { status: 'cancelled', cancelledAt: new Date() });
  }
}
