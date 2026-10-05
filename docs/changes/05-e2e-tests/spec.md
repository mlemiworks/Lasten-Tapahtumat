# C05: Automated end-to-end tests
Tier: Standard · Status: in progress · Decisions: none

## Context
The C01 regression checks (A4–A10) and the C04 error-page checks are run by hand every
change (D14, C04 Risk 5). C05 adds a Playwright suite on portfolio that runs them against a
local server on the dev database. Implements F4; resolves F11; closes Q3. Affects only
developers: no visitor-facing behavior changes.

## Current behavior
- No test dependency, config or test files on portfolio. 17 data-testid attributes exist
  (event-form, Illustrations, ImageUploader); none on cards, filters, header or error pages.
- portfolio-tests (stale, based on b39eb15): Playwright config for 3 browsers with
  `webServer: npm run dev` on :3000 and reuseExistingServer, browse-events.spec.ts (4 tests),
  the stock example spec, empty helpers, 2 testids on eventCard, a console.log of
  DATABASE_URL in seed.ts, and a CI workflow for master.
- Seed: 9 events, 2 users; home page size 9, so a fresh reset has no page 2.
- /api/reset wipes and reseeds whichever DB the running server uses.
- `next start` loads .env.production.local (F20); `dev:prod` runs next dev against production.

## Scope
In:
- @playwright/test as a devDependency, playwright.config.ts (Chromium only), tests/e2e/,
  `test:e2e` script.
- Playwright starts its own server(s) on .env (dev DB); never reuses a running server.
- A global setup that resets the dev DB through /api/reset (token from .env) before the run.
- A guard that stops the run before any request unless the target is the server
  Playwright started with .env's DATABASE_URL (or the deliberately broken one, A11).
- Tests for C01 A4–A10 (minus external services) and C04 A1, A2 and part of A5.
- data-testid attributes on the elements the tests use (CLAUDE.md Testing rules). No other
  src/ changes.
- Port from portfolio-tests: browse-events tests and the 2 eventCard testids, rewritten as
  needed. Not merged.
- Separate reset tokens: the dev token (.env) must differ from production's (A12).
  The production token stays as is (must-not-change: GitHub secret RESET_TOKEN).
- .env.test.local holds the production RESET_TOKEN and is unused: deleted after I confirm.
- CLAUDE.md Commands and Testing sections; Q3 closed.
Out:
- Separate test database: no extra Supabase project; the dev DB is reset instead
  (intake answer 1). .env.test.local is not used.
- CI (GitHub Actions): needs DB credentials as repo secrets next to the must-not-change
  reset workflow; logged as a finding
- Firefox, WebKit, mobile: little value for a demo, triples run time
- Image upload, map tiles, weather: external services (Supabase Storage, OSM, Open-Meteo);
  stay manual
- C04 A3 (timing), C04 A6 (needs a throw in layout.tsx), live Render checks: stay manual
- C04 A5 full retry (DB restored on a running server): a server can't switch DATABASE_URL;
  the test checks only that retry re-renders without a document request
- Fixing anything the tests reveal (e.g. F21): findings only
- Deleting portfolio-tests: only after I confirm
Assumptions (intake 5.10.2026): dev DB is the test DB and may be wiped on every run;
local only; Chromium only; port, don't merge, portfolio-tests; stale playwright-report/
and test-results/ deleted after confirmation.

## Must not change
- docs/must-not-change.md, both items (/api/reset, its token check and what it does;
  APP_URL/RESET_TOKEN secrets and the 6-hour schedule).
- App behavior: src/ changes are data-testid attributes only.
- Data access through src/lib/dataFetching.ts; .env.production.local never read by the suite.

## Risks
1. The suite wipes the production DB (reused :3000 server under dev:prod, next start loading
   .env.production.local, or a shared token). Mitigation: own server, no reuse, next dev
   only, guard (A3); dev token rejected by production (A12).
2. Running the suite wipes dev data I entered by hand. Mitigation: documented in CLAUDE.md
   (A15); accepted by intake answer 1.
3. Flaky tests (timing, shared DB state between parallel tests). Mitigation: A1 (3 runs);
   design decides serial vs parallel.
