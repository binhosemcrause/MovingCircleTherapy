import { NotFoundError } from '../../../shared/errors/AppError';
import type { IServiceRepository } from '../domain/IServiceRepository';

export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.serviceRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Service not found.');
    }
  }
}
