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
  // Always true: only open slots are listed.
  available: boolean;
  // Therapists free for this slot, in list order.
  therapistIds: string[];
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

    const slots = await this.availabilityRepository.findOpenSlots(input.serviceId, {
      from: input.from,
      to: input.to,
    });

    return slots.map((slot) => ({
      start: slot.startsAt.toISOString(),
      end: slot.endsAt.toISOString(),
      available: true,
      therapistIds: slot.therapistIds,
    }));
  }
}
