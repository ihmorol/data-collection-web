# Meme Data Collection Website — Implementation Plan

Next.js + Supabase app for collecting survey responses on ~500 Bangla memes. Deployed on **Vercel**.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL) |
| Auth | Custom (static admin ID + bcrypt user passwords via Supabase DB) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Images | Static assets from `Stratified_Dataset/Img/` (local paths) |

> [!NOTE]
> **Supabase Free Tier Limits**: 500 MB database, 1 GB file storage, 50K monthly active users, 500K Edge Function invocations, 2 projects max. More than sufficient for this research project.

---

## Database Schema (Supabase PostgreSQL)

### Table: `annotators` (registered users)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| username | TEXT UNIQUE | Username / Alias |
| password_hash | TEXT | bcrypt hashed password |
| age | INTEGER | User's age |
| political_outlook | TEXT | Progressive / Moderate / Conservative / Apolitical |
| religious_perspective | TEXT | Not Religious / Moderately Religious / Very Religious |
| internet_literacy | TEXT | Casual User / Meme Savvy / Chronically Online |
| dark_humor_tolerance | INTEGER | 1-10 scale |
| created_at | TIMESTAMPTZ | Registration timestamp |

### Table: `meme_bank` (seeded from CSVs)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| image_name | TEXT UNIQUE | Filename (e.g., `fb 1424.jpg`) |
| caption | TEXT | Bangla caption from CSV |
| ground_truth_label | TEXT | Original label (political aggression, etc.) |
| display_order | INTEGER | Sequential display order (1-500) |

### Table: `meme_reviews` (user responses)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| annotator_id | INTEGER FK → annotators.id | Who answered |
| meme_id | INTEGER FK → meme_bank.id | Which meme |
| perception | TEXT | Very Negative / Negative / Neutral / Positive / Very Positive |
| is_offensive | TEXT | Strongly Disagree / Disagree / Neutral / Agree / Strongly Agree |
| contains_vulgarity | BOOLEAN | Yes / No |
| primary_target | TEXT | None/General / Political Figure / Religious Group / Gender/Identity / Individual |
| moderation_decision | TEXT | Keep / Flag/Filter / Remove |
| created_at | TIMESTAMPTZ | When answered |
| UNIQUE | (annotator_id, meme_id) | One review per annotator per meme |

---

## Admin Authentication

**Static admin credentials** — hardcoded in environment variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-secure-password>
```

- Admin logs in via the same login page
- Server checks credentials against env vars (no DB row needed)
- Redirects to `/admin` dashboard
- Can download **user_details.csv** and **meme_review.csv**

---

## Survey Questions (per meme)

Each meme page shows the image + caption, then these 5 required questions:

1. **How do you perceive this meme?** — Radio: Very Negative, Negative, Neutral, Positive, Very Positive
2. **Is this meme offensive to any group?** — Radio: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
3. **Contains Vulgarity?** — Radio: Yes, No
4. **Primary Target (if any)** — Radio: None/General, Political Figure, Religious Group, Gender/Identity, Individual
5. **Should this be removed from a general feed?** — Radio: Keep, Flag/Filter, Remove

---

## Project Structure

```
data-collection-app/
├── src/app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── (auth)/login/ & register/
│   ├── (dashboard)/gallery/ & meme/[id]/
│   ├── (admin)/admin/
│   └── api/ (auth, responses, admin downloads)
├── src/components/ (MemeCard, SurveyForm, ui/)
├── src/lib/ (supabase.ts, auth.ts)
├── scripts/seed.ts
├── public/memes/ → symlink to Stratified_Dataset/Img/
└── .env.local
```

---

## Key Features

| Feature | Details |
|---------|---------|
| **Gallery** | Sequential list of ~500 memes, ✅/⬜ status per meme, progress bar, "Continue" button |
| **Meme Page** | Large image + caption + 5 survey questions + prev/next navigation |
| **Resume** | Login anytime, continue from first incomplete meme |
| **Admin** | Static login, download `user_details.csv` and `meme_review.csv` |
| **Seed** | `scripts/seed.ts` reads all 3 CSVs → inserts into `meme_bank` |
| **Images** | Served from `public/memes/` (symlink, no hosting) |

---

## Verification Plan

1. Seed ~500 memes → verify count in Supabase dashboard
2. Register user → verify in `annotators` table
3. Complete meme surveys → verify in `meme_reviews` table
4. Logout/login → "Continue" goes to first incomplete
5. Admin login → download both CSVs
6. Deploy to Vercel → test full flow
