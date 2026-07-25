import type { IResourceRepository, ListResourcesFilter } from '../domain/IResourceRepository';
import type { Resource } from '../domain/Resource';

export class ListResourcesUseCase {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async execute(filter: ListResourcesFilter): Promise<Resource[]> {
    return this.resourceRepository.findAll(filter);
  }
}
