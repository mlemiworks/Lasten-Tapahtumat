### Observed:

- F1: when the DB is unreachable, the landing page crashes (dev shows error overlay). Unverified: what production users see. Check whether error.tsx / global-error.tsx exist. Resolved by C04 (fast-forwarded into portfolio as 4872c79).

- F2: Next.js 16 warns that middleware is deprecated in favor of proxy. Works for now.

- F3: portfolio branch is the demo version deployed on render. Master is the future "real product". Changes in portfolio might cause drift from master, if not kept up to date.

- F4: portfolio-tests is stale (missing the lat/lng map feature); tests not run in a while; decide later whether to revive the tests on portfolio. Resolved by C05 (new Playwright suite on portfolio; portfolio-tests not merged).

- F5: When user doesn't select any image for their event, the image just shows empty placeholder with text 600x400. Resolved by C07 (imgUrl required, validated in the API and the form).

- F6: The reseeding always makes the events have future dates. Might be worth looking into, what happens when an event date has passed.

- F7: admin is able to also create events, might think about it if it's even necessary.

- F8: The users dont have a role. The admin page appearing is hardcoded email comparison.

- F9: When a user logs in and clicks on create event, nothing happens. But when refressing the page and clicking on it again, it works. This doesnt always happen, but should be looked into.

- F10: ESLint lints non-source folders (generated Prisma client, probably .next/, test reports, public/illustrations.jsx). Measure per folder and add ignores to eslint.config.mjs.
  Also identify the one extra warning that appeared after the next/eslint-config-next 16.3.8 upgrade (3022 vs the 3021 baseline). Accepted for Change 01 by D9 (`docs/changes/01-security-patch/decisions.md`); compare `eslint -f json` output per file against 16.0.8 on `portfolio`.

- F11: if reset token for both prod and dev is same, leaked dev token may be used to reset prod. Resolved by C05 (dev token differs from production's; live POST with the dev token returns 401, A12).

- F12: consider Dependabot or a similar tool for security update alerts.

- F13: npm audit after Change 01 (next 16.3.8, react 19.2.8): 18 advisories remain, none in next/react (1 critical, 10 high, 5 moderate, 2 low). Top-level packages they come through: prisma/@prisma/client, next-auth, eslint, eslint-config-next, tsx, @supabase/supabase-js. Review in a separate change.

- F14: Convert the workflow to Claude Code skills and a commit-review hook (the hook stops commits until the review packet is approved). Planned as C03. Resolved by C03 (merged as f8da455).

- F15: wip/error-pages (591a770, based on ddc3c71) removes the must-not-change item on the APP_URL/RESET_TOKEN secrets and the 6-hour schedule. Needs a decision before it lands. Its folder needs an NN-slug name; its progress.md and open-questions.md edits conflict with C02. Resolved by C04 (content reused, must-not-change deletion not carried over).

- F16: review-gate.mjs exits 0 (lets the call through) when its hook input is not valid JSON (`.claude/hooks/review-gate.mjs:77`). The C03 spec's "internal errors on a commit block" only covers errors after a commit is detected. Found by /sdd-review in C03-S4.

- F17: a shell command can still write `.claude/state/review.json`; the deny rule in `.claude/settings.json` covers only Edit. Consider a Write deny rule and a hook check for the path. C03-A6 did not test a shell write. Found by /sdd-review in C03-S4.

- F18: docs/codebase-map.md is a pasted exploration transcript: it opens with chat preamble ("I didn't modify any files..."), several table cells and lines are cut off mid-word ("iltering", "Maeather", "Iase Storage"), and section 1 still describes the outer Eventsforkids/ folder. Rewrite it from the code. Seen during C03 close.

- F19: the commit gate's block on `--all` and path arguments (`git commit -m x file`) was not tested end to end; C03-A5 tried only `-am`, and the S2 unit tests covered `-am` and `--amend`. Add these cases when the gate is next touched (with F16, F17).

- F20: `next start` (and `npm start`) loads .env.production.local over .env, so a local production build talks to the production database and production RESET_TOKEN. Pass DATABASE_URL explicitly for local production-build tests, or add a guarded script (like dev:prod in reverse). Found in C04-S1 (one run sent read-only GETs and two rejected /api/reset POSTs to production).

- F21: a logged-in non-owner can open `/<id>/edit` and sees the pre-filled edit form; the 403 comes only on save (PUT in `api/events/[id]/route.ts`). `[event]/edit/page.tsx` checks only that the event exists. Check ownership (or admin) in the page and redirect or show a denial before the form renders. Found in C04-S2 (A9).

- F22: the e2e suite runs only locally. CI (GitHub Actions) would need DATABASE_URL, DIRECT_URL, RESET_TOKEN and E2E_ADMIN_PASSWORD for a dev database as repo secrets, next to the must-not-change APP_URL/RESET_TOKEN secrets used by reset.yml; use separate secret names and a dev database, never the production values. Found in C05 (Scope Out).

- F23: `npm run test:e2e` failed once in 9 runs: the setup test got 404 from /api/reset on the first request of the main run, and .next/dev/types/validator.ts was left garbled (tsc and next build then failed until .next/dev/types was deleted). Suspected overlap of the previous db-error server shutting down and the next dev server starting in the same .next/dev; not confirmed. In C05 validate a stale .next also made `npm run build` fail (font/google module not found) until `.next` was deleted, so a corrupt .next is a second suspect. If it recurs, wait for the lock release between the two runs or retry the setup request. Found in C05-S4 (A1).

- F24: `npm run test:e2e` run 1 of 4 in C05 validate failed in `browse.spec.ts:52` ("a 10th event adds page 2"): `getByTestId('page-button-2')` matched 2 elements (strict mode violation). Same dev-mode streaming duplicate as in C05-S3, but this locator does not count `:visible` elements like the other tests do. Fix the locator in a later change (tests are not modified inside C05 validate). Found in C05 validate (A1). Resolved by C06-S2: the 7 bare action locators listed in C06 use `visibleTestId`; the hidden duplicate itself is not investigated.
