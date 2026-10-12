import type { ITherapistRepository } from '../domain/ITherapistRepository';
import type { Therapist } from '../domain/Therapist';

export class ListTherapistsUseCase {
  constructor(private readonly therapistRepository: ITherapistRepository) {}

  async execute(options: { includeInactive?: boolean } = {}): Promise<Therapist[]> {
    return this.therapistRepository.findAll({ includeInactive: options.includeInactive ?? false });
  }
}
