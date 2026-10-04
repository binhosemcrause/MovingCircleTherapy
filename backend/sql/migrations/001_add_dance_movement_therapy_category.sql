-- Adds the 'dance_movement_therapy' value to the service_category enum.
-- schema.sql already includes it for fresh installs (CREATE TYPE lists it
-- directly); this migration brings an existing database up to date, since
-- Postgres enum values can't be added via CREATE TYPE on a type that
-- already exists.
alter type service_category add value if not exists 'dance_movement_therapy';
