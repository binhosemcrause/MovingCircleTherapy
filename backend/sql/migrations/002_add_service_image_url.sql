-- Adds an optional hero image URL to services, for the service detail
-- screen. schema.sql already includes the column for fresh installs; this
-- migration brings an existing database up to date.
alter table services add column if not exists image_url text;
