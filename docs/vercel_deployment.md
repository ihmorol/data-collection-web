# Vercel Deployment Checklist

## 1. Prepare

1. Push the `main` branch to your Git provider.
2. In Vercel, import the repository as a new project.
3. Keep framework preset as **Next.js**.

## 2. Environment Variables

Add these in Vercel for **Production** (and Preview if needed):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET` (32+ chars)

## 3. Build & Deploy

1. Trigger deployment from Vercel dashboard.
2. Confirm build succeeds.
3. Open deployed URL and verify:
   - `/login`
   - `/register`
   - `/gallery`
   - `/meme/1`
   - `/admin`

## 4. Production Smoke Tests

1. Register a test user and complete one annotation.
2. Login as admin and confirm stats load.
3. Download both CSV files and open them locally.
4. Check image delivery from `/memes/...`.
5. Check response headers include:
   - `Content-Security-Policy`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`

## 5. Notes

- `middleware.ts` works, but Next.js 16 warns that middleware naming is deprecated in favor of `proxy.ts`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in client code.
