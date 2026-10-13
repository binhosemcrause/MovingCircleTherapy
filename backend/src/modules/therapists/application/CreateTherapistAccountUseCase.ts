import { randomBytes } from 'node:crypto';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import type { UserRole } from '../../../shared/domain/enums';
import type { PasswordHasher } from '../../../shared/security/PasswordHasher';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import type { ITherapistRepository } from '../domain/ITherapistRepository';

export interface CreateTherapistAccountInput {
  therapistId: string;
  email: string;
}

export interface TherapistAccount {
  email: string;
  role: UserRole;
  // Only set when a new account was created; shown to the admin once.
  temporaryPassword: string | null;
}

// Gives a therapist a login. An email that already has an account is linked
// as it is (that person keeps their password); otherwise an account is
// created with a temporary password.
export class CreateTherapistAccountUseCase {
  constructor(
    private readonly therapistRepository: ITherapistRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly adminEmails: string[],
  ) {}

  async execute(input: CreateTherapistAccountInput): Promise<TherapistAccount> {
    const therapist = await this.therapistRepository.findById(input.therapistId);
    if (!therapist) {
      throw new NotFoundError('Therapist not found.');
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (therapist.userId && therapist.userId !== existing?.id) {
      throw new ConflictError('This therapist already has a login.', 'therapist_has_account');
    }
    if (existing?.therapistId && existing.therapistId !== therapist.id) {
      throw new ConflictError('This email already belongs to another therapist.', 'email_taken');
    }

    const isAdmin = existing?.role === 'admin' || this.adminEmails.includes(input.email.toLowerCase());
    const role: UserRole = isAdmin ? 'admin' : 'therapist';

    let userId = existing?.id;
    let temporaryPassword: string | null = null;
    if (existing) {
      await this.userRepository.setRole(existing.id, role);
    } else {
      temporaryPassword = randomBytes(9).toString('base64url');
      const user = await this.userRepository.create({
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        email: input.email,
        passwordHash: await this.passwordHasher.hash(temporaryPassword),
        role,
      });
      userId = user.id;
    }

    await this.therapistRepository.linkUser(therapist.id, userId!, input.email);
    return { email: input.email, role, temporaryPassword };
  }
}
