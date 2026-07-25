import type { PublicUser } from '../../users/domain/User';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: PublicUser;
}
