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

-- ---------------------------------------------------------- Appointments

create table appointments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users (id) on delete cascade,
  service_id           uuid not null references services (id) on delete restrict,
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

create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ---------------------------------------------------------- Availability

create table availability_slots (
  id              uuid primary key default gen_random_uuid(),
  service_id      uuid not null references services (id) on delete cascade,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_booked       boolean not null default false,
  appointment_id  uuid references appointments (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint availability_slots_range_check check (ends_at > starts_at)
);

create unique index availability_slots_service_starts_key on availability_slots (service_id, starts_at);
create index availability_slots_service_id_idx on availability_slots (service_id, starts_at);
create index availability_slots_appointment_id_idx on availability_slots (appointment_id);

create trigger availability_slots_set_updated_at
  before update on availability_slots
  for each row execute function set_updated_at();

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
