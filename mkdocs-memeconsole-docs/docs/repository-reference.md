# Repository Reference

This is the source map for key files in the repository.

## Top-level directories

| Path | Purpose |
|---|---|
| `src/` | application source code (pages, APIs, components, libs) |
| `supabase/` | SQL migrations |
| `scripts/` | seed/verify/e2e scripts |
| `docs/` | original project markdown docs imported into this MkDocs site |
| `Stratified_Dataset/` | CSV splits and image corpus used for seed generation |
| `public/` | static assets served by Next.js (`/memes/*`, icons) |
| `ui-design/` | original UI concept references and screenshots |
| `mkdocs-memeconsole-docs/` | standalone documentation project created in this task |

## Application source map (`src/`)

### `src/app/`

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | root HTML shell, fonts, toast viewport |
| `src/app/page.tsx` | redirect from `/` to `/login` |
| `src/app/globals.css` | Tailwind theme tokens and shared utility classes |
| `src/app/(auth)/login/page.tsx` | login UI and auth submission flow |
| `src/app/(auth)/register/page.tsx` | registration form + validations + username check |
| `src/app/(dashboard)/gallery/page.tsx` | meme grid and progress dashboard |
| `src/app/(dashboard)/meme/[id]/page.tsx` | meme review page and submission flow |
| `src/app/(admin)/admin/page.tsx` | admin stats and CSV export UI |
| `src/app/api/auth/register/route.ts` | registration API |
| `src/app/api/auth/login/route.ts` | login API with rate limiting |
| `src/app/api/auth/logout/route.ts` | logout API |
| `src/app/api/auth/check-username/route.ts` | username availability API |
| `src/app/api/responses/route.ts` | gallery data API and review upsert API |
| `src/app/api/responses/[id]/route.ts` | single meme payload API |
| `src/app/api/admin/stats/route.ts` | admin stats API |
| `src/app/api/admin/download/route.ts` | admin CSV exports API |

### `src/components/`

| File | Purpose |
|---|---|
| `src/components/NavBar.tsx` | user/admin top navigation |
| `src/components/MemeCard.tsx` | gallery meme card tile |
| `src/components/ProgressBar.tsx` | completion progress bar |
| `src/components/SurveyForm.tsx` | 5-question annotation form |
| `src/components/ui/AgeInput.tsx` | bounded age input |
| `src/components/ui/GlowButton.tsx` | reusable primary CTA |
| `src/components/ui/RadioCards.tsx` | keyboard-friendly radio card group |
| `src/components/ui/SegmentedPills.tsx` | segmented option selector |
| `src/components/ui/SliderInput.tsx` | slider with value/ticks/labels |
| `src/components/ui/Skeleton.tsx` | shimmer loading placeholder |
| `src/components/ui/Toast.tsx` | toast bus + viewport renderer |

### `src/lib/`

| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | singleton Supabase clients |
| `src/lib/auth.ts` | password hashing and JWT cookie sessions |
| `src/lib/csrf.ts` | origin validation for mutating requests |
| `src/lib/rate-limit.ts` | login rate limiting (Upstash + fallback) |

### Runtime guard

| File | Purpose |
|---|---|
| `src/proxy.ts` | role-aware route/API protection and session verification |

## Database files (`supabase/`)

| File | Purpose |
|---|---|
| `supabase/migrations/0001_initial_schema.sql` | base schema for annotators/memes/reviews + indexes + RLS enable |
| `supabase/migrations/0002_admin_auth_and_policies.sql` | admin table + deny-all policies |

## Script files (`scripts/`)

| File | Purpose |
|---|---|
| `scripts/seed.ts` | seed meme bank from dataset CSV files |
| `scripts/seed-admin.ts` | bootstrap admin credential row |
| `scripts/verify-seed.ts` | data + file consistency checks |
| `scripts/e2e_smoke.py` | Playwright smoke run and screenshots |

## Config and metadata files

| File | Purpose |
|---|---|
| `package.json` | scripts and dependency manifest |
| `next.config.ts` | security headers and CSP generation |
| `tsconfig.json` | TypeScript compiler config |
| `eslint.config.mjs` | lint configuration |
| `postcss.config.mjs` | PostCSS plugin setup |
| `.env.example` | environment variable template |
| `.gitignore` | ignored files and sensitive env patterns |

## Original docs files (`docs/`)

| File | Purpose |
|---|---|
| `docs/system_architecture.md` | in-depth architecture and flow narratives |
| `docs/implementation_plan.md` | implementation plan and phased tasks |
| `docs/ux_descriptions.md` | UX behavior descriptions |
| `docs/api_env_setup.md` | environment and API setup guide |
| `docs/vercel_deployment.md` | deployment checklist |
| `docs/task.md` | completion checklist |

These are mirrored into this documentation site under `Existing Project Docs`.
