import type { AssignedAppointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

// The sessions clients have booked with the signed-in therapist. Empty for
// anyone who isn't a therapist.
export class ListAssignedAppointmentsUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(userId: string): Promise<AssignedAppointment[]> {
    return this.appointmentRepository.findByTherapistUser(userId);
  }
}
