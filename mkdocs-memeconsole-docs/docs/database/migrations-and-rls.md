# Migrations and RLS

## Migration order

Run in exact sequence:

1. `0001_initial_schema.sql`
2. `0002_admin_auth_and_policies.sql`

The second migration depends on tables created in the first one.

## RLS posture

All core tables enable Row Level Security:

1. `annotators`
2. `meme_bank`
3. `meme_reviews`
4. `admins`

## Policies

Each table receives deny-all policies for `anon` and `authenticated` roles:

1. `USING (false)`
2. `WITH CHECK (false)`

This means:

1. Direct client usage of Supabase `anon` key cannot read/write these tables.
2. Server routes must use service role key (`SUPABASE_SERVICE_ROLE_KEY`) to access data.
3. Access control is centralized in Next.js API + proxy logic.

## Why this model is used

1. The app uses custom JWT session and role model in Next.js, not Supabase Auth sessions.
2. Deny-all RLS removes accidental policy gaps in early-stage research tooling.
3. Service-role-only DB access keeps data contract explicit in server code.

## Trade-offs

1. Strong control and simpler reasoning in app layer.
2. No direct browser-to-Supabase data reads.
3. Requires strict server-only handling of service role credentials.

## Change management recommendations

1. Keep each schema change in a new migration file.
2. Add corresponding docs update under database and API sections.
3. Re-run seed verification if schema affects `meme_bank` or file mapping behavior.
4. Re-test auth and proxy behavior when role/session fields change.
