import { NotFoundError } from '../../../shared/errors/AppError';
import type { ITherapistRepository } from '../domain/ITherapistRepository';
import type { Therapist } from '../domain/Therapist';

export class GetTherapistUseCase {
  constructor(private readonly therapistRepository: ITherapistRepository) {}

  async execute(id: string): Promise<Therapist> {
    const therapist = await this.therapistRepository.findById(id);
    if (!therapist) {
      throw new NotFoundError('Therapist not found.');
    }
    return therapist;
  }
}
