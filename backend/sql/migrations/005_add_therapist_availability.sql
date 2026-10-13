-- Moves availability from per-service slot rows to each therapist's own
-- schedule: the weekdays and hours they work, and which service categories
-- they take. Open times are computed from this minus their live
-- appointments, so availability_slots is no longer read or written (the
-- table is left in place on existing databases).
--
-- Also links a therapist to the user account they sign in with, so their
-- booking notifications can be shown in the app and emailed to them.
-- schema.sql already includes all of this for fresh installs.
alter table therapists
  add column if not exists user_id uuid references users (id) on delete set null;

create unique index if not exists therapists_user_id_key on therapists (user_id);

-- offered_categories null means every category; excluded_categories is then
-- taken away from whatever is offered.
alter table therapists add column if not exists offered_categories service_category[];
alter table therapists
  add column if not exists excluded_categories service_category[] not null default '{}';

-- Times are wall-clock in the practice's timezone (PRACTICE_TIMEZONE).
-- weekday follows extract(dow): 0 = Sunday .. 6 = Saturday.
create table if not exists therapist_working_hours (
  therapist_id  uuid not null references therapists (id) on delete cascade,
  weekday       smallint not null,
  start_time    time not null,
  end_time      time not null,
  primary key (therapist_id, weekday),
  constraint therapist_working_hours_weekday_check check (weekday between 0 and 6),
  constraint therapist_working_hours_range_check check (end_time > start_time)
);

-- Migrations replay on every boot, so the team's schedule is only seeded for
-- a therapist who has no working hours yet; later edits are left alone.
update therapists t set
  offered_categories = seed.offered::service_category[],
  excluded_categories = seed.excluded::service_category[]
from (values
  ('aditi-sawarkar', null::text[], '{counselling}'::text[]),
  ('jasmine-ahluwalia', null::text[], '{}'::text[]),
  ('anamika-kaur', '{counselling}'::text[], '{}'::text[])
) as seed (slug, offered, excluded)
where t.slug = seed.slug
  and not exists (select 1 from therapist_working_hours h where h.therapist_id = t.id);

-- Aditi: Saturday to Monday, 9am-6pm. Jasmine and Anamika: Mondays, 9am-5pm.
insert into therapist_working_hours (therapist_id, weekday, start_time, end_time)
select t.id, seed.weekday, seed.start_time, seed.end_time
from (values
  ('aditi-sawarkar', 6, time '09:00', time '18:00'),
  ('aditi-sawarkar', 0, time '09:00', time '18:00'),
  ('aditi-sawarkar', 1, time '09:00', time '18:00'),
  ('jasmine-ahluwalia', 1, time '09:00', time '17:00'),
  ('anamika-kaur', 1, time '09:00', time '17:00')
) as seed (slug, weekday, start_time, end_time)
join therapists t on t.slug = seed.slug
where not exists (select 1 from therapist_working_hours h where h.therapist_id = t.id);
