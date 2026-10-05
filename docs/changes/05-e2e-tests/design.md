# C05 design

## As-is

Extra facts, checked against code (summary in the spec's Current behavior).
- `next dev` (16.3.8) locks .next/dev/lock and exits with "Another next dev server is already
  running in this directory" (next/dist/build/lockfile.js). No second dev server, mine included.
- Shell env beats .env in Next and in prisma.ts's dotenv/config: a shell DATABASE_URL wins.
- Seed: 9 events (no owner), 2 users. testi@example.com / testi123 is public (README); the
  admin password is not in the repo.
- Labels aren't tied to inputs (event-form, login popover); no testids on cards, filters, actions,
  register or admin rows. At desktop width the login popover renders once.
- Deletes use window.confirm. Register rejects < 8 characters in the browser and the API (400).
- Tests: none (F4). Installed: chromium-1217 (portfolio-tests' 1.59); npm latest is 1.63.
- .gitignore covers .env*, reports and results; lint and tsc include tests/ (A13).

## To-be

Added: @playwright/test (devDependency, --save-exact) and the script
`"test:e2e": "playwright test && playwright test -c playwright.db-error.config.ts"`:
two sequential runs on one port, because of the dev lock (Risk 5).
Added: tests/e2e/env.ts, the guard, imported by both configs, so it runs at config load
- Reads .env only (node:util parseEnv). Throws before any server starts if .env lacks
  DATABASE_URL or RESET_TOKEN, or the shell sets either to a different value (A3).
- Exports PORT 3100, the .env values and E2E_ADMIN_PASSWORD (from .env, never printed).
Added: playwright.config.ts (main run)
- Chromium only; workers 1, fullyParallel false, retries 0, forbidOnly; trace off (it would
  record typed passwords); reporters list and html.
- webServer: `npx next dev --port 3100`, `port: 3100` (TCP probe, so a server already on the
  port gets no HTTP request and Playwright stops: A3), reuseExistingServer false, env
  DATABASE_URL and RESET_TOKEN from .env set explicitly.
- Projects: setup (reset.setup.ts: POST /api/reset with the .env token, expect 200; A2),
  then chromium, which depends on it.
Added: playwright.db-error.config.ts (A11 run): same guard, port check and port; webServer env
DATABASE_URL=postgresql://e2e:e2e@127.0.0.1:1/e2e (refused at once); testDir tests/e2e/db-error.
Added: tests in tests/e2e/. Each test creates and deletes its own data, so serial order and
the A10 mid-run reset don't matter (Risk 3).
- characterization.spec.ts (S2): today's markup by role and text only: home lists 9 event
  links (A2), a detail heading, login popover, register form, admin redirect.
- api-reset (A10); browse (A4, ported; 10th event via API); event-details (A5); event-crud
  (A6); register (A7, unique email); permissions (A8: testi's event, PUT and DELETE as a new
  user); admin (A9); db-error/error-pages (A11: after retry, no document request).
  helpers.ts: login through the header popover; createEvent and deleteEvent via page.request.
Changed: src/, data-testid only (A14), kebab-case (CLAUDE.md Testing):
- eventCard: event-card, event-category-badge (ported). home-browser: event-search,
  city-filter, category-pill-<key>, page-button-<n>, no-results.
- login-dropdown: login-button, login-email, login-password, login-submit, logout-button.
- event-form: event-title-input, event-date-input, event-form-submit. event-actions:
  event-edit-link, event-delete-button. [event]/page: event-image, event-illustration.
  EventMap: event-map.
- register: register-email, register-password, register-confirm, register-submit,
  register-error. admin/client: admin-search, admin-event-row, admin-delete-button.
Changed: CLAUDE.md Commands, Testing (A15). Deleted after I confirm: .env.test.local (A12), Q3 dirs.
Unchanged: other src/ files, next.config.ts, api/reset, reset.yml, must-not-change.md.

## Data

No schema change. Each run wipes and reseeds the dev DB (Risk 2). I add E2E_ADMIN_PASSWORD to .env.

## Trace

| A# | Design section | Step |
|---|---|---|
| A1 | To-be: script, configs | S2, S3; 3 runs in S4 |
| A2, A10 | To-be: setup project; api-reset, characterization | S2 |
| A3 | To-be: env.ts guard; webServer port | S2 |
| A11 | To-be: db-error config and test | S2 |
| A4–A9 | To-be: tests; src testids | S3 |
| A12, A15 | To-be: .env.test.local; CLAUDE.md | S4 |
| A13, A14 | To-be: src testids; Unchanged | S2, S3, S4 |

## Why

Two sequential runs: the dev lock rules out a second server. Rejected: `next start` for the
broken server (loads .env.production.local, F20), a distDir switch (next.config change), a
check endpoint (src change). Serial self-cleaning tests on one shared DB, not per-worker data.
`port`, not `url`: the probe is TCP, so no request reaches a server we didn't start.
