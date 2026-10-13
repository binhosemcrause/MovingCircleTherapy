import type { Pool, PoolClient } from 'pg';
import { env } from '../../../config/env';
import type {
  AvailabilityDateRange,
  IAvailabilityRepository,
  OpenSlotFilter,
} from '../domain/IAvailabilityRepository';
import type { AvailabilitySlot } from '../domain/AvailabilitySlot';

// Sessions start on this grid, counted from the start of the therapist's day.
const SLOT_STEP_MINUTES = 60;
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 92;

interface OpenSlotRow {
  starts_at: Date;
  ends_at: Date;
  therapist_ids: string[];
}

export interface OpenSlotQuery extends AvailabilityDateRange, OpenSlotFilter {
  serviceId: string;
  // Narrow to this exact start time; from / to are then ignored.
  at?: Date;
}

// Open times are derived, not stored: every active therapist who takes the
// service's category contributes the starts that fit inside their working
// hours for that weekday, minus the ones overlapping a live appointment of
// theirs. Working hours are wall-clock in the practice's timezone, so each
// day's hours are converted with "at time zone" (which keeps 9am at 9am
// across daylight-saving changes).
//
// Takes a client so booking can run it inside its transaction.
export async function queryOpenSlots(db: Pool | PoolClient, query: OpenSlotQuery): Promise<AvailabilitySlot[]> {
  const result = await db.query<OpenSlotRow>(
    `with bounds as (
       select coalesce(
                ($4::timestamptz at time zone $7::text)::date,
                $2::date,
                (now() at time zone $7::text)::date
              ) as from_day
     ),
     range as (
       select from_day,
              case when $4::timestamptz is not null then from_day
                   else least(coalesce($3::date, from_day + $9::int), from_day + $10::int)
              end as to_day
       from bounds
     ),
     open as (
       select t.id as therapist_id, t.position, slot.starts_at,
              slot.starts_at + make_interval(mins => s.duration_max_minutes) as ends_at
       from services s
       cross join range
       join therapists t
         on t.is_active
        and (t.offered_categories is null or s.category = any (t.offered_categories))
        and not (s.category = any (t.excluded_categories))
       join therapist_working_hours h on h.therapist_id = t.id
       cross join lateral generate_series(
         range.from_day::timestamp, range.to_day::timestamp, interval '1 day'
       ) as day
       cross join lateral generate_series(
         (day::date + h.start_time) at time zone $7::text,
         (day::date + h.end_time) at time zone $7::text - make_interval(mins => s.duration_max_minutes),
         make_interval(mins => $8::int)
       ) as slot (starts_at)
       where s.id = $1
         and extract(dow from day) = h.weekday
         and slot.starts_at > now()
         and ($4::timestamptz is null or slot.starts_at = $4)
         and ($5::uuid is null or t.id = $5)
         and not exists (
           select 1
           from appointments a
           join services booked on booked.id = a.service_id
           where a.therapist_id = t.id
             and a.status <> 'cancelled'
             and ($6::uuid is null or a.id <> $6)
             and a.scheduled_at < slot.starts_at + make_interval(mins => s.duration_max_minutes)
             and a.scheduled_at + make_interval(mins => booked.duration_max_minutes) > slot.starts_at
         )
     )
     select starts_at, ends_at, array_agg(therapist_id order by position) as therapist_ids
     from open
     group by starts_at, ends_at
     order by starts_at`,
    [
      query.serviceId,
      query.from ?? null,
      query.to ?? null,
      query.at ?? null,
      query.therapistId ?? null,
      query.excludeAppointmentId ?? null,
      env.PRACTICE_TIMEZONE,
      SLOT_STEP_MINUTES,
      DEFAULT_RANGE_DAYS,
      MAX_RANGE_DAYS,
    ],
  );
  return result.rows.map((row) => ({
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    therapistIds: row.therapist_ids,
  }));
}

export class PgAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly pool: Pool) {}

  async findOpenSlots(serviceId: string, range: AvailabilityDateRange): Promise<AvailabilitySlot[]> {
    return queryOpenSlots(this.pool, { serviceId, ...range });
  }

  async findOpenSlotAt(serviceId: string, startsAt: Date, filter: OpenSlotFilter = {}): Promise<AvailabilitySlot | null> {
    const slots = await queryOpenSlots(this.pool, { serviceId, at: startsAt, ...filter });
    return slots[0] ?? null;
  }
}
