import type { GetServiceUseCase } from '../../services/application/GetServiceUseCase';
import { toServiceResponse } from '../../services/presentation/serviceMapper';
import type { ITherapistRepository } from '../../therapists/domain/ITherapistRepository';
import { toTherapistResponse } from '../../therapists/presentation/therapistMapper';
import type { Appointment } from '../domain/Appointment';

export interface AppointmentLookups {
  getServiceUseCase: GetServiceUseCase;
  therapistRepository: ITherapistRepository;
}

export async function toAppointmentResponse(appointment: Appointment, lookups: AppointmentLookups) {
  const [service, therapist] = await Promise.all([
    lookups.getServiceUseCase.execute(appointment.serviceId),
    appointment.therapistId ? lookups.therapistRepository.findById(appointment.therapistId) : null,
  ]);
  return {
    id: appointment.id,
    service: toServiceResponse(service),
    therapist: therapist ? toTherapistResponse(therapist) : null,
    userId: appointment.userId,
    scheduledAt: appointment.scheduledAt.toISOString(),
    format: appointment.format,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt.toISOString(),
  };
}

export async function toAppointmentResponseList(appointments: Appointment[], lookups: AppointmentLookups) {
  return Promise.all(appointments.map((appointment) => toAppointmentResponse(appointment, lookups)));
}
