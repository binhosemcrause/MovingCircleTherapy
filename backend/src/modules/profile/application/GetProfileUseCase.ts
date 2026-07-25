import { NotFoundError } from '../../../shared/errors/AppError';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import { toPublicUser, type PublicUser } from '../../users/domain/User';

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return toPublicUser(user);
  }
}