4. Testids change markup or behavior. Mitigation: A14.
5. Two next dev servers in one folder conflict (error-page server). Mitigation: design
   checks it; fallback chosen in design.

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | `npm run test:e2e` starts its own Chromium run and server on .env and exits 0 on a healthy dev DB, 3 runs in a row | Command ×3 | Fail | | No test:e2e script (npm error Missing script), no playwright.config, no tests/ |
| A2 | When the suite starts, it shall reset the dev DB through /api/reset so every run begins from the seed (9 events, 2 users) | Setup log; event count in the first test | Fail | Pass | No suite. S2: setup project returns 200; first characterization test sees 9 event links |
| A3 | If a server is already listening on the test port, or DATABASE_URL differs from .env's (except the A11 server), then the suite shall stop before its first request | Run with a dummy server on the port; run with a dummy unreachable DATABASE_URL; server log shows no request | Not testable | Pass | No suite. S2: dummy server on 3100 logged no request, run exit 1; shell DATABASE_URL gave the guard error, no server started |
| A4 | Tests cover C01 A4: front page lists events; search, city filter and category pills narrow results; pagination moves to page 2 (test adds a 10th event) | Test names + A1 | Fail | Pass | No tests. S3: browse.spec.ts, 6 tests: 9 cards, search, empty state, city filter, category pill, 10th event adds page 2 |
| A5 | Tests cover C01 A5 minus external services: event details; map container for an event with lat/lng; a test image and an illustration render | Same | Fail | Pass | No tests. S3: event-details.spec.ts, 4 tests: test image, illustration (svg inside event-media), map with lat/lng, no map without |
| A6 | Tests cover C01 A6 without upload: log in, create, see in /dashboard, edit, delete, log out | Same | Fail | Pass | No tests. S3: event-crud.spec.ts: log in, create, dashboard, edit, delete, log out in one test |
| A7 | Tests cover C01 A7: register (password under 8 characters rejected), then log in | Same | Fail | Pass | No tests. S3: register.spec.ts, 3 tests: under 8 characters blocked in the browser and 400 from the API, mismatch error, register then log in |
| A8 | Tests cover C01 A8: non-owner PUT and DELETE return 403 | Same | Fail | Pass | No tests. S3: permissions.spec.ts: a new user gets 403 on PUT and DELETE of testi's event |
| A9 | Tests cover C01 A9: admin panel search and delete; non-admin redirected from /admin | Same | Fail | Pass | No tests. S3: admin.spec.ts: non-admin redirected; admin search and delete (E2E_ADMIN_PASSWORD from .env) |
| A10 | Tests cover C01 A10: /api/reset 200 with the .env token, 401 with a wrong one | Same | Fail | Pass | No tests. S2: 200 with the .env token, 401 with a wrong or missing one |
| A11 | Tests cover C04 A1, A2 and part of A5: with a rejected DB connection, / and /<id> show the Finnish error page with header, footer, retry button, link to /, no digest; clicking "Yritä uudelleen" sends no document request | Test names + A1 | Fail | Pass | No tests. S2: 3 tests in the db-error run, retry sends no document request |
| A12 | The dev RESET_TOKEN differs from production's: hashes of .env and .env.production.local differ, no other env file holds the production token, and a POST to the live /api/reset with the dev token returns 401 | Hash compare (no values printed); curl to live, run once by Claude with my go-ahead | Fail | | .env differs from .env.production.local; .env.test.local holds the production token. Live POST with the dev token (run by me, 5.10.2026): 401 in 0.54 s. Fails only on the .env.test.local copy |
| A13 | npm run build and npx tsc --noEmit pass; lint count ≤ 3022 | Commands; npx eslint . --ignore-pattern "src/generated/**" | Pass | Pass | build exit 0, tsc exit 0, lint 3022 (190 errors, 2832 warnings). S2: build 0, tsc 0, lint 8 (5 errors, 3 warnings, all in src/); count fell from 3022 because the run replaced the stale playwright-report/. S3: build 0, tsc 0, lint 8 (unchanged) |
| A14 | src/ diff vs portfolio adds only data-testid attributes; must-not-change.md, reset.yml, api/reset/route.ts unchanged | git diff portfolio -- src (manual read), git diff --stat on the 3 files | N/A | Pass | No diff yet. S2: git diff portfolio --stat -- src empty. S3: 9 files, 44 insertions, 4 deletions; the 4 deletions are elements re-wrapped onto several lines to carry the attribute; the 3 protected files have no diff |
| A15 | CLAUDE.md documents `npm run test:e2e`, that it wipes the dev DB, and never to run it with .env.production.local values | Read | Fail | | CLAUDE.md Testing says no tests on this branch; no test:e2e command |

## Rollback
Revert the C05 commits. No migrations; the dev DB is reseeded with `/api/reset` or
`npx prisma db seed`.

## Why
Playwright, because it already exists on portfolio-tests, the browsers are installed, and
it tests the real pages that the manual checks cover. A fresh port instead of a merge:
portfolio-tests is stale and carries a DATABASE_URL log. Rejected: a separate test
Supabase project (not available); unit tests with a mocked DB (would not catch the
regressions C01/C04 check by hand).
