# Deployment

Target deployment platform is Vercel.

## Pre-deploy checklist

1. Push main branch to your Git provider.
2. Ensure Supabase migrations are applied.
3. Ensure seed scripts have run (`seed`, `seed:admin`).
4. Ensure environment variables are set in Vercel.

## Required environment variables in Vercel

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `ADMIN_BOOTSTRAP_USERNAME`
5. `ADMIN_BOOTSTRAP_PASSWORD`
6. `SESSION_SECRET`
7. `JWT_ISSUER`
8. `JWT_AUDIENCE`
9. `UPSTASH_REDIS_REST_URL`
10. `UPSTASH_REDIS_REST_TOKEN`
11. `ALLOWED_ORIGINS` (optional)

## Build and runtime notes

1. App routes and API routes are deployed as Next.js serverless functions.
2. Proxy route guard runs at edge/runtime entry based on Next.js middleware/proxy behavior.
3. Static memes must be available under `public/memes` at build/deploy time.

## Production smoke checks

1. Register a test annotator and submit one review.
2. Login as admin and confirm stats load.
3. Download both CSV files.
4. Verify security headers on any page response.
5. Verify route protections for unauthorized users.

## Security in production

1. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
2. Use long, random `SESSION_SECRET`.
3. Use Upstash for distributed rate limiting in multi-instance deployments.
4. Configure `ALLOWED_ORIGINS` when serving across multiple known hostnames.

## Additional deployment guide

For the original deployment checklist, see:

`Existing Project Docs -> Vercel Deployment Checklist`
