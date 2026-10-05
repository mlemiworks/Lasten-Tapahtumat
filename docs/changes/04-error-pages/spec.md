# C04: Error pages and faster database failure
Tier: Standard · Status: done · Decisions: D14

## Context
When the database is unreachable, the demo shows Next.js's built-in English error page,
sometimes after a ~10 s hang. Recruiters and other visitors see a broken demo. C04 adds a
styled Finnish error page and a connection timeout so the failure is fast. Implements F1;
resolves F15 (wip/error-pages). Answers Q2 for production after the live check.

## Current behavior
- No error.tsx or global-error.tsx in src/app/. A render error shows Next.js's built-in
  page: English, Reload button, no app header or styling, no error details.
- src/lib/prisma.ts creates PrismaPg with connectionString only; no connect timeout.
- Measured on wip/error-pages (local production build, dev DB, front page only, 3.10.2026):
  paused project, wrong password or wrong project id → built-in page immediately;
  wrong port → hangs ~10 s, then the built-in page.
- [event]/page.tsx already handles a missing event inline ("Tapahtumaa ei löydy.").

## Scope
In:
- src/app/error.tsx: client error boundary inside the root layout (header and footer stay).
  Finnish text that does not blame only the database, a "Yritä uudelleen" button that
  retries the failed render, a link to the front page, no error message or digest shown.
- src/app/global-error.tsx: fallback when the root layout itself fails; own <html lang="fi">.
- src/lib/prisma.ts: connect timeout of 5 s (connectionTimeoutMillis) on PrismaPg.
  Connecting only; query time unchanged.
- Q2 updated with the local findings; closed after A13.
- F15: the wip spec's content is reused; its must-not-change deletion is not carried over.
Out:
- not-found.tsx: missing events are already handled in [event]/page.tsx
- Automated tests for the error page: no test setup on this branch (F4)
- Per-route error.tsx files: one root boundary covers every route; no route needs other text
- API route error responses: JSON for fetch callers, not pages
- Query timeouts, retries, health checks: connect failure is the measured problem
Assumptions (intake defaults, 4.10.2026): keep the APP_URL/RESET_TOKEN must-not-change
item; timeout 5 s; error.tsx + global-error.tsx; retry button + front page link;
Render check part of C04.

## Must not change
- docs/must-not-change.md, both items (the /api/reset endpoint, its token check and what it
  does; the APP_URL and RESET_TOKEN secrets and the 6-hour schedule).
- Data access only through src/lib/dataFetching.ts; the singleton in src/lib/prisma.ts.
- Behavior with a healthy database (C01 A4–A10).

## Risks
1. Timeout too short: slow but healthy connects (cold start, Render to Supabase) show the
   error page. Mitigation: 5 s margin; A13 on Render after a cold start.
2. Wrong setting limits queries, not connecting: /api/reset or long queries fail.
   Mitigation: A10 (reset still works), A3 measures connect failure only.
3. The boundary hides real bugs: it catches every render error. Mitigation: A4 (original
   error in the server log); wording does not name the database as the only cause.
