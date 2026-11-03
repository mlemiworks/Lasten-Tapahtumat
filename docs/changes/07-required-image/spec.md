# C07: Required image or illustration for events
Tier: Standard · Status: in progress · Decisions: D15

## Context
An event can be saved without an image. The create API then stores `https://placehold.co/600x400`, and the card shows a grey "600x400" box (F5). From now on, every create and edit must carry one of the app's illustrations or an image the user uploaded to our Storage bucket. The form enforces this, and so do `POST /api/create-event` and `PUT /api/events/[id]`. This affects users who create or edit events, and the e2e suite (C05). References: F5, D1 (separate dev and prod Supabase projects).

## Current behavior
- Form (`src/components/event-form.tsx`): image picker "Valitse kuvitus" (illustration tab, upload tab). No required marker, no check. With nothing picked, it sends `imgUrl: ''`.
- POST `/api/create-event`: a missing or empty `imgUrl` becomes `https://placehold.co/600x400`. Any other string is stored as-is.
- PUT `/api/events/[id]`: a missing or empty `imgUrl` keeps the stored value. Any other string is stored as-is. The ownership check (401/404/403) runs before the body is read.
- Rendering (card, detail page): `http(s)://` and `/testImages` values render as `<img>`. Anything else is treated as an illustration ID, and an unknown ID renders nothing.
- Schema: `imgUrl String` (NOT NULL). Seed and reset data use `/testImages/*.jpg` and illustration IDs.
- Tests: `event-crud.spec.ts` creates an event through the form without an image. `helpers.createEvent` posts without `imgUrl`.

## Scope
In:
- One shared rule for a valid `imgUrl` (after trim), used by the form and both API routes. A value is valid if it is:
  - one of the 9 illustration IDs, or
  - a path starting with `/testImages/`, or
  - a URL starting with `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/`.
- POST and PUT return 400 with "Valitse kuvitus tai lataa oma kuva" when `imgUrl` is missing, empty or invalid. The placehold.co default and PUT's keep-old fallback are removed.
- Form: a red `*` on "Valitse kuvitus". A client-side check before the fetch shows the same message in the error line, which gets `data-testid="event-form-error"`.
- Tests: new e2e tests for the API rules and the form check. Two edits to existing tests, with no `expect` line changed:
  - `event-crud.spec.ts` picks an illustration before submitting.
  - `helpers.createEvent` sends `imgUrl: 'music'` by default.
- F5 is resolved for new and edited events.

Out:
- Any other `http(s)` URL (Q1). External hotlinks break, track visitors and skip the upload checks.
- Checking that a bucket URL points to an existing file: needs a Storage call per save. The check is on the text only.
- A database CHECK constraint or migration: the bucket prefix depends on the environment, and the schema is already NOT NULL.
- Converting existing placehold.co events (Q3): production is reseeded every 6 h, and the dev DB on every test run.
- Testing image upload in e2e: needs the service-role key and writes to Storage. It's a manual check instead (A8).
- Deleting uploaded images, F21 (non-owner sees the edit form), admin edit link: unrelated.

Assumptions (intake):
- Q1: valid values are an illustration ID, a `/testImages/` path or a URL in our own bucket (revised, approved).
- Q2: PUT rejects a missing, empty or invalid `imgUrl`, like POST.
- Q3: existing placeholder events are not converted. Saving an edit to one returns 400 until the user picks an image (accepted).
- Q4: the form shows a `*` on the label and runs a client-side check with the shared message (default).
- Q5: test edits are limited to the two listed above, with assertions unchanged (default).
- Safety net: the C05 suite already covers create, edit and permissions on today's behavior and serves as the characterization tests. No extra ones are added. (D15)

