import { NotFoundError } from '../../../shared/errors/AppError';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface GetAppointmentInput {
  id: string;
  userId: string;
}

export class GetAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(input: GetAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.id);
    if (!appointment || appointment.userId !== input.userId) {
      throw new NotFoundError('Appointment not found.');
    }
    return appointment;
  }
}
