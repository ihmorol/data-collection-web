# API: Auth Endpoints

Base route group: `src/app/api/auth/*`

## `POST /api/auth/register`

File: `src/app/api/auth/register/route.ts`

### Request body

```json
{
  "username": "string (min 3)",
  "password": "string (min 6)",
  "age": 18,
  "political_outlook": "Progressive|Moderate|Conservative|Apolitical",
  "religious_perspective": "Not Religious|Moderately Religious|Very Religious",
  "internet_literacy": "Casual User|Meme Savvy|Chronically Online",
  "dark_humor_tolerance": 1
}
```

### Success response

Status: `201`

```json
{
  "success": true,
  "userId": 123
}
```

Also sets `session` cookie with user role.

### Error responses

| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid or missing fields |
| 400 | `INVALID_REQUEST` | Non-JSON or malformed body |
| 409 | `USERNAME_TAKEN` | Username already exists |
| 500 | `LOOKUP_FAILED` | Username lookup failure |
| 500 | `REGISTRATION_FAILED` | Insert failure |
| 403 | `CSRF_BLOCKED` | Origin rejected |

## `POST /api/auth/login`

File: `src/app/api/auth/login/route.ts`

### Request body

```json
{
  "username": "string",
  "password": "string",
  "rememberMe": true
}
```

### Behavior

1. Runs CSRF validation.
2. Runs login rate limiting.
3. Attempts admin authentication first from `admins` table.
4. Falls back to annotator authentication from `annotators` table.
5. Creates signed session cookie with role and configurable TTL.

### Success response

```json
{
  "success": true,
  "role": "admin"
}
```

or

```json
{
  "success": true,
  "role": "user"
}
```

### Error responses

| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing username/password |
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `INVALID_CREDENTIALS` | Wrong username or password |
| 429 | `RATE_LIMITED` | Too many attempts; includes `Retry-After` header |
| 500 | `LOGIN_FAILED` | DB or lookup failure |
| 403 | `CSRF_BLOCKED` | Origin rejected |

## `POST /api/auth/logout`

File: `src/app/api/auth/logout/route.ts`

### Behavior

1. Runs CSRF validation.
2. Clears session cookie (`maxAge: 0`).

### Response

```json
{
  "success": true
}
```

## `GET /api/auth/check-username?u=<username>`

File: `src/app/api/auth/check-username/route.ts`

### Response

```json
{
  "available": true
}
```

### Error responses

| Status | Response |
|---|---|
| 400 | `{"error":"Username must be at least 3 characters"}` |
| 500 | `{"error":"Unable to check username availability"}` |
