-- Adds therapists, links each appointment to the therapist the client chose,
-- and records a notification for that therapist when a session is booked.
-- schema.sql already includes these tables for fresh installs; this
-- migration brings an existing database up to date and seeds the team.
create table if not exists therapists (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  first_name   text not null,
  last_name    text not null,
  title        text not null,
  bio          text not null default '',
  specialties  text[] not null default '{}',
  photo_url    text,
  email        citext,
  position     integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists therapists_slug_key on therapists (slug);

create or replace trigger therapists_set_updated_at
  before update on therapists
  for each row execute function set_updated_at();

alter table appointments
  add column if not exists therapist_id uuid references therapists (id) on delete set null;

create index if not exists appointments_therapist_id_idx on appointments (therapist_id);

-- A therapist can hold only one live appointment per start time, across
-- all services.
create unique index if not exists appointments_therapist_scheduled_key
  on appointments (therapist_id, scheduled_at)
  where therapist_id is not null and status <> 'cancelled';

create table if not exists therapist_notifications (
  id              uuid primary key default gen_random_uuid(),
  therapist_id    uuid not null references therapists (id) on delete cascade,
  appointment_id  uuid references appointments (id) on delete cascade,
  type            text not null,
  title           text not null,
  body            text not null,
  delivered_at    timestamptz,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists therapist_notifications_therapist_idx
  on therapist_notifications (therapist_id, created_at desc);
create index if not exists therapist_notifications_undelivered_idx
  on therapist_notifications (created_at) where delivered_at is null;

insert into therapists (slug, first_name, last_name, title, bio, specialties, position) values
  ('aditi-sawarkar', 'Aditi', 'Sawarkar', 'Practice Director & Creative Arts Therapist',
   'Specializes in using painting and sculpture to navigate emotional blockages and trauma.',
   '{Individual,Couples}', 1),
  ('jasmine-ahluwalia', 'Jasmine', 'Ahluwalia', 'Creative Director & Creative Arts Therapist',
   'Focuses on somatic experiencing and physical expression to process anxiety.',
   '{Individual,Groups}', 2),
  ('anamika-kaur', 'Anamika', 'Kaur', 'Counsellor and Social Worker',
   'Integrates narrative therapy with gentle movement to rebuild connection and trust.',
   '{Family,Couples}', 3)
on conflict (slug) do nothing;
