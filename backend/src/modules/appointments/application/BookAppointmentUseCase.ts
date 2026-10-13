import { BadRequestError, ConflictError } from '../../../shared/errors/AppError';
import type { SessionFormat } from '../../../shared/domain/enums';
import { formatPracticeDateTime } from '../../../shared/domain/practiceTime';
import type { IServiceRepository } from '../../services/domain/IServiceRepository';
import type { ITherapistRepository } from '../../therapists/domain/ITherapistRepository';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import type { Appointment } from '../domain/Appointment';
import type { IAppointmentRepository } from '../domain/IAppointmentRepository';
import type { IBookingNotifier } from '../domain/IBookingNotifier';

export interface BookAppointmentInput {
  userId: string;
  serviceId: string;
  therapistId: string;
  scheduledAt: string;
  format?: SessionFormat;
  notes?: string;
}

export class BookAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly therapistRepository: ITherapistRepository,
    private readonly userRepository: IUserRepository,
    private readonly bookingNotifier: IBookingNotifier,
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

    const therapist = await this.therapistRepository.findById(input.therapistId);
    if (!therapist?.isActive) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'therapistId', issue: 'Therapist not found or not taking bookings.' },
      ]);
    }

    const scheduledAt = new Date(input.scheduledAt);
    const client = await this.userRepository.findById(input.userId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'A client';

    const result = await this.appointmentRepository.book({
      userId: input.userId,
      serviceId: input.serviceId,
      therapistId: therapist.id,
      scheduledAt,
      format,
      notes: input.notes,
      therapistNotification: {
        title: 'New session request',
        body: `${clientName} requested ${service.name} with you on ${formatPracticeDateTime(scheduledAt)}.`,
      },
    });

    if ('conflict' in result) {
      throw new ConflictError('This therapist is not available at that time.', result.conflict);
    }

    // The booking stands whether or not the email goes out, so it is sent
    // without holding up the response.
    this.bookingNotifier.appointmentBooked(result.appointment.id).catch((error) => {
      console.error('Failed to email the therapist about appointment', result.appointment.id, error);
    });

    return result.appointment;
  }
}
