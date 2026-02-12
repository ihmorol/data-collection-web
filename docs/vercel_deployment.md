# Vercel Deployment Checklist

## 1. Prepare

1. Push the `main` branch to your Git provider.
2. In Vercel, import the repository as a new project.
3. Keep framework preset as **Next.js**.

## 2. Collect Required Keys First

### Supabase

1. Open Supabase Dashboard.
2. Select your project.
3. Go to **Settings → API**.
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### Upstash Redis (for distributed login rate limits)

1. Open https://console.upstash.com/
2. Create a Redis database (free tier is enough).
3. Open the database details page.
4. Copy:
   - **REST URL** → `UPSTASH_REDIS_REST_URL`
   - **REST Token** → `UPSTASH_REDIS_REST_TOKEN`

### Session Secret

Generate:

```bash
openssl rand -base64 48
```

Use output as `SESSION_SECRET` (minimum 32 chars).

## 3. Environment Variables

Add these in Vercel for **Production** (and Preview if needed):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_BOOTSTRAP_USERNAME`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `SESSION_SECRET` (32+ chars)
- `JWT_ISSUER` (e.g. `memeconsole`)
- `JWT_AUDIENCE` (e.g. `memeconsole-web`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ALLOWED_ORIGINS` (optional, comma-separated)

## 4. Build & Deploy

1. Trigger deployment from Vercel dashboard.
2. Confirm build succeeds.
3. Open deployed URL and verify:
   - `/login`
   - `/register`
   - `/gallery`
   - `/meme/1`
   - `/admin`

## 5. Production Smoke Tests

1. Register a test user and complete one annotation.
2. Seed admin once (`npm run seed:admin`) and login as admin to confirm stats load.
3. Download both CSV files and open them locally.
4. Check image delivery from `/memes/...`.
5. Check response headers include:
   - `Content-Security-Policy`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`

## 6. Notes

- Route protection now uses `src/proxy.ts` (Next.js 16 convention).
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in client code.
