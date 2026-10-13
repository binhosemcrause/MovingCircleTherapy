-- Gives every user a role: client (the default), therapist, or admin. Admins
-- manage the team; ADMIN_EMAILS decides who they are (applied on boot).
-- A therapist who is also an admin (e.g. the practice director) has role
-- admin and stays linked to their therapist record through
-- therapists.user_id. schema.sql already includes this for fresh installs.
do $$
begin
  create type user_role as enum ('client', 'therapist', 'admin');
exception
  when duplicate_object then null;
end
$$;

alter table users add column if not exists role user_role not null default 'client';

-- Accounts linked to a therapist before roles existed.
update users u set role = 'therapist'
from therapists t
where t.user_id = u.id and u.role = 'client';

-- Aditi is both a therapist and an admin: tie her therapist record to her
-- account when that account exists and she isn't linked yet. (The admin
-- role itself comes from ADMIN_EMAILS.)
update therapists t set user_id = u.id, email = u.email
from users u
where t.slug = 'aditi-sawarkar'
  and t.user_id is null
  and u.email = 'aditi@movingcircletherapy.com'
  and not exists (select 1 from therapists other where other.user_id = u.id);

update users u set role = 'therapist'
from therapists t
where t.user_id = u.id and u.role = 'client';
