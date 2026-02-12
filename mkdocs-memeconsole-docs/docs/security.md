# Security

This section consolidates security behavior across `src/lib/*`, `src/proxy.ts`, and `next.config.ts`.

## Session and JWT model

Primary file: `src/lib/auth.ts`

### Token construction

1. Algorithm: `HS256`.
2. Claims include `userId`, `role`, `iss`, `aud`, `exp`.
3. Issuer defaults to `memeconsole`.
4. Audience defaults to `memeconsole-web`.
5. Default max age is 24 hours (`86400` seconds).
6. `rememberMe` extends max age to 30 days.

### Cookie security flags

1. Name: `session`.
2. `httpOnly: true`.
3. `sameSite: "strict"`.
4. `secure: true` only in production.
5. `path: "/"`.

## Proxy access control

Primary file: `src/proxy.ts`

### Protected route behavior

1. User pages (`/gallery`, `/meme*`) require `role = user`.
2. Admin pages (`/admin*`) require `role = admin`.
3. User APIs (`/api/responses*`) require `role = user`.
4. Admin APIs (`/api/admin*`) require `role = admin`.
5. Public routes (`/login`, `/register`) redirect authenticated users away.

### Token verification in proxy

1. Validates HMAC signature with Web Crypto API.
2. Validates claim types and allowed roles.
3. Validates issuer and audience.
4. Enforces expiration if present.

## CSRF origin controls

Primary file: `src/lib/csrf.ts`

### Enforcement logic

1. Blocks when `sec-fetch-site` is `cross-site`.
2. Allows no-origin requests for non-browser/internal scenarios.
3. Builds allowlist from:
   - request origin derived from forwarded host/protocol
   - optional env `ALLOWED_ORIGINS` (comma-separated)
4. Returns structured 403 JSON on failure:

```json
{
  "success": false,
  "code": "CSRF_BLOCKED",
  "error": "Forbidden"
}
```

## Login rate limiting

Primary file: `src/lib/rate-limit.ts`

### Limits

1. Window: 60 seconds.
2. Max attempts: 5.

### Modes

1. Preferred: Upstash Redis REST commands (`INCR`, `EXPIRE`, `TTL`).
2. Fallback: in-memory map keyed by client IP.

### Client IP resolution

1. `x-forwarded-for` first value.
2. fallback `x-real-ip`.
3. fallback `unknown:<user-agent>`.

## Response header hardening

Primary file: `next.config.ts`

### Headers added globally

1. `Content-Security-Policy`
2. `X-Frame-Options: DENY`
3. `X-Content-Type-Options: nosniff`
4. `Referrer-Policy: strict-origin-when-cross-origin`

### CSP details

1. Default source self.
2. Script source self.
3. Style source self + Google Fonts styles endpoint.
4. Font source self + Google Fonts static endpoint.
5. Connect source includes resolved Supabase origin and wildcard Supabase domains.
6. `frame-ancestors 'none'` to prevent embedding.
