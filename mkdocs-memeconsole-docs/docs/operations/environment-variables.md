# Environment Variables

Canonical template file: `.env.example`

## Full variable reference

| Variable | Required | Scope | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public + Server | Supabase anon API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | privileged DB access for API routes/scripts |
| `ADMIN_BOOTSTRAP_USERNAME` | Recommended | Server only | admin username used by seed script |
| `ADMIN_BOOTSTRAP_PASSWORD` | Recommended | Server only | admin password used by seed script |
| `ADMIN_USERNAME` | Optional fallback | Server only | old fallback admin username |
| `ADMIN_PASSWORD` | Optional fallback | Server only | old fallback admin password |
| `SESSION_SECRET` | Yes | Server only | JWT signing key, minimum 32 chars |
| `JWT_ISSUER` | Recommended | Server only | expected JWT issuer claim |
| `JWT_AUDIENCE` | Recommended | Server only | expected JWT audience claim |
| `UPSTASH_REDIS_REST_URL` | Optional (recommended in prod) | Server only | distributed login rate limit backend |
| `UPSTASH_REDIS_REST_TOKEN` | Optional (recommended in prod) | Server only | Upstash auth token |
| `ALLOWED_ORIGINS` | Optional | Server only | extra CSRF-allowed origins, comma-separated |

## Example local bootstrap

```bash
cp .env.example .env.local
```

Then fill values.

## Security rules

1. Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.
2. Never commit `.env.local`.
3. Rotate `SESSION_SECRET` and admin credentials on compromise.
4. Use Upstash env vars in production to avoid per-instance memory-only limits.

## Session defaults

If `JWT_ISSUER` or `JWT_AUDIENCE` are missing, runtime defaults are:

1. Issuer: `memeconsole`
2. Audience: `memeconsole-web`
