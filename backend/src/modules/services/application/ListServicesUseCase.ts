import type { ListServicesFilter, IServiceRepository } from '../domain/IServiceRepository';
import type { ServiceSummary } from '../domain/Service';

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(filter: ListServicesFilter): Promise<ServiceSummary[]> {
    return this.serviceRepository.findAll(filter);
  }
}
