import { BadRequestError, NotFoundError } from '../../../shared/errors/AppError';
import type { IServiceRepository, UpdateServiceInput } from '../domain/IServiceRepository';
import type { Service } from '../domain/Service';

export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string, input: UpdateServiceInput): Promise<Service> {
    if (input.durationMinutes && input.durationMinutes.max < input.durationMinutes.min) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'durationMinutes.max', issue: 'Must be greater than or equal to durationMinutes.min.' },
      ]);
    }

    if (input.formats && input.formats.length === 0) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'formats', issue: 'At least one session format is required.' },
      ]);
    }

    const service = await this.serviceRepository.update(id, input);
    if (!service) {
      throw new NotFoundError('Service not found.');
    }

    return service;
  }
}
