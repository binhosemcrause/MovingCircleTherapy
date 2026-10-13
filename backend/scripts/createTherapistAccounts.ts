// Gives therapists a login, so booking notifications reach them in the app
// and by email. Pass one slug=email pair per therapist:
//
//   npm run db:therapist-accounts -- aditi-sawarkar=aditi@example.com
//
// A therapist whose email already has an account is linked to it; otherwise
// an account is created with a temporary password, printed once here. Safe
// to re-run.
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { BcryptPasswordHasher } from '../src/shared/security/BcryptPasswordHasher';

async function main(): Promise<void> {
  const pairs = process.argv.slice(2).map((arg) => arg.split('=') as [string, string | undefined]);
  if (pairs.length === 0 || pairs.some(([slug, email]) => !slug || !email?.includes('@'))) {
    console.error('Usage: npm run db:therapist-accounts -- <therapist-slug>=<email> [...]');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const passwordHasher = new BcryptPasswordHasher();
  const client = await pool.connect();
  try {
    await client.query('begin');

    for (const [slug, email] of pairs) {
      const therapist = await client.query<{ id: string; first_name: string; last_name: string }>(
        'select id, first_name, last_name from therapists where slug = $1',
        [slug],
      );
      const row = therapist.rows[0];
      if (!row) {
        throw new Error(`No therapist with slug "${slug}".`);
      }

      const existing = await client.query<{ id: string }>('select id from users where email = $1', [email]);
      let userId = existing.rows[0]?.id;
      let outcome = 'linked to the existing account';
      if (!userId) {
        const password = randomBytes(9).toString('base64url');
        const created = await client.query<{ id: string }>(
          `insert into users (first_name, last_name, email, password_hash, role)
           values ($1, $2, $3, $4, 'therapist')
           returning id`,
          [row.first_name, row.last_name, email, await passwordHasher.hash(password)],
        );
        userId = created.rows[0]!.id;
        outcome = `account created, temporary password: ${password}`;
      }

      await client.query(`update users set role = 'therapist' where id = $1 and role = 'client'`, [userId]);
      await client.query('update therapists set user_id = $2, email = $3 where id = $1', [row.id, userId, email]);
      console.log(`${row.first_name} ${row.last_name} <${email}>: ${outcome}`);
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
