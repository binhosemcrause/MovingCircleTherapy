import { BadRequestError, ConflictError } from '../../../shared/errors/AppError';
import type { SessionFormat } from '../../../shared/domain/enums';
import type { IAvailabilityRepository } from '../../services/domain/IAvailabilityRepository';
import type { IServiceRepository } from '../../services/domain/IServiceRepository';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface BookAppointmentInput {
  userId: string;
  serviceId: string;
  scheduledAt: string;
  format?: SessionFormat;
  notes?: string;
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
  ) {}

  async execute(input: BookAppointmentInput): Promise<Appointment> {
    const service = await this.serviceRepository.findById(input.serviceId);
    if (!service) {
      throw new BadRequestError('Invalid request payload', [{ field: 'serviceId', issue: 'Service not found.' }]);
    }

    const format = input.format ?? service.formats[0];
    if (!format || !service.formats.includes(format)) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'format', issue: 'Format is not offered for this service.' },
      ]);
    }

    const scheduledAt = new Date(input.scheduledAt);
    const slot = await this.availabilityRepository.findOpenSlot(input.serviceId, scheduledAt);
    if (!slot) {
      throw new ConflictError('Requested slot is no longer available.', 'slot_unavailable');
    }

    const appointment = await this.appointmentRepository.bookWithSlot(slot.id, {
      userId: input.userId,
      serviceId: input.serviceId,
      scheduledAt,
      format,
      notes: input.notes,
    });

    if (!appointment) {
      throw new ConflictError('Requested slot is no longer available.', 'slot_unavailable');
    }

    return appointment;
  }
}
