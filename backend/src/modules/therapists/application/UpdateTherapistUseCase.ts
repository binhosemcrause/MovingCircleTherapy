import { NotFoundError } from '../../../shared/errors/AppError';
import type { ITherapistRepository, UpdateTherapistInput } from '../domain/ITherapistRepository';
import type { Therapist } from '../domain/Therapist';

export class UpdateTherapistUseCase {
  constructor(private readonly therapistRepository: ITherapistRepository) {}

  async execute(id: string, input: UpdateTherapistInput): Promise<Therapist> {
    const therapist = await this.therapistRepository.update(id, input);
    if (!therapist) {
      throw new NotFoundError('Therapist not found.');
    }
    return therapist;
  }
}
