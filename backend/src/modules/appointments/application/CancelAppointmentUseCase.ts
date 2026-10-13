import { NotFoundError } from '../../../shared/errors/AppError';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface CancelAppointmentInput {
  id: string;
  userId: string;
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<void> {
    const appointment = await this.appointmentRepository.findById(input.id);
    if (!appointment || appointment.userId !== input.userId) {
      throw new NotFoundError('Appointment not found.');
    }

    await this.appointmentRepository.update(input.id, { status: 'cancelled', cancelledAt: new Date() });
  }
}
