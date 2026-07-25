import { NotFoundError } from '../../../shared/errors/AppError';
import type { IAvailabilityRepository } from '../domain/IAvailabilityRepository';
import type { IServiceRepository } from '../domain/IServiceRepository';

export interface ListAvailabilityInput {
  serviceId: string;
  from?: string;
  to?: string;
}

export interface AvailabilitySlotView {
  start: string;
  end: string;
  available: boolean;
}

export class ListAvailabilityUseCase {
  constructor(
    private readonly serviceRepository: IServiceRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
  ) {}

  async execute(input: ListAvailabilityInput): Promise<AvailabilitySlotView[]> {
    const service = await this.serviceRepository.findById(input.serviceId);
    if (!service) {
      throw new NotFoundError('Service not found.');
    }

    const slots = await this.availabilityRepository.findByService(input.serviceId, {
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
    });

    return slots.map((slot) => ({
      start: slot.startsAt.toISOString(),
      end: slot.endsAt.toISOString(),
      available: !slot.isBooked,
    }));
  }
}
