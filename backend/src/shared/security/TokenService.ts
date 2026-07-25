export interface AccessTokenPayload {
  sub: string;
}

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  signRefreshToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  verifyRefreshToken(token: string): AccessTokenPayload;
  accessTokenTtlSeconds(): number;
}
