import { Pool } from 'pg';
import { env } from '../../config/env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export type QueryParams = ReadonlyArray<unknown>;

export async function query<T>(text: string, params: QueryParams = []): Promise<T[]> {
  const result = await pool.query(text, params as unknown[]);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params: QueryParams = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
