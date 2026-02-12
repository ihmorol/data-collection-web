# Database Schema

Primary schema migration source:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_admin_auth_and_policies.sql`

## Table: `annotators`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | primary key |
| `username` | `TEXT` | unique, not null |
| `password_hash` | `TEXT` | not null |
| `age` | `INTEGER` | not null, check `13..100` |
| `political_outlook` | `TEXT` | enum-like check |
| `religious_perspective` | `TEXT` | enum-like check |
| `internet_literacy` | `TEXT` | enum-like check |
| `dark_humor_tolerance` | `INTEGER` | check `1..10` |
| `created_at` | `TIMESTAMPTZ` | default now() |

## Table: `meme_bank`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | primary key |
| `image_name` | `TEXT` | unique, not null |
| `caption` | `TEXT` | not null |
| `ground_truth_label` | `TEXT` | not null |
| `display_order` | `INTEGER` | not null |

## Table: `meme_reviews`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | primary key |
| `annotator_id` | `INTEGER` | FK to `annotators.id`, `ON DELETE CASCADE` |
| `meme_id` | `INTEGER` | FK to `meme_bank.id`, `ON DELETE CASCADE` |
| `perception` | `TEXT` | enum-like check |
| `is_offensive` | `TEXT` | enum-like check |
| `contains_vulgarity` | `BOOLEAN` | not null |
| `primary_target` | `TEXT` | enum-like check |
| `moderation_decision` | `TEXT` | enum-like check |
| `created_at` | `TIMESTAMPTZ` | default now() |

Additional constraint:

1. unique `(annotator_id, meme_id)` to enforce one review per meme per annotator.

## Table: `admins`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | primary key |
| `username` | `TEXT` | unique, not null |
| `password_hash` | `TEXT` | not null |
| `is_active` | `BOOLEAN` | not null, default true |
| `created_at` | `TIMESTAMPTZ` | default now() |
| `updated_at` | `TIMESTAMPTZ` | default now() |

## Indexes

| Index | Table | Purpose |
|---|---|---|
| `idx_reviews_annotator` | `meme_reviews(annotator_id)` | annotator progress and joins |
| `idx_reviews_meme` | `meme_reviews(meme_id)` | meme-centered lookups |
| `idx_meme_bank_order` | `meme_bank(display_order)` | ordered gallery traversal |
| `idx_admins_username` | `admins(username)` | admin login lookup |
