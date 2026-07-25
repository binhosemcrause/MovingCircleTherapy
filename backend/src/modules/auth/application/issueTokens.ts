import { env } from '../../../config/env';
import { hashToken } from '../../../shared/security/hashToken';
import type { TokenService } from '../../../shared/security/TokenService';
import type { IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function issueTokens(
  userId: string,
  tokenService: TokenService,
  refreshTokenRepository: IRefreshTokenRepository,
): Promise<IssuedTokens> {
  const accessToken = tokenService.signAccessToken({ sub: userId });
  const refreshToken = tokenService.signRefreshToken({ sub: userId });

  await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000),
  });

  return { accessToken, refreshToken, expiresIn: tokenService.accessTokenTtlSeconds() };
}
