# MemeConsole API + Environment Setup Guide

This guide covers exactly where to collect each key and how to configure local + Vercel environments.

## 1. Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_BOOTSTRAP_USERNAME=
ADMIN_BOOTSTRAP_PASSWORD=

SESSION_SECRET=
JWT_ISSUER=memeconsole
JWT_AUDIENCE=memeconsole-web

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

ALLOWED_ORIGINS=
```

## 2. Supabase Keys (Where to Get)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project.
3. Open **Settings**.
4. Open **API**.
5. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Upstash Redis Keys (Where to Get)

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Create a Redis database (free plan).
3. Open database details.
4. Copy:
   - `REST URL` → `UPSTASH_REDIS_REST_URL`
   - `REST Token` → `UPSTASH_REDIS_REST_TOKEN`

## 4. Generate Session Secret

Run:

```bash
openssl rand -base64 48
```

Then place output in `SESSION_SECRET`.

Generated example:

```env
SESSION_SECRET=r7WEwONUNkq6HSyn0SkWuA5jr+zj2ZKoinhUsaDZ9F4byD9NR7akFwbOQQctASZt
```

## 5. Local Setup

1. Copy example env:

```bash
cp .env.example .env.local
```

2. Fill all required values in `.env.local`.
3. Run DB migrations in Supabase SQL editor:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_admin_auth_and_policies.sql`
4. Seed meme bank:

```bash
npm run seed
```

5. Seed admin account:

```bash
npm run seed:admin
```

6. Start app:

```bash
npm run dev
```

## 6. Vercel Setup

1. Open Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add all required keys for:
   - Production
   - Preview (recommended)
4. Redeploy.

## 7. API Endpoints in This App

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/check-username?u=...`

### User Responses
- `GET /api/responses`
- `POST /api/responses`
- `GET /api/responses/[id]`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/download?type=users|reviews`

## 8. Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- CSRF checks are enforced for mutating endpoints.
- Login rate limiting uses Upstash if configured, and in-memory fallback otherwise.
- Session JWT uses `SESSION_SECRET`, `JWT_ISSUER`, and `JWT_AUDIENCE`.
