# Scripts and Tooling

## npm scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | run local development server |
| `build` | `next build` | production build check |
| `start` | `next start` | run built app |
| `lint` | `eslint` | lint source files |
| `seed` | `npx tsx scripts/seed.ts` | seed meme bank |
| `seed:admin` | `npx tsx scripts/seed-admin.ts` | seed admin user |
| `verify:seed` | `npx tsx scripts/verify-seed.ts` | verify seed correctness |
| `test:e2e:smoke` | `python3 scripts/e2e_smoke.py` | run Playwright smoke workflow |

## TypeScript config

File: `tsconfig.json`

Key settings:

1. `strict: true`
2. `moduleResolution: bundler`
3. `jsx: react-jsx`
4. alias `@/* -> ./src/*`
5. `noEmit: true`

## ESLint config

File: `eslint.config.mjs`

Uses:

1. `eslint-config-next/core-web-vitals`
2. `eslint-config-next/typescript`

## PostCSS / Tailwind

File: `postcss.config.mjs`

1. Uses `@tailwindcss/postcss` plugin.
2. Tailwind v4 configured via CSS-first theme tokens in `globals.css`.

## Local utility scripts summary

1. `scripts/seed.ts`: loads dataset into `meme_bank`.
2. `scripts/seed-admin.ts`: upserts admin credentials.
3. `scripts/verify-seed.ts`: checks data + file integrity.
4. `scripts/e2e_smoke.py`: browser smoke path with screenshots.
