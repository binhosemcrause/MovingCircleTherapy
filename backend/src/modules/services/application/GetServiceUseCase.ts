import { NotFoundError } from '../../../shared/errors/AppError';
import type { IServiceRepository } from '../domain/IServiceRepository';
import type { Service } from '../domain/Service';

export class GetServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found.');
    }
    return service;
  }
}
