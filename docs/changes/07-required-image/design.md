# C07 design

## To-be
Added
- `src/lib/imgUrl.ts` (no React, no server-only imports, so the form and both routes can import it):
  - `ILLUSTRATION_IDS`: the 9 IDs as a `const` array.
  - `IMG_URL_ERROR = 'Valitse kuvitus tai lataa oma kuva'`.
  - `validImgUrl(value: unknown): string | null`: trims, then returns the value if it is an ID in
    `ILLUSTRATION_IDS`, starts with `/testImages/`, or starts with the bucket prefix; otherwise null.
    For the two prefixes, there must be at least one character after the prefix.
  - Bucket prefix: `process.env.NEXT_PUBLIC_SUPABASE_URL` read as that literal expression (Next inlines
    only literal `process.env.NEXT_PUBLIC_*` reads in the client bundle), trailing `/` stripped, then
    `/storage/v1/object/public/event-images/`. If the variable is unset, the bucket branch rejects
    (no `undefined/storage/...` prefix).
- `tests/e2e/image-rule.spec.ts`: API tests A1–A4, form test A6, seed check A9 (reads the `imgUrl:`
  values from reset/route.ts and seed.ts with a regex and runs `validImgUrl` on each). It reads
  `NEXT_PUBLIC_SUPABASE_URL` from `.env` with `parseEnv` (env.ts stays unchanged, A12).

Changed
- `Illustrations.tsx`: `IllustrationId` becomes `(typeof ILLUSTRATION_IDS)[number]`, imported from
  `src/lib/imgUrl.ts`, so there is one list. Types only; rendering and `illustrations` are unchanged.
- POST `/api/create-event`: after the title/date check, `const imgUrl = validImgUrl(body.imgUrl)`;
  null → 400 `{ error: IMG_URL_ERROR }`. `PLACEHOLDER_IMAGE` and its comment are removed.
- PUT `/api/events/[id]`: the same check after `resolveEvent` and the title/date check, so 401/404/403
  still come first (A5). The `|| result.event.imgUrl` fallback is removed.
- `event-form.tsx`: `<Field label="Valitse kuvitus" required>` (Field already draws the red `*`).
  `handleSubmit` runs `validImgUrl(fields.imgUrl)` before `setLoading`; null → `setError(IMG_URL_ERROR)`
  and return, so no fetch. The error `<p>` gets `data-testid="event-form-error"`.
- `tests/e2e/helpers.ts`: `createEvent` data gets `imgUrl: 'music'` before `...extra`.
- `tests/e2e/event-crud.spec.ts`: one line before the first submit:
  `await page.getByTestId('illustration-option-music').click();` The edit step needs no change:
  the edit form is pre-filled with `music`.

Unchanged
- Rendering on cards and the detail page, the upload tab's `http(s)` detection, `/api/upload-image`,
  all other POST/PUT validation, schema, seed, reset.
- Placeholder events (Q3): the edit form opens on the upload tab, and saving shows IMG_URL_ERROR
  from the client check until the user picks an image.

## Data
None. No migration, no conversion. Seed and reset values already pass (A9 Before).

## Trace
| A# | Design section | Step |
|---|---|---|
| A1, A2 | To-be: imgUrl.ts, POST | S2 |
| A3, A4 | To-be: PUT | S2 |
| A5 | To-be: PUT order | S2 |
| A6, A8 | To-be: event-form.tsx | S3 (A8 manual by me) |
| A7 | To-be: event-crud.spec.ts | S2 |
| A9 | To-be: image-rule.spec.ts | S2 |
| A10 | To-be: POST | S2 |
| A11–A14 | all | S2, S3, S4 |
| A15 | Unchanged/rollback (spec) | S4 (me, after deploy) |

## Plan
S2: Shared rule and API enforcement
Do:     add src/lib/imgUrl.ts; point IllustrationId at it; POST and PUT checks; helpers.ts default;
        event-crud.spec.ts illustration pick; image-rule.spec.ts API tests and seed check.
Don't:  event-form.tsx (S3); env.ts, other specs, any `expect` line; prisma/, reset, upload-image.
Verify: npm run test:e2e (new tests + 26 + 3); grep placehold.co in src/ = 0; git diff of tests
        = 2 named files plus the new spec, 0 `expect` lines changed; build, tsc, lint ≤ 8.
        A1–A5, A7, A9, A10, A12–A14.
Commit: feat(C07-S2): require a valid imgUrl in create and edit APIs

S3: Form check and required marker
Do:     event-form.tsx: `required` on the image Field, client check, event-form-error testid;
        image-rule.spec.ts form test (counts requests to /api/create-event, expects 0).
Don't:  API routes, the rule (if it needs a change, stop); rendering, the upload tab logic.
Verify: full suite; build, tsc, lint ≤ 8; A8 manual by me in dev (`*` shows, upload saves). A6, A8, A11–A14.
Commit: feat(C07-S3): show the image requirement in the event form

S4: Docs, repeated runs, deploy
Do:     CLAUDE.md Gotchas: imgUrl rule line; codebase-map.md line 66 (placeholder) updated;
        findings.md F5 resolved; 3 consecutive suite runs (A11). Then I fast-forward, deploy on Render
        and run A15.
Don't:  code.
Verify: A11 3 of 3; A12–A14 vs portfolio; A15 by me.
Commit: docs(C07-S4): close out docs and record results

## Why
- **IDs in src/lib, re-typed in Illustrations.tsx:** the API can't import a React file full of SVG,
  and two copies of the list would drift. Rejected: a duplicate list plus a test comparing them.
- **Null-returning `validImgUrl` instead of a boolean:** the routes store the trimmed value it returns, so
  trimming is done once.
- **Prefix read from env at call time, unset → reject:** fails closed on a misconfigured deploy (A15
  catches it) instead of accepting `undefined/...`.
- **Tests in one new spec:** keeps A12's "existing tests" diff to the two named lines.
