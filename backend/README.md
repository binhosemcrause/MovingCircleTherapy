# Backend

API for the Moving Circle Therapy mobile app. Node.js + TypeScript + Express, PostgreSQL, organized as a modular monolith following clean architecture (domain / application / infrastructure / presentation per module).

See `openapi.yml` for the API contract and `sql/schema.sql` for the database schema.

## Modules

- `src/modules/auth` — register, login, refresh, logout
- `src/modules/profile` — authenticated user profile
- `src/modules/services` — service listings and availability
- `src/modules/therapists` — the therapists a client can book with
- `src/modules/appointments` — booking, rescheduling, cancellation
- `src/modules/notifications` — therapists' booking notifications (in-app list and email)
- `src/modules/resources` — educational resources
- `src/modules/enquiries` — contact form submissions

## Setup

```bash
cp .env.example .env   # then edit DATABASE_URL / JWT secrets
npm install
npm run db:migrate     # applies sql/schema.sql
npm run dev
```

## Commands

```bash
npm run dev        # start with hot reload (tsx)
npm run build      # compile to dist/
npm start           # run compiled build
npm run typecheck  # tsc --noEmit
npm run db:migrate # apply sql/schema.sql to DATABASE_URL
npm run db:therapist-accounts -- <slug>=<email> # give therapists a login (see scripts/createTherapistAccounts.ts)
```

## Roles

Every user has a role: `client` (the default on sign-up), `therapist`, or `admin`. Only admins can add, change or delete therapists and give them a login (`PUT /therapists/{id}/account`). Admins are the accounts listed in `ADMIN_EMAILS`; they are granted the role on boot, and those emails can't be claimed through public sign-up. A therapist who is also an admin has the `admin` role and stays linked to their therapist record.

## Availability

Open booking times are not stored: they are computed from each therapist's working hours (`therapist_working_hours`, wall-clock in `PRACTICE_TIMEZONE`) and the service categories they take (`therapists.offered_categories` / `excluded_categories`), minus their live appointments. Sessions start on the hour. The team's schedule is seeded by `sql/migrations/005_add_therapist_availability.sql`; change it by editing those rows.

## Therapist notifications

Booking a session stores a notification for the chosen therapist and emails them through [Resend](https://resend.com) when `RESEND_API_KEY` and `EMAIL_FROM` are set. A therapist sees their sessions in the app once their record is linked to a login — an admin creates it from the Team section of their profile, or run `npm run db:therapist-accounts` with their email.
