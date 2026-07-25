import type { GetServiceUseCase } from '../../services/application/GetServiceUseCase';
import { toServiceResponse } from '../../services/presentation/serviceMapper';
import type { Appointment } from '../domain/Appointment';

export async function toAppointmentResponse(appointment: Appointment, getServiceUseCase: GetServiceUseCase) {
  const service = await getServiceUseCase.execute(appointment.serviceId);
  return {
    id: appointment.id,
    service: toServiceResponse(service),
    userId: appointment.userId,
    scheduledAt: appointment.scheduledAt.toISOString(),
    format: appointment.format,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt.toISOString(),
  };
}

export async function toAppointmentResponseList(appointments: Appointment[], getServiceUseCase: GetServiceUseCase) {
  return Promise.all(appointments.map((appointment) => toAppointmentResponse(appointment, getServiceUseCase)));
}
