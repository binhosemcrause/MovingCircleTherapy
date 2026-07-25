import type { Pool } from 'pg';
import type { CreateRefreshTokenInput, IRefreshTokenRepository } from '../domain/IRefreshTokenRepository';
import type { RefreshToken } from '../domain/RefreshToken';

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

function toRefreshToken(row: RefreshTokenRow): RefreshToken {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

export class PgRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const result = await this.pool.query<RefreshTokenRow>(
      `insert into refresh_tokens (user_id, token_hash, expires_at)
       values ($1, $2, $3)
       returning *`,
      [input.userId, input.tokenHash, input.expiresAt],
    );
    return toRefreshToken(result.rows[0]!);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const result = await this.pool.query<RefreshTokenRow>(
      'select * from refresh_tokens where token_hash = $1',
      [tokenHash],
    );
    return result.rows[0] ? toRefreshToken(result.rows[0]) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.pool.query('update refresh_tokens set revoked_at = now() where id = $1', [id]);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      'update refresh_tokens set revoked_at = now() where user_id = $1 and revoked_at is null',
      [userId],
    );
  }
}
