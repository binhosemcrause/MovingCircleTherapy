import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors/AppError';
import type { AccessTokenPayload, TokenService } from './TokenService';

export class JwtTokenService implements TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS });
  }

  signRefreshToken(payload: AccessTokenPayload): string {
    // jwtid guarantees a unique token even when issued for the same user within the same
    // second (e.g. register immediately followed by login), since `refresh_tokens.token_hash`
    // is unique and jwt `iat` only has second-level granularity.
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_TTL_SECONDS,
      jwtid: randomUUID(),
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError('Access token is invalid or expired.');
    }
  }

  verifyRefreshToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError('Refresh token is invalid or expired.');
    }
  }

  accessTokenTtlSeconds(): number {
    return env.JWT_ACCESS_TTL_SECONDS;
  }
}
