import { ConflictError } from '../../../shared/errors/AppError';
import type { PasswordHasher } from '../../../shared/security/PasswordHasher';
import type { TokenService } from '../../../shared/security/TokenService';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import { toPublicUser } from '../../users/domain/User';
import type { AuthResult } from './AuthResult';
import type { IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';
import { issueTokens } from './issueTokens';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already registered.', 'email_taken');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    const tokens = await issueTokens(user.id, this.tokenService, this.refreshTokenRepository);

    return { ...tokens, user: toPublicUser(user) };
  }
}
