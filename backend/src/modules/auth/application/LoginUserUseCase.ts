import { UnauthorizedError } from '../../../shared/errors/AppError';
import type { PasswordHasher } from '../../../shared/security/PasswordHasher';
import type { TokenService } from '../../../shared/security/TokenService';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import { toPublicUser } from '../../users/domain/User';
import type { IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';
import type { AuthResult } from './AuthResult';
import { issueTokens } from './issueTokens';

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokens = await issueTokens(user.id, this.tokenService, this.refreshTokenRepository);

    return { ...tokens, user: toPublicUser(user) };
  }
}
