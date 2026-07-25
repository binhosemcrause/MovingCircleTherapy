import { NotFoundError } from '../../../shared/errors/AppError';
import type { IUserRepository, UpdateUserInput } from '../../users/domain/IUserRepository';
import { toPublicUser, type PublicUser } from '../../users/domain/User';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateUserInput): Promise<PublicUser> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found.');
    }
    const updated = await this.userRepository.update(userId, input);
    return toPublicUser(updated);
  }
}
