# Findings

Backlog of known issues. Format: `F#: summary · size: S|M|L · value: low|medium|high`. Do not fix these unless the current change's spec includes them. Resolved findings are under Archive.

## Open

- F2: Next.js 16 warns that middleware is deprecated in favor of proxy. Works for now. · size: S · value: low

- F3: portfolio branch is the demo version deployed on render. Master is the future "real product". Changes in portfolio might cause drift from master, if not kept up to date. · size: M · value: medium

- F6: The reseeding always makes the events have future dates. Might be worth looking into, what happens when an event date has passed. · size: M · value: low

- F7: admin is able to also create events, might think about it if it's even necessary. · size: S · value: low

- F8: The users dont have a role. The admin page appearing is hardcoded email comparison. · size: M · value: medium

- F9: When a user logs in and clicks on create event, nothing happens. But when refressing the page and clicking on it again, it works. This doesnt always happen, but should be looked into. · size: M · value: medium

- F12: consider Dependabot or a similar tool for security update alerts. · size: S · value: medium

- F13: npm audit after Change 01 (next 16.3.8, react 19.2.8): 18 advisories remain, none in next/react (1 critical, 10 high, 5 moderate, 2 low). Top-level packages they come through: prisma/@prisma/client, next-auth, eslint, eslint-config-next, tsx, @supabase/supabase-js. Review in a separate change. · size: L · value: high

- F16: review-gate.mjs exits 0 (lets the call through) when its hook input is not valid JSON (`.claude/hooks/review-gate.mjs:77`). The C03 spec's "internal errors on a commit block" only covers errors after a commit is detected. Found by /sdd-review in C03-S4. · size: S · value: medium

- F17: a shell command can still write `.claude/state/review.json`; the deny rule in `.claude/settings.json` covers only Edit. Consider a Write deny rule and a hook check for the path. C03-A6 did not test a shell write. Found by /sdd-review in C03-S4. · size: S · value: medium

- F19: the commit gate's block on `--all` and path arguments (`git commit -m x file`) was not tested end to end; C03-A5 tried only `-am`, and the S2 unit tests covered `-am` and `--amend`. Add these cases when the gate is next touched (with F16, F17). · size: S · value: low

- F20: `next start` (and `npm start`) loads .env.production.local over .env, so a local production build talks to the production database and production RESET_TOKEN. Pass DATABASE_URL explicitly for local production-build tests, or add a guarded script (like dev:prod in reverse). Found in C04-S1 (one run sent read-only GETs and two rejected /api/reset POSTs to production). · size: S · value: high

- F21: a logged-in non-owner can open `/<id>/edit` and sees the pre-filled edit form; the 403 comes only on save (PUT in `api/events/[id]/route.ts`). `[event]/edit/page.tsx` checks only that the event exists. Check ownership (or admin) in the page and redirect or show a denial before the form renders. Found in C04-S2 (A9). · size: S · value: medium

- F22: the e2e suite runs only locally. CI (GitHub Actions) would need DATABASE_URL, DIRECT_URL, RESET_TOKEN and E2E_ADMIN_PASSWORD for a dev database as repo secrets, next to the must-not-change APP_URL/RESET_TOKEN secrets used by reset.yml; use separate secret names and a dev database, never the production values. Found in C05 (Scope Out). · size: L · value: medium

- F23: `npm run test:e2e` failed once in 9 runs: the setup test got 404 from /api/reset on the first request of the main run, and .next/dev/types/validator.ts was left garbled (tsc and next build then failed until .next/dev/types was deleted). Suspected overlap of the previous db-error server shutting down and the next dev server starting in the same .next/dev; not confirmed. In C05 validate a stale .next also made `npm run build` fail (font/google module not found) until `.next` was deleted, so a corrupt .next is a second suspect. If it recurs, wait for the lock release between the two runs or retry the setup request. Found in C05-S4 (A1). · size: M · value: medium

- F25: admins can't reach the edit page from the UI: `event-actions.tsx` shows "Muokkaa" only to the owner (`isOwner`), while `PUT /api/events/[id]` accepts the admin. Decide whether admins should edit (related: F7, F8). Found in C08-S3. · size: S · value: low

- F26: the organizer's email (`Event.createdBy`) is shown publicly in the "Järjestäjä" row on the detail page (`src/app/[event]/page.tsx:139-140`). Found in C08-S3. · size: S · value: high

- F27: `POST /api/create-event` requires only title, date and a valid `imgUrl`; location, city and an unknown or missing category are stored as `''`. Found in C08-S3. · size: M · value: medium

- F28: create and update treat empty optional fields differently: create stores `null` (`|| null`) for time and description, update uses `?? null`, so an empty string is stored as `''` (`api/create-event/route.ts`, `api/events/[id]/route.ts`). Found in C08-S3. · size: S · value: low

- F29: client code types the response id as `number` (`create-event/page.tsx:17`, `[event]/edit/client.tsx:20`), but ids are cuid strings. Types only, no runtime effect found. Found in C08-S3. · size: S · value: low

- F30: uploaded images are never deleted: no code removes files from the `event-images` bucket when an event is deleted or the database is reset (`/api/upload-image` only uploads; searched `src/`, not the Supabase dashboard). Found in C08-S3. · size: M · value: low

