# Data Seeding Pipeline

## Dataset source

Folder: `Stratified_Dataset/`

CSV inputs:

1. `training.csv`
2. `validation.csv`
3. `testing.csv`

Image source folder:

1. `Stratified_Dataset/Img/`

Runtime serving location expected by app:

1. `public/memes/`

## Script: meme bank seed

File: `scripts/seed.ts`

### Pipeline steps

1. Parse each CSV with custom parser supporting quoted values.
2. Convert rows into object maps keyed by header names.
3. Traverse files in fixed order: training, validation, testing.
4. Deduplicate by `image_name`.
5. Build record shape:
   - `image_name`
   - `caption` (from CSV `Captions`)
   - `ground_truth_label` (from CSV `Label`)
   - `display_order` (1..N)
6. Upsert into `meme_bank` in chunks of 100 rows using `onConflict: image_name`.

### Command

```bash
npm run seed
```

## Script: admin seed

File: `scripts/seed-admin.ts`

### Behavior

1. Reads `ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD`.
2. Falls back to `ADMIN_USERNAME` / `ADMIN_PASSWORD` if bootstrap values are missing.
3. Enforces username length >= 3 and password length >= 10.
4. Hashes password with same auth hashing utility used in runtime.
5. Upserts into `admins` table on `username` conflict.

### Command

```bash
npm run seed:admin
```

## Script: seed verification

File: `scripts/verify-seed.ts`

### Checks

1. Verifies `meme_bank` row count equals 500.
2. Verifies `display_order` is contiguous and starts at 1.
3. Verifies every `image_name` exists under `public/memes/`.
4. Reports first set of issues and exits with non-zero status on failure.

### Command

```bash
npm run verify:seed
```

## Failure diagnostics

Common seed failures:

1. Missing env vars for Supabase URL/service key.
2. Missing `public/memes` symlink or files.
3. Schema not migrated before seeding.
4. CSV headers changed from expected names.
