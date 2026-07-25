import { NotFoundError } from '../../../shared/errors/AppError';
import type { IResourceRepository } from '../domain/IResourceRepository';
import type { Resource } from '../domain/Resource';

export class GetResourceUseCase {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async execute(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found.');
    }
    return resource;
  }
}
