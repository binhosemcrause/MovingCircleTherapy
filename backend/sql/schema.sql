-- Moving Circle Therapy API
-- Database schema (PostgreSQL 14+)
-- Generated from backend/openapi.yml

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------- Enums

create type service_category as enum (
  'counselling',
  'creative_arts_therapy',
  'therapeutic_workshops',
  'family_therapy',
  'couple_movement_therapy',
  'dance_movement_therapy',
  'creative_arts_classes'
);

create type session_format as enum (
  'in_person',
  'virtual'
);

create type appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

create type user_role as enum (
  'client',
  'therapist',
  'admin'
);

create type resource_type as enum (
  'article',
  'worksheet',
  'video',
  'tool'
);

-- ------------------------------------------------------------- Helpers

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------- Users

create table users (
  id             uuid primary key default gen_random_uuid(),
  first_name     text not null,
  last_name      text not null,
  email          citext not null,
  password_hash  text not null,
  phone          text,
  location       text,
  tagline        text,
  avatar_url     text,
  role           user_role not null default 'client',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index users_email_key on users (email);

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

-- --------------------------------------------------------- Refresh tokens

create table refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create unique index refresh_tokens_token_hash_key on refresh_tokens (token_hash);
create index refresh_tokens_user_id_idx on refresh_tokens (user_id);

-- -------------------------------------------------------------- Services

create table services (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  category              service_category not null,
  description           text not null default '',
  duration_min_minutes  integer not null,
  duration_max_minutes  integer not null,
  price                 numeric(10, 2) not null,
  currency              text not null default 'USD',
  image_url             text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint services_duration_check check (duration_max_minutes >= duration_min_minutes)
);

create index services_category_idx on services (category);

create trigger services_set_updated_at
  before update on services
  for each row execute function set_updated_at();

create table service_formats (
  service_id  uuid not null references services (id) on delete cascade,
  format      session_format not null,
  primary key (service_id, format)
);

create table service_features (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services (id) on delete cascade,
  feature     text not null,
  position    integer not null default 0
);

create index service_features_service_id_idx on service_features (service_id, position);

-- ------------------------------------------------------------ Therapists
-- Rows are seeded by sql/migrations/004_add_therapists.sql, and their
-- schedule by 005_add_therapist_availability.sql.

create table therapists (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  first_name   text not null,
  last_name    text not null,
  title        text not null,
  bio          text not null default '',
  specialties  text[] not null default '{}',
  photo_url    text,
  email        citext,
  -- The account this therapist signs in with, if they have one.
  user_id      uuid references users (id) on delete set null,
  -- offered_categories null means every category; excluded_categories is
  -- then taken away from whatever is offered.
  offered_categories   service_category[],
  excluded_categories  service_category[] not null default '{}',
  position     integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index therapists_slug_key on therapists (slug);
create unique index therapists_user_id_key on therapists (user_id);

create trigger therapists_set_updated_at
  before update on therapists
  for each row execute function set_updated_at();

-- ---------------------------------------------------------- Appointments

create table appointments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users (id) on delete cascade,
  service_id           uuid not null references services (id) on delete restrict,
  therapist_id         uuid references therapists (id) on delete set null,
  scheduled_at         timestamptz not null,
  format               session_format not null,
  status               appointment_status not null default 'pending',
  notes                text,
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index appointments_user_id_idx on appointments (user_id);
create index appointments_service_id_idx on appointments (service_id);
create index appointments_status_idx on appointments (status);
create index appointments_therapist_id_idx on appointments (therapist_id);

-- A therapist can hold only one live appointment per start time, across
-- all services.
create unique index appointments_therapist_scheduled_key
  on appointments (therapist_id, scheduled_at)
  where therapist_id is not null and status <> 'cancelled';

create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ------------------------------------------------ Therapist notifications
-- Written in the same transaction as the booking. delivered_at stays null
-- until the therapist has been emailed.

create table therapist_notifications (
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

create index therapist_notifications_therapist_idx
  on therapist_notifications (therapist_id, created_at desc);
create index therapist_notifications_undelivered_idx
  on therapist_notifications (created_at) where delivered_at is null;

-- ---------------------------------------------------------- Availability
-- Open booking times are computed from each therapist's working hours minus
-- their live appointments. Times are wall-clock in the practice's timezone
-- (PRACTICE_TIMEZONE); weekday follows extract(dow): 0 = Sunday.

create table therapist_working_hours (
  therapist_id  uuid not null references therapists (id) on delete cascade,
  weekday       smallint not null,
  start_time    time not null,
  end_time      time not null,
  primary key (therapist_id, weekday),
  constraint therapist_working_hours_weekday_check check (weekday between 0 and 6),
  constraint therapist_working_hours_range_check check (end_time > start_time)
);

-- ------------------------------------------------------------- Resources

create table resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          resource_type not null,
  summary       text,
  url           text not null,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index resources_type_idx on resources (type);
create index resources_published_at_idx on resources (published_at desc);

create trigger resources_set_updated_at
  before update on resources
  for each row execute function set_updated_at();

-- ------------------------------------------------------------- Enquiries

create table enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index enquiries_created_at_idx on enquiries (created_at desc);

commit;