4. Retry shows the cached error instead of re-fetching server data. Mitigation: A5.
5. Error pages are rarely exercised and may rot. Mitigation: out of scope here (F4);
   checked manually in this change.

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | If the DB rejects the connection (wrong password or project id in DATABASE_URL), then when a visitor opens /, the app shall show the custom error page: Finnish text, app header and footer, retry button, link to /, no error message, stack or digest | Local production build, dev DB with altered DATABASE_URL | Fail | Pass | Front page flashes, then Next's built-in dark page in English: "This page couldn't load. A server error occurred. Reload to try again.", Reload button, digest shown ("ERROR 1502195720"); no header or footer. After (S2): Finnish page with header and footer, retry button, Etusivulle link, no digest (browser, user-checked; headless screenshot confirms). Server HTML still 200 + streamed error |
| A2 | Same as A1 for an event detail page /<id> | Same | Fail | Pass | Same as A1 (/anything-123). After (S2): same page on /anything-123 |
| A3 | If the DB host is unreachable (wrong port), then the app shall show the error page within 7 s of the request (5 s timeout + 2 s tolerance) | Same, timed with curl -w time_total | Fail | Pass | 22.1 s (/) and 21.6 s (/<id>), code ETIMEDOUT: Windows TCP connect timeout, pg has none set (wip measured ~10 s). Render (Linux) may hang longer. After (S2): 5.25 s (/) and 5.05 s (/anything-123); log "Connection terminated due to connection timeout" |
| A4 | When the error page is shown, the server log shall contain the original error (every A1–A3 case) | Server terminal output | Pass | Pass | Wrong password: "Authentication failed against the database server" (PrismaClientKnownRequestError, AuthenticationFailed). Wrong port: code ETIMEDOUT, digest logged. After (S2): wrong password logs PrismaClientKnownRequestError P1000 with digest; wrong port logs the connection timeout with digest |
| A5 | When the DB is restored and the visitor clicks "Yritä uudelleen", the page shall render with events, without a full reload | Manual, same build, DATABASE_URL restored | Fail | Pass | No "Yritä uudelleen" button, only the built-in Reload. After (S2): server restarted with correct DATABASE_URL, "Yritä uudelleen" shows events; no document request in the Network log |
| A6 | If the root layout throws, then the app shall show the global error page in Finnish with lang="fi" | Temporary throw in layout.tsx, local build; reverted, git diff clean | Fail | Pass | 500, built-in page, `<html id="__next_error__">` without lang; original error logged. Throw gated by an env var, reverted, git status clean. After (S2): Finnish global page, `<html lang="fi">`, title "Virhe – Lasten tapahtumat"; server 500, original error logged. Env-gated throw reverted, layout.tsx diff clean |
| A7 | npm run build and npx tsc --noEmit pass | Commands | Pass | Pass | build exit 0, tsc exit 0. After (S2): build exit 0, tsc exit 0 |
| A8 | Lint problem count not higher than the baseline | npx eslint . --ignore-pattern "src/generated/**" | 3022 | 3022 | 190 errors, 2832 warnings; same as C01 After. After (S2): 190 errors, 2832 warnings. global-error.tsx has one eslint-disable for no-html-link-for-pages (plain `<a>` per design) |
| A9 | With a healthy DB, C01 A4–A9 still pass (front page, event page, login/create/edit/delete, register, 403 for non-owner, admin) | Manual, npm run dev, dev DB | Pass | Pass | After (S2): user-checked on npm run dev. Non-owner sees the edit form and gets 403 only on save: F21 |
| A10 | /api/reset with the correct token resets and reseeds (200); a wrong token is rejected (401) | curl locally, token from .env | Pass | Pass | Running dev server (:3000, .env): correct token 200 "Database reset and reseeded.", wrong token 401. After (S2): 200 and 401 (run by user on dev server) |
| A11 | No new errors in the browser console or server terminal during A9–A10 | Compare with baseline run | Baseline | Pass | Browser: `Cookie "__cf_bm" has been rejected for invalid domain` during image upload (Supabase Storage's Cloudflare cookie). Server terminal: not reported. After (S2): no new errors (user). Error page runs log React #441 (Suspense switched to client rendering) in the browser console; expected with a streamed server error |
| A12 | connectionTimeoutMillis appears only in src/lib/prisma.ts; docs/must-not-change.md and .github/workflows/reset.yml unchanged | grep -r; git diff 6e607a7 --stat on both files (last commit before C04) | 0 matches | Pass | Expected exactly 1 after (prisma.ts). must-not-change.md and reset.yml: no diff vs portfolio. After (S2): 1 match, src/lib/prisma.ts:16; no diff vs portfolio on both files |
| A13 | When deployed to Render, the demo passes C01 A4, A5, A6 and A9, including the first request after a cold start | Manual, live URL | Pass | Pass | First load after 15+ min idle: events shown almost immediately (no visible spin-up wait; whether Render actually slept is unverified). C01 A4, A5, A6, A9 pass on live. After (S3, 5.10.2026): user-checked on live after the deploy; first request after 15+ min idle, C01 A4, A5, A6, A9 all pass |

Notes:
- `next start` loads .env.production.local (production DB) over .env. Local production-build
  runs must pass DATABASE_URL (and RESET_TOKEN) from .env explicitly. In S1 one unguarded run
  sent read-only GETs and two /api/reset POSTs to production; both POSTs returned 401 (the
  .env token differs). No production data changed. F20.
- /sdd-validate (5.10.2026): A7, A8, A12 rerun (build 0, tsc 0, lint 3022, one match in prisma.ts, no diff on the two files). A1, A5, A9, A11 rechecked by the user, pass. A13 waited for S3 (now Pass).
- /sdd-validate (S3, 5.10.2026): A7, A8, A12 rerun on portfolio 4872c79 (build 0, tsc 0, lint 3022,
  one match at prisma.ts:16; no diff on the two files vs 6e607a7, the last pre-C04 commit, because
  portfolio now contains S2). Manual criteria kept as recorded (no code change since S2).
- A1–A3 Before: HTTP 200 with header and footer in the HTML: the loading.tsx Suspense shell
  streams first and the error follows, so what the visitor sees is judged in a browser.

## Plan
S1: baseline (done). Branch, spec, Before filled for A1–A13. Manual baseline is the
    characterization safety net (D14).

S2: error pages and timeout
Do:     add src/app/error.tsx and src/app/global-error.tsx per design To-be; add
        connectionTimeoutMillis: 5000 to PrismaPg in src/lib/prisma.ts; update Q2 in
        docs/open-questions.md with the local findings (not closed).
Don't:  dataFetching.ts, pages, layout.tsx, loading.tsx, API routes, middleware,
        docs/must-not-change.md, .github/. Need to touch one? Stop and ask.
        A6's temporary throw in layout.tsx is reverted before staging (git diff clean).
Verify: local production build with DATABASE_URL (and RESET_TOKEN) from .env passed
        explicitly (F20): A1–A6; A7 (build, tsc); A8 (eslint vs 3022); A12 (grep -rn
        connectionTimeoutMillis outside docs/, node_modules/, .next/ → only src/lib/prisma.ts;
        git diff portfolio --stat on both files); npm run dev: A9–A11.
Commit: feat(C04-S2): Finnish error pages and DB connect timeout

S3: deploy and close
Do:     I merge feat/04-error-pages into portfolio and deploy on Render manually; Claude
        guides A13 (first request after 15+ min idle, C01 A4, A5, A6, A9); close Q2;
        mark F1 and F15 resolved in findings.md; /sdd-validate.
Don't:  production DB, dev:prod, /api/reset on live. Deleting wip/error-pages only
        after I confirm.
Verify: A13; After column complete.
Commit: docs(C04-S3): record A13 and close Q2

## Rollback
Revert the S2 commit and redeploy on Render. No migrations, no data changes.

## Why
Next.js's own error boundaries plus a pg connect timeout: no new libraries, and only
src/app and prisma.ts change. Rejected: try/catch around each fetch in the pages (repeated
in every route, and it would hide errors from the log); a health-check route (adds a
request without fixing the hang).
