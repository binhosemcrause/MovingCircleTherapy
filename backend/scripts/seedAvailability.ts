// Adds sample open slots to DATABASE_URL so the booking flow has something
// to offer: every service, weekdays, five start times a day, for the next
// eight weeks. Times are in this machine's local timezone. Safe to re-run —
// existing slots are left alone.
//
// These hours are placeholders, not the practice's real schedule.
import 'dotenv/config';
import { Pool } from 'pg';

const WEEKS_AHEAD = 8;
const START_TIMES: [hour: number, minute: number][] = [
  [9, 0],
  [10, 30],
  [13, 0],
  [14, 30],
  [16, 0],
];

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const services = await pool.query<{ id: string; duration_max_minutes: number }>(
      'select id, duration_max_minutes from services',
    );

    let created = 0;
    for (const service of services.rows) {
      for (let dayOffset = 1; dayOffset <= WEEKS_AHEAD * 7; dayOffset += 1) {
        const day = new Date();
        day.setDate(day.getDate() + dayOffset);
        const weekday = day.getDay();
        if (weekday === 0 || weekday === 6) {
          continue;
        }

        for (const [hour, minute] of START_TIMES) {
          const startsAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
          const endsAt = new Date(startsAt.getTime() + service.duration_max_minutes * 60_000);
          const result = await pool.query(
            `insert into availability_slots (service_id, starts_at, ends_at)
             values ($1, $2, $3)
             on conflict (service_id, starts_at) do nothing`,
            [service.id, startsAt, endsAt],
          );
          created += result.rowCount ?? 0;
        }
      }
    }

    console.log(`Created ${created} availability slots across ${services.rows.length} services.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
