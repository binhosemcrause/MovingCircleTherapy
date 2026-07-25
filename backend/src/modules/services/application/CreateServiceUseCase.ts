import { BadRequestError } from '../../../shared/errors/AppError';
import type { CreateServiceInput, IServiceRepository } from '../domain/IServiceRepository';
import type { Service } from '../domain/Service';

export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    if (input.durationMinutes.max < input.durationMinutes.min) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'durationMinutes.max', issue: 'Must be greater than or equal to durationMinutes.min.' },
      ]);
    }

    if (input.formats.length === 0) {
      throw new BadRequestError('Invalid request payload', [
        { field: 'formats', issue: 'At least one session format is required.' },
      ]);
    }

    return this.serviceRepository.create(input);
  }
}
