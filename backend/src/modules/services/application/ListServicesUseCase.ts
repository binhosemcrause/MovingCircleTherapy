import type { ListServicesFilter, IServiceRepository } from '../domain/IServiceRepository';
import type { Service } from '../domain/Service';

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(filter: ListServicesFilter): Promise<Service[]> {
    return this.serviceRepository.findAll(filter);
  }
}
