# Getting Started

## Prerequisites

1. Node.js 20+.
2. npm 10+.
3. A Supabase project.
4. Optional but recommended: Upstash Redis for production-grade distributed login rate limiting.

## Install dependencies

```bash
npm install
```

## Configure environment

Copy and edit environment variables:

```bash
cp .env.example .env.local
```

Minimum required values for local app runtime:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `SESSION_SECRET`

Recommended additional values:

1. `JWT_ISSUER` and `JWT_AUDIENCE`
2. `ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD`
3. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. `ALLOWED_ORIGINS`

## Apply database migrations

Run SQL files in Supabase SQL editor in this order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_admin_auth_and_policies.sql`

## Seed dataset and bootstrap admin

```bash
npm run seed
npm run seed:admin
```

Optional verification:

```bash
npm run verify:seed
```

## Start development server

```bash
npm run dev
```

Open:

1. `http://localhost:3000/login`
2. `http://localhost:3000/register`
3. `http://localhost:3000/gallery` (requires user session)
4. `http://localhost:3000/admin` (requires admin session)

## Quality commands

```bash
npm run lint
npm run build
npm run test:e2e:smoke
```

## Documentation site commands

From `mkdocs-memeconsole-docs/`:

```bash
pip install -r requirements.txt
mkdocs serve
mkdocs build
```

> Note: `mkdocs` was not installed in this environment while generating this docs set, so build execution was not run here.