- F31: `src/components/WeatherForecast.tsx:37,39` has leftover `console.log(coords)` calls. Found in C08-S3. · size: S · value: low

- F32: `public/illustrations.jsx` is not imported anywhere in `src/`, `tests/` or `prisma/`, and because it is in `public/` the raw source is served to anyone who requests it. Delete or move it. Found in C08-S3. · size: S · value: low

- F33: `tailwind.config.mjs` is a Tailwind v3-style config whose `content` paths (`./app`, `./components`, `./pages`) don't exist at the repo root, and `globals.css` has no `@config`. Tailwind v4 most likely ignores it; not verified by removing it. Found in C08-S3. · size: S · value: low

- F34: the migration that adds `Event.lat` and `Event.lng` is named `20260521090321_init`, a second "init" next to `20260424074859_init`. Migrations are never renamed (CLAUDE.md), so this is only a naming oddity. Found in C08-S3. · size: S · value: low

- F35: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is defined in `.env` but nothing in `src/`, `prisma/`, `tests/` or the root configs reads it. Remove it from `.env` and the environment docs if it stays unused. Found in C08-S3. · size: S · value: low

- F36: `/api/reset` compares the token with `!==`, which is not a constant-time comparison (`src/app/api/reset/route.ts:14`). It fails safely when `RESET_TOKEN` is unset. Found in C08-S3. · size: S · value: low

- F37: unverified: whether the Render hosting setup also has its own cron job next to `.github/workflows/reset.yml`. Only visible in the Render dashboard. Found in C08-S3. · size: S · value: low

- F38: the usage text in `.claude/hooks/review-gate.mjs` (lines 4 and 115) still says `<CNN-Sn>`; the gate accepts any id, so Quick ids (`F<n>`, `Q-<slug>`) work. Hooks were out of scope in C09. Found in C09-S1 review. · size: S · value: low

- F39: the hard-rules list in `docs/workflow.md` (line 7) doesn't name explicit staging (no `-a`, `--amend`, `git add -A`) or the `npm audit fix --force` ban; CLAUDE.md still states both. Add them to the list when workflow.md is next edited. Found in C09-S1 review. · size: S · value: low

## Archive

Resolved. Text unchanged, no size or value.

- F1: when the DB is unreachable, the landing page crashes (dev shows error overlay). Unverified: what production users see. Check whether error.tsx / global-error.tsx exist. Resolved by C04 (fast-forwarded into portfolio as 4872c79).

- F4: portfolio-tests is stale (missing the lat/lng map feature); tests not run in a while; decide later whether to revive the tests on portfolio. Resolved by C05 (new Playwright suite on portfolio; portfolio-tests not merged).

- F5: When user doesn't select any image for their event, the image just shows empty placeholder with text 600x400. Resolved by C07 (imgUrl required, validated in the API and the form).

- F10: ESLint lints non-source folders (generated Prisma client, probably .next/, test reports, public/illustrations.jsx). Measure per folder and add ignores to eslint.config.mjs. Also identify the one extra warning that appeared after the next/eslint-config-next 16.3.8 upgrade (3022 vs the 3021 baseline). Accepted for Change 01 by D9 (`docs/changes/01-security-patch/decisions.md`); compare `eslint -f json` output per file against 16.0.8 on `portfolio`. Resolved by C08: `src/generated/**`, `playwright-report/**` and `test-results/**` are ignored in eslint.config.mjs (only src/generated/ produced problems: 790 of 798). The 3022 vs 3021 part is obsolete: those counts came mostly from a stale playwright-report/ (C05-S2) and lint is now 8.

- F11: if reset token for both prod and dev is same, leaked dev token may be used to reset prod. Resolved by C05 (dev token differs from production's; live POST with the dev token returns 401, A12).

- F14: Convert the workflow to Claude Code skills and a commit-review hook (the hook stops commits until the review packet is approved). Planned as C03. Resolved by C03 (merged as f8da455).

- F15: wip/error-pages (591a770, based on ddc3c71) removes the must-not-change item on the APP_URL/RESET_TOKEN secrets and the 6-hour schedule. Needs a decision before it lands. Its folder needs an NN-slug name; its progress.md and open-questions.md edits conflict with C02. Resolved by C04 (content reused, must-not-change deletion not carried over).

- F18: docs/codebase-map.md is a pasted exploration transcript: it opens with chat preamble ("I didn't modify any files..."), several table cells and lines are cut off mid-word ("iltering", "Maeather", "Iase Storage"), and section 1 still describes the outer Eventsforkids/ folder. Rewrite it from the code. Seen during C03 close. Resolved by C08 (rewritten from the code in C08-S3).

- F24: `npm run test:e2e` run 1 of 4 in C05 validate failed in `browse.spec.ts:52` ("a 10th event adds page 2"): `getByTestId('page-button-2')` matched 2 elements (strict mode violation). Same dev-mode streaming duplicate as in C05-S3, but this locator does not count `:visible` elements like the other tests do. Fix the locator in a later change (tests are not modified inside C05 validate). Found in C05 validate (A1). Resolved by C06-S2: the 7 bare action locators listed in C06 use `visibleTestId`; the hidden duplicate itself is not investigated.
