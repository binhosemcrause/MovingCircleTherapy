-- Adds optional profile fields used by the redesigned Profile screen.
-- schema.sql already includes these for fresh installs; this migration
-- brings an existing database up to date.
alter table users add column if not exists location text;
alter table users add column if not exists tagline text;
alter table users add column if not exists avatar_url text;
