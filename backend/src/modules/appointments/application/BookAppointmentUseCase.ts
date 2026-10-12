import { BadRequestError, ConflictError } from '../../../shared/errors/AppError';
import type { SessionFormat } from '../../../shared/domain/enums';
import type { IAvailabilityRepository } from '../../services/domain/IAvailabilityRepository';
import type { IServiceRepository } from '../../services/domain/IServiceRepository';
import type { ITherapistRepository } from '../../therapists/domain/ITherapistRepository';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';

export interface BookAppointmentInput {
  userId: string;
  serviceId: string;
  therapistId?: string;
  scheduledAt: string;
  format?: SessionFormat;
  notes?: string;
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly therapistRepository: ITherapistRepository,
    private readonly userRepository: IUserRepository,
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

    const therapist = input.therapistId ? await this.therapistRepository.findById(input.therapistId) : null;
    if (input.therapistId && !therapist?.isActive) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'therapistId', issue: 'Therapist not found or not taking bookings.' },
      ]);
    }

    const scheduledAt = new Date(input.scheduledAt);
    const slot = await this.availabilityRepository.findOpenSlot(input.serviceId, scheduledAt);
    if (!slot) {
      throw new ConflictError('Requested slot is no longer available.', 'slot_unavailable');
    }

    const client = therapist ? await this.userRepository.findById(input.userId) : null;
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'A client';

    const result = await this.appointmentRepository.bookWithSlot(slot.id, {
      userId: input.userId,
      serviceId: input.serviceId,
      therapistId: therapist?.id,
      scheduledAt,
      format,
      notes: input.notes,
      therapistNotification: therapist
        ? {
            title: 'New session booked',
            body: `${clientName} booked ${service.name} with you for ${scheduledAt.toISOString()}.`,
          }
        : undefined,
    });

    if ('conflict' in result) {
      throw new ConflictError(
        result.conflict === 'therapist_unavailable'
          ? 'This therapist is already booked at that time.'
          : 'Requested slot is no longer available.',
        result.conflict,
      );
    }

    return result.appointment;
  }
}
