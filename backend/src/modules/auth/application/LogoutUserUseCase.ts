import type { IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';

export interface LogoutUserInput {
  userId: string;
}

export class LogoutUserUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(input: LogoutUserInput): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(input.userId);
  }
}