## Must not change
- `docs/must-not-change.md`: `/api/reset`, its `x-reset-token` check and what it does; the GitHub secrets APP_URL and RESET_TOKEN and the 6-hour schedule.
- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` and the reset seed data.
- `/api/upload-image` (its URL format is what the rule accepts).
- How `imgUrl` renders on cards and the detail page.
- The other validation in POST and PUT: title and date (400), category list, lat/lng handling, time/description null handling, the auth and ownership order.

## Risks
1. A wrong bucket prefix (trailing slash, env not inlined in the client bundle) rejects real uploads. Mitigation: A2 (bucket URL accepted), A8 (manual upload in dev), A15 (upload on Render after deploy).
2. The form and the API drift apart. Mitigation: one shared function in `src/lib/` (design). A1–A4 test the API, A6 the form.
3. A seed or reset value fails the rule, so seeded events can't be edited. Mitigation: A9.
4. Validation moves ahead of the ownership check and leaks a 400 to non-owners. Mitigation: A5.
5. Test edits hide a regression. Mitigation: A12 (only the two named edits, 0 `expect` lines changed), A11.

## Acceptance
| # | Criterion (EARS for behavior, with tolerance) | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | If POST `/api/create-event` has `imgUrl` missing, empty, whitespace or invalid (`https://example.com/a.jpg`, `https://placehold.co/600x400`, `unknown`), then the API shall return 400 with "Valitse kuvitus tai lataa oma kuva" and create no event. 6 of 6 cases. | new e2e test | fail: 6 of 6 return 200 (missing, empty, whitespace store placehold.co; the others are stored as sent) | pass: 6 of 6 return 400 with the message (image-rule.spec.ts)
| A2 | When POST has `imgUrl` = `music`, `/testImages/reading.jpg` or `<bucket prefix>x.jpg`, the API shall return 200 and store the trimmed value. 3 of 3, value read back from the detail page. | new e2e test | pass: 3 of 3 return 200; `music` renders the svg, `/testImages` and the bucket URL render as img src | pass: 3 of 3 return 200, padded input stored trimmed; `music` renders the svg, the other two render as img src
| A3 | If the owner's PUT has `imgUrl` missing, empty or invalid (the A1 values), then the API shall return 400 with the same message and leave the event unchanged. | new e2e test | fail: 6 of 6 return 200; missing, empty, whitespace keep the old value; example.com, placehold.co, `unknown` are stored | pass: 6 of 6 return 400 with the message; event unchanged (title not "muutettu")
| A4 | When the owner's PUT has a valid `imgUrl` (the A2 values), the API shall return 200 and store it. | new e2e test | pass: 3 of 3 return 200 and are stored | pass: 3 of 3 return 200 (bucket URL, `/testImages/`, `music`, padded)
| A5 | If a non-owner PUTs without `imgUrl`, then the API shall return 403 (not 400). | permissions.spec.ts, unchanged | pass: 403, 3 of 3 runs | pass: permissions.spec.ts unchanged, 403
| A6 | If the user submits the create form with no image picked, then the form shall show "Valitse kuvitus tai lataa oma kuva" in `event-form-error`, send no request and stay on `/create-event`. | new e2e test | fail: 1 POST sent, detail page opened, placehold.co stored, no `event-form-error` | | probe |
| A7 | When the user picks an illustration and submits the create form, the app shall create the event and open its detail page. | event-crud.spec.ts (edited, A12) | n/a: no image step yet; event-crud creates without one and passes, 3 of 3 runs | pass: event-crud.spec.ts with the illustration pick, detail page opens
| A8 | The "Valitse kuvitus" label shows a red `*`. An uploaded image saves and shows on the detail page (dev). | manual | fail: no `*` on the label; uploaded image saves and shows (run by me) | | |
| A9 | Every `imgUrl` in `src/app/api/reset/route.ts` and `prisma/seed.ts` passes the rule. 0 failures. | script over both files | pass: 18 values (9 per file): 3 `/testImages/*.jpg` and 6 illustration IDs (5 distinct: music, sirkus, luonto, savi, liikunta), all within the rule | pass: 18 values (9 per file) all within the rule, asserted by image-rule.spec.ts
| A10 | `placehold.co` appears nowhere in `src/`. 0 matches. | grep | fail: 1 match, `src/app/api/create-event/route.ts:8` | pass: 0 matches in `src/`
| A11 | `npm run test:e2e` passes: 26 + 3 existing tests plus the new ones, 0 failures, 3 runs in a row. | command | pass: 26 + 3, 3 of 3 runs, exit 0 (new tests not written yet) | | |
| A12 | Changes to existing tests: only `event-crud.spec.ts` (illustration pick) and `helpers.ts` (`imgUrl` default). 0 `expect` lines changed. | git diff | pass: 0 test files changed | pass: 2 existing test files changed (event-crud +1 line, helpers +7/-1), 0 `expect` lines changed
| A13 | Build exit 0, `tsc` exit 0, lint ≤ 8 problems (`npx eslint . --ignore-pattern "src/generated/**"`). | commands | pass: build 0, tsc 0, lint 8 (5 errors, 3 warnings) | pass: build 0, tsc 0, lint 8 (5 errors, 3 warnings)
| A14 | No diff in `prisma/`, `src/app/api/reset/route.ts`, `src/app/api/upload-image/route.ts`, `.github/workflows/reset.yml`. | git diff vs portfolio | pass: no diff | pass: no diff in the four paths
| A15 | On Render after deploy: creating an event without an image shows the error; with an uploaded image it saves. | manual (me) | fail: event without an image saves with the 600x400 placeholder; uploaded image saves (run by me, live) | | |

## Plan
In design.md (Standard).

## Rollback
Revert the change's commits on portfolio and redeploy on Render. There is no migration and no data conversion. Events saved while C07 was live hold values that were already valid before.

## Why
- **Shared rule in `src/lib/`:** the form and the API can't disagree. Rejected: separate checks in each route.
- **Own bucket URLs only, not any URL:** this follows common practice on event sites (upload or stock image). Rejected: any `http(s)` URL.
- **Checked in the API, not the database:** a CHECK constraint can't follow the environment's bucket prefix, and it would need a migration (Heavy tier).
- **PUT rejects instead of keeping the old value:** both routes enforce the same rule, and the edit form always sends `imgUrl`.
