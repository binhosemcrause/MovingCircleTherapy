import type { AppointmentStatus } from '../../../shared/domain/enums';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface ListAppointmentsInput {
  userId: string;
  status?: AppointmentStatus;
}

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<Appointment[]> {
    return this.appointmentRepository.findByUser(input.userId, input.status);
  }
}
