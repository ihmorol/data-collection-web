# Testing and QA

## Baseline checks

1. `npm run lint`
2. `npm run build`
3. `npm run verify:seed`
4. `npm run test:e2e:smoke`

## E2E smoke workflow

Script file: `scripts/e2e_smoke.py`

### Covered flow

1. Open register page.
2. Register dynamic user (`e2e_user_<timestamp>`).
3. Enter gallery and continue to first meme.
4. Submit first meme review.
5. Logout.
6. Login as created user and verify prefill path.
7. If admin creds exist, login admin and trigger CSV downloads.

### Outputs

1. Screenshots are written to `E2E_SCREENSHOT_DIR` or `/tmp/memeconsole-e2e`.
2. Useful for visual regression spot checks.

## Known current test gaps

1. No unit tests for utility libs (`auth`, `csrf`, `rate-limit`).
2. No contract tests for each API error branch.
3. No load tests for admin stats active-annotator scan.
4. No automated validation of CSP header policy behavior in CI.

## Suggested QA expansion

1. Add API route integration tests for all status codes.
2. Add component interaction tests for `SurveyForm` completeness logic.
3. Add proxy behavior tests for role mismatch redirects/forbidden responses.
4. Add CI step running lint/build/verify-seed/e2e smoke in sequence.
