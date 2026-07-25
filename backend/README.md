# Backend

API for the Moving Circle Therapy mobile app. Node.js + TypeScript + Express, PostgreSQL, organized as a modular monolith following clean architecture (domain / application / infrastructure / presentation per module).

See `openapi.yml` for the API contract and `sql/schema.sql` for the database schema.

## Modules

- `src/modules/auth` — register, login, refresh, logout
- `src/modules/profile` — authenticated user profile
- `src/modules/services` — service listings and availability
- `src/modules/appointments` — booking, rescheduling, cancellation
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
```
