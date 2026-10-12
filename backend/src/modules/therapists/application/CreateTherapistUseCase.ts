import type { CreateTherapistInput, ITherapistRepository } from '../domain/ITherapistRepository';
import type { Therapist } from '../domain/Therapist';

export class CreateTherapistUseCase {
  constructor(private readonly therapistRepository: ITherapistRepository) {}

  async execute(input: CreateTherapistInput): Promise<Therapist> {
    return this.therapistRepository.create(input);
  }
}
