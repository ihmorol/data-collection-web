# Frontend Route and Page Behavior

## Root and shared layout

### `/` redirect

File: `src/app/page.tsx`

Behavior:

1. Immediate server-side redirect to `/login`.

### Root layout

File: `src/app/layout.tsx`

Behavior:

1. Applies global dark HTML class.
2. Injects Google Fonts + Material Icons links.
3. Wraps app with toast viewport.

## Auth pages

### `/login`

File: `src/app/(auth)/login/page.tsx`

Key behaviors:

1. Validates non-empty username/password before request.
2. Sends `POST /api/auth/login` with `username`, `password`, `rememberMe`.
3. Handles password visibility toggle.
4. Redirects to `/admin` when role is admin, `/gallery` otherwise.
5. Shows generic invalid credential error for security.

### `/register`

File: `src/app/(auth)/register/page.tsx`

Key behaviors:

1. Collects 7 required profile + credential fields.
2. Debounced username availability check via `GET /api/auth/check-username?u=` after 500ms.
3. Client-side validation with ordered first-error focusing.
4. Sends `POST /api/auth/register` with full profile payload.
5. On success, shows toast and redirects to `/gallery`.

## User dashboard pages

### `/gallery`

File: `src/app/(dashboard)/gallery/page.tsx`

Key behaviors:

1. Loads data from `GET /api/responses`.
2. Shows progress summary (`completedCount` vs `totalCount`).
3. Continue button routes to first incomplete meme display order.
4. Renders meme cards with reviewed state icon.
5. Uses skeleton placeholders during loading.

### `/meme/[id]`

File: `src/app/(dashboard)/meme/[id]/page.tsx`

Key behaviors:

1. Loads meme + existing review from `GET /api/responses/[id]`.
2. Displays image and Bangla caption.
3. Uses `SurveyForm` for 5-question annotation.
4. Submits via `POST /api/responses`.
5. Navigates to next meme or back to gallery when last meme is completed.
6. Supports keyboard shortcuts:
   - `ArrowLeft`: previous meme.
   - `ArrowRight`: submit and next when complete.
   - `1` to `5`: jump to question sections.

## Admin page

### `/admin`

File: `src/app/(admin)/admin/page.tsx`

Key behaviors:

1. Loads stats from `GET /api/admin/stats`.
2. Animates counters with reduced-motion fallback.
3. Displays completion rate progress.
4. Provides CSV download actions:
   - `/api/admin/download?type=users`
   - `/api/admin/download?type=reviews`
5. Shows 403 fallback card for unauthorized access.

## Shared navigation

File: `src/components/NavBar.tsx`

Key behaviors:

1. Variant-aware navigation for user/admin context.
2. Desktop link set + mobile menu toggle.
3. Logout action posts `/api/auth/logout` then routes to `/login`.
4. Optional right badge (used on meme page for index progress).
