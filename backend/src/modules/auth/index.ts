import type { Router, RequestHandler } from 'express';
import type { Pool } from 'pg';
import type { PasswordHasher } from '../../shared/security/PasswordHasher';
import type { TokenService } from '../../shared/security/TokenService';
import { PgUserRepository } from '../users/infrastructure/PgUserRepository';
import { LoginUserUseCase } from './application/LoginUserUseCase';
import { LogoutUserUseCase } from './application/LogoutUserUseCase';
import { RefreshTokenUseCase } from './application/RefreshTokenUseCase';
import { RegisterUserUseCase } from './application/RegisterUserUseCase';
import { PgRefreshTokenRepository } from './infrastructure/PgRefreshTokenRepository';
import { AuthController } from './presentation/AuthController';
import { createAuthRoutes } from './presentation/auth.routes';

export function createAuthModule(
  pool: Pool,
  passwordHasher: PasswordHasher,
  tokenService: TokenService,
  authMiddleware: RequestHandler,
): Router {
  const userRepository = new PgUserRepository(pool);
  const refreshTokenRepository = new PgRefreshTokenRepository(pool);

  const controller = new AuthController(
    new RegisterUserUseCase(userRepository, refreshTokenRepository, passwordHasher, tokenService),
    new LoginUserUseCase(userRepository, refreshTokenRepository, passwordHasher, tokenService),
    new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService),
    new LogoutUserUseCase(refreshTokenRepository),
  );

  return createAuthRoutes(controller, authMiddleware);
}
