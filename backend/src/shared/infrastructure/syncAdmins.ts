import type { Pool } from 'pg';

// Makes the accounts listed in ADMIN_EMAILS admins. Run on boot, so adding
// an email to the list and redeploying is enough. Taking an email off the
// list does not demote the account.
export async function syncAdmins(pool: Pool, adminEmails: string[]): Promise<void> {
  if (adminEmails.length === 0) {
    return;
  }
  const result = await pool.query(
    `update users set role = 'admin' where lower(email::text) = any ($1::text[]) and role <> 'admin'`,
    [adminEmails],
  );
  if (result.rowCount) {
    console.log(`Granted admin to ${result.rowCount} account(s) from ADMIN_EMAILS.`);
  }
}
