# API: Admin Endpoints

Base route group: `src/app/api/admin/*`

All routes require authenticated admin session (`role = admin`).

## `GET /api/admin/stats`

File: `src/app/api/admin/stats/route.ts`

### Response payload

```json
{
  "totalUsers": 42,
  "totalReviews": 1300,
  "activeAnnotators": 27,
  "completionRate": 6.2
}
```

### Calculation details

1. `totalUsers`: exact row count of `annotators`.
2. `totalReviews`: exact row count of `meme_reviews`.
3. `activeAnnotators`: unique `annotator_id` count from all review rows.
4. `completionRate`: `(totalReviews / (totalUsers * 500)) * 100`, rounded to 1 decimal.

### Error responses

| Status | Message |
|---|---|
| 403 | `Forbidden` |
| 500 | `Failed to fetch admin stats` |
| 500 | `Failed to fetch active annotators` |

## `GET /api/admin/download?type=users|reviews`

File: `src/app/api/admin/download/route.ts`

### `type=users`

Returns CSV `user_details.csv` with columns:

1. `id`
2. `username`
3. `age`
4. `political_outlook`
5. `religious_perspective`
6. `internet_literacy`
7. `dark_humor_tolerance`
8. `created_at`

### `type=reviews`

Returns CSV `meme_reviews.csv` with columns:

1. `id`
2. `username`
3. `image_name`
4. `display_order`
5. `perception`
6. `is_offensive`
7. `contains_vulgarity`
8. `primary_target`
9. `moderation_decision`
10. `created_at`

### CSV implementation details

1. Double quotes are escaped as `""`.
2. Values with comma/newline/quote are fully quoted.
3. Joined relation fields are normalized whether Supabase returns object or one-element array.

### Error responses

| Status | Message |
|---|---|
| 403 | `Forbidden` |
| 400 | `Invalid type. Must be 'users' or 'reviews'` |
| 500 | `Failed to fetch user data` |
| 500 | `Failed to fetch review data` |
