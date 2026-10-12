import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import type { ITherapistRepository } from '../domain/ITherapistRepository';

export class DeleteTherapistUseCase {
  constructor(private readonly therapistRepository: ITherapistRepository) {}

  async execute(id: string): Promise<void> {
    // Deleting would silently detach the therapist from sessions clients
    // are still expecting; deactivating (isActive: false) is the safe way
    // to take someone off the list in the meantime.
    if (await this.therapistRepository.hasUpcomingAppointments(id)) {
      throw new ConflictError(
        'Cannot delete a therapist who has upcoming appointments. Deactivate them instead.',
        'therapist_has_appointments',
      );
    }

    const deleted = await this.therapistRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Therapist not found.');
    }
  }
}
