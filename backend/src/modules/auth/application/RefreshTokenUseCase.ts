import { UnauthorizedError } from '../../../shared/errors/AppError';
import { hashToken } from '../../../shared/security/hashToken';
import type { TokenService } from '../../../shared/security/TokenService';
import type { IUserRepository } from '../../users/domain/IUserRepository';
import { toPublicUser } from '../../users/domain/User';
import type { IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';
import type { AuthResult } from './AuthResult';
import { issueTokens } from './issueTokens';

export interface RefreshTokenInput {
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthResult> {
    const payload = this.tokenService.verifyRefreshToken(input.refreshToken);

    const stored = await this.refreshTokenRepository.findByTokenHash(hashToken(input.refreshToken));
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token is invalid or expired.');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('Refresh token is invalid or expired.');
    }

    await this.refreshTokenRepository.revoke(stored.id);
    const tokens = await issueTokens(user.id, this.tokenService, this.refreshTokenRepository);

    return { ...tokens, user: toPublicUser(user) };
  }
}
