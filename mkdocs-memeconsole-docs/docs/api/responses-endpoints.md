# API: Responses Endpoints

Base route group: `src/app/api/responses/*`

All routes require authenticated user session (`role = user`).

## `GET /api/responses`

File: `src/app/api/responses/route.ts`

### Purpose

Returns gallery payload with meme list and user review completion state.

### Success payload

```json
{
  "memes": [
    {
      "id": 1,
      "image_name": "example.jpg",
      "caption": "...",
      "display_order": 1,
      "reviewed": false
    }
  ],
  "completedCount": 0,
  "totalCount": 500,
  "firstIncompleteOrder": 1,
  "username": "annotator_name"
}
```

### Data construction details

1. Fetches annotator username from `annotators` by session user id.
2. Fetches full ordered meme list from `meme_bank`.
3. Fetches reviewed meme ids from `meme_reviews` for current annotator.
4. Computes `reviewed` boolean per meme.
5. Computes first incomplete display order.

### Error responses

| Status | Message |
|---|---|
| 401 | `Unauthorized` |
| 500 | `Failed to fetch user` |
| 500 | `Failed to fetch memes` |
| 500 | `Failed to fetch review progress` |

## `POST /api/responses`

File: `src/app/api/responses/route.ts`

### Request body

```json
{
  "meme_id": 1,
  "perception": "Neutral",
  "is_offensive": "Disagree",
  "contains_vulgarity": false,
  "primary_target": "None/General",
  "moderation_decision": "Keep"
}
```

### Validation enum sets

1. `perception`: `Very Negative|Negative|Neutral|Positive|Very Positive`
2. `is_offensive`: `Strongly Disagree|Disagree|Neutral|Agree|Strongly Agree`
3. `contains_vulgarity`: boolean
4. `primary_target`: `None/General|Political Figure|Religious Group|Gender/Identity|Individual`
5. `moderation_decision`: `Keep|Flag/Filter|Remove`

### Write behavior

1. Verifies meme exists in `meme_bank`.
2. Checks if existing review exists for `(annotator_id, meme_id)`.
3. Upserts review with conflict target `annotator_id,meme_id`.
4. Returns `201` for first insert, `200` for update.

### Error responses

| Status | Code | Meaning |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing user session |
| 400 | `VALIDATION_ERROR` | Invalid field values |
| 400 | `INVALID_REQUEST` | Malformed JSON body |
| 404 | `NOT_FOUND` | Meme id not found |
| 500 | `MEME_FETCH_FAILED` | Meme lookup failure |
| 500 | `REVIEW_LOOKUP_FAILED` | Existing review check failure |
| 500 | `REVIEW_SAVE_FAILED` | Upsert failure |
| 403 | `CSRF_BLOCKED` | Origin rejected |

## `GET /api/responses/[id]`

File: `src/app/api/responses/[id]/route.ts`

`[id]` maps to meme `display_order`, not table primary key.

### Success payload

```json
{
  "meme": {
    "id": 1,
    "image_name": "...",
    "caption": "...",
    "display_order": 1
  },
  "existingReview": {
    "perception": "Neutral",
    "is_offensive": "Disagree",
    "contains_vulgarity": false,
    "primary_target": "None/General",
    "moderation_decision": "Keep"
  },
  "totalMemes": 500,
  "userCompletedCount": 1
}
```

### Error responses

| Status | Message |
|---|---|
| 401 | `Unauthorized` |
| 400 | `Invalid meme ID` |
| 404 | `Meme not found` |
| 500 | `Failed to fetch meme` |
| 500 | `Failed to fetch review details` |
