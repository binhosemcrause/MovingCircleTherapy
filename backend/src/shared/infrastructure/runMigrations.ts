import fs from 'node:fs';
import path from 'node:path';
import type { Pool } from 'pg';

// sql/migrations lives at the backend package root; this file sits three
// levels under src (or dist), so it resolves the same way in dev and build.
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../sql/migrations');

// Each migration in sql/migrations/ is written with IF NOT EXISTS guards, so
// replaying all of them on every boot is safe and needs no separate
// migrations-tracking table. This is what brings a deployed database (which
// we have no direct access to, e.g. Render) up to date: pushing new code —
// and the migration file alongside it — is enough, no manual DB step needed.
export async function runMigrations(pool: Pool): Promise<void> {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied migration: ${file}`);
  }
}
