# Progress

## C06: flaky locator fix (`docs/changes/06-flaky-locator/`): complete

Branch: `fix/06-flaky-locator`
Tier: Light. Decisions: none.

### Done

- S1: branch from portfolio, spec written (F24). Intake: defaults for all five questions (all 7 bare action locators, no root-cause work, 5 full runs + 10 repeats, F23 out, test edits allowed with assertions unchanged).
- S1: Before filled: A1 fail (runs 1–2 failed on `page-button-2`, runs 3–5 pass), A2 fail (5 of 10 repeats of browse.spec.ts:52), A3 26 matches, A4 26 + 3 tests, A6 pass (build 0, tsc 0, lint 8), A7 pass. The flake reproduces reliably with `--repeat-each`.
- S1: wording corrections found at baseline, approved by me (spec not yet committed, so no D#): A3 also allows admin.spec.ts:39 (already under visible rows) and db-error/error-pages.spec.ts:42; A5 also allows CLAUDE.md (current change line). Before results unchanged: A3 now fails only on the 7 targets, A5 passes.

- S2: 7 bare action locators switched to `visibleTestId` in browse.spec.ts (3), event-details.spec.ts, event-crud.spec.ts (2) and helpers.ts `logout`; imports added to the two specs. 0 `expect` lines changed, 26 + 3 tests as before. A1–A7 After filled, all pass: A1 5 of 5 runs green, A2 61 of 61 (baseline 5 failed), build 0, tsc 0, lint 8. F24 resolved.
- S2: local choice: the event-crud import became multi-line (prettier width), so its form-field lines moved from 15–17, 33–34 to 22–24, 40–41; same lines, A3 note. Stopped at the dev duplicate's cause (Scope Out); the stale hidden copy is still not investigated.

- S2: committed as bd7e4da through the gate (review approved on the staged diff).
- Validate: all seven criteria rerun on bd7e4da, results equal the S2 After column: A1 5 of 5 runs (26 + 3), A2 61 of 61, A3 0 outside the list, A4 26 + 3 and 0 `expect` lines, A5 8 files (CLAUDE.md, docs, 4 test files), A6 build 0, tsc 0, lint 8, A7 no diff. No manual criteria, no differences needing a decision.
- Validate: review notes applied: spec status back to "in progress" until close; F24 wording says "the 7 ... listed in C06".

- Validate docs committed as 6eb21d7 through the gate.
- Close: /sdd-close. Code reached portfolio by fast-forward (no merge commit): bd7e4da (S2), 6eb21d7 (validate docs). No deploy (tests only). F24 resolved; no new findings or open questions. CLAUDE.md current change set to none.
- Close: CLAUDE.md Testing gained the `visibleTestId` rule for actions on server-rendered pages; codebase-map.md and must-not-change.md unchanged. A5 After cell now lists findings.md (review note). Process notes: no answers.

### Next

- Next change: not chosen. Open backlog worth considering: F23 (flaky first request, corrupt .next), F22 (CI for the suite), F21 (non-owner sees the edit form).

## C05: automated end-to-end tests (`docs/changes/05-e2e-tests/`): complete

Branch: `feat/05-e2e-tests`
Tier: Standard. Decisions: none.

### Done

- S1: branch from portfolio, spec written. Intake: dev DB is the test DB (no extra Supabase project), so .env.test.local is not used; other questions took defaults (local only, Chromium, port portfolio-tests without merging, Q3 cleanup after confirmation). Reset-token separation added as A12 at my request; A11 merges the error-page and retry checks.
- S1: Before filled: A13 pass (build 0, tsc 0, lint 3022); A1, A2, A4–A11, A15 fail (no suite); A3 not testable; A14 N/A. A12: .env token differs from production, .env.test.local holds the production token; live POST blocked for Claude by auto mode; run by me: 401 (0.54 s).
- Design: design.md and plan.md written (plan doesn't fit the spec). Next 16's dev lock (.next/dev/lock) allows one `next dev` per folder, so test:e2e runs two Playwright configs in sequence on port 3100 (Risk 5 fallback). Serial, self-cleaning tests; guard in tests/e2e/env.ts; S2 characterization tests use roles and text only. Admin tests read E2E_ADMIN_PASSWORD from .env (I add it). Playwright: latest 1.x, exact pin.

- S2: @playwright/test 1.63.0 (exact), test:e2e script, two configs on port 3100, env.ts guard, reset setup, helpers and 4 spec files. `npm run test:e2e`: 9 tests (main run) + 3 (db-error run) pass, exit 0. A2, A3, A10, A11, A13, A14 After filled; A1 waits for the 3 runs in S4.
- S2: A3 checked: a dummy server on 3100 logged no request and the run exited 1 ("already used"); a shell DATABASE_URL gave the guard error before any server started.
- S2: lint count is now 8 (5 errors, 3 warnings, all in src/), not 3022: the html reporter replaced the stale playwright-report/, which the lint config was scanning. Below the baseline, so A13 passes. test-results/ is still the stale empty dir for S4 cleanup.
- S2: I had to stop my `next dev` on :3000 first (dev lock). Chromium 1243 downloaded for Playwright 1.63. Local choices: testIgnore db-error/ in the main config; `trace: 'off'` sits under `use` (tsc rejects it at top level); E2E_ADMIN_PASSWORD optional in env.ts until S3.

- S2: committed as 387c5bd through the gate.
- S3: testids added to the 9 src/ files (44 insertions, 4 deletions: 4 elements re-wrapped onto several lines to carry the attribute) and 6 specs (browse ported from portfolio-tests, event-details, event-crud, register, permissions, admin); `npm run test:e2e`: 26 tests (main) + 3 (db-error) pass, run 4 times in S3, the last 3 consecutive green. A4–A9, A13, A14 After filled; A1 stays for S4.
- S3: local choices: `event-media` on the existing image container instead of the design's `event-illustration` (Illustration doesn't pass props through; a wrapper would change markup), the illustration test looks for the svg inside it; extra `category-pill-all` testid; helpers `visibleTestId`, `createEvent`, `deleteEvent`, `logout`; new specs prettier-formatted with single quotes (the repo has no prettier config).
- S3: flaky until fixed: after `page.goto` of a server-rendered page (dashboard, admin, home) dev-mode streaming briefly leaves a hidden duplicate of the content, and strict-mode locators failed (2 elements). Tests now count `:visible` elements. Not an app bug as far as seen; not investigated further.
- S3: first prettier run (npx, no config) reformatted the S2 files to double quotes; reverted with git checkout, S2 files are unchanged.
- S3: DB-down server errors (PrismaClientKnownRequestError, DatabaseNotReachable) appear in the db-error run's log by design.

- S3: committed as 0ad29b1 through the gate.
- S4: CLAUDE.md Commands (test:e2e) and Testing (what it covers, wipes the dev DB, stop your dev server, .env values only, E2E_ADMIN_PASSWORD). Q3 closed; F4 and F11 resolved; F22 (CI secrets) and F23 (flaky first request) added.
- S4: A1: runs 1–2 green, run 3 failed (setup got 404 from /api/reset; .next/dev/types/validator.ts garbled, so tsc and build failed until I deleted that generated dir); runs 4–6 green. A1 passes on the last 3 in a row (my choice, option 3); cause not confirmed, F23.
- S4: A12 pass: hashes differ, production token only in .env.production.local (145 files scanned, no values printed), live POST with the dev token returned 401 (run by me). .env.test.local no longer existed, nothing to delete. playwright-report/ and test-results/ were regenerated by the S2–S4 runs (git-ignored), so nothing stale to delete.
- S4: A13 (build 0, tsc 0, lint 8), A14 (9 files, 44 insertions, 4 deletions; protected files no diff), A15 After filled.
- S4: portfolio-tests deleted after my confirmation (local only, was d083a15, 2 commits not in portfolio).
- Validate: A1 pass on runs 2–4 (run 1 failed on browse.spec.ts:52, page-button-2 strict mode, F24; before that the dev DB was unreachable for 3 runs, now back); A3, A13, A14 rerun, pass; A12 kept from S4; A15 read. Build failed on a stale .next until I deleted it (added to F23). No Before/After differences needing a decision.

- Close: /sdd-close. Code reached portfolio by fast-forward (no merge commit): 387c5bd (S2), 0ad29b1 (S3), 3f556ab (S4). A1 accepted as Pass by me on the last 3 of 4 runs despite the failed runs in S4 and validate (F23, F24). No new findings or open questions. CLAUDE.md current change set to none.
- Close: codebase-map.md updated (tests/e2e line, Playwright row in section 7, Q3 leftover closed). must-not-change.md unchanged. Process notes written.

### Next

- Next change: not chosen. Open backlog worth considering: F24 (flaky page-button-2 locator), F23 (flaky first request), F22 (CI for the suite).

## C04: error pages and faster database failure (`docs/changes/04-error-pages/`): complete

Branch: `feat/04-error-pages`
Tier: Standard. Decisions: D14 (`docs/changes/04-error-pages/decisions.md`).

### Done

- S1: branch from portfolio, spec written (intake defaults for all five questions, listed as assumptions). F15's must-not-change deletion not carried over.
- S1: Before filled for A3, A4, A6, A7, A8, A10, A12. Wrong port now hangs ~22 s (Windows ETIMEDOUT), not ~10 s.
- S1: `next start` reads .env.production.local; one unguarded run reached production (read-only GETs, two /api/reset 401s, no data changed). Logged as F20; later runs pass DATABASE_URL from .env.
- S1: manual Before: A1, A2, A5 fail (built-in English page, digest shown); A9 pass; A11 baseline noise: __cf_bm cookie warning on image upload.
- S1: A13 Before pass: first load after idle shows events almost immediately (no visible Render spin-up); C01 A4, A5, A6, A9 pass on live. Before column complete.
- Design: design.md written; spec Plan expanded to plan-step format (no plan.md). D14: manual S1 baseline replaces characterization tests. Retry uses Next 16's `retry()` (re-fetches), not `reset()`.
- Design: A12 grep excludes docs/, node_modules/, .next/ (the spec itself contains the option name).

- S2: error.tsx, global-error.tsx and the 5 s pg connect timeout added; Q2 updated (still open). A1–A12 After filled, all pass.
- S2: global-error.tsx's plain `<a href="/">` (design) needs an eslint-disable for no-html-link-for-pages; without it lint is 3024 vs 3022.
- S2: React #441 in the browser console on the error page (Suspense switches to client rendering after the streamed server error); expected, not from app code.
- S2: A10 run by me (Claude's /api/reset call was blocked by the auto-mode classifier). F21 added: non-owner sees the edit form, 403 only on save.
- S2: /sdd-validate: A7, A8, A12 rerun; A1, A5, A9, A11 rechecked by me, all pass; no Before/After differences needing a decision. A13 not yet testable (S3).

- S2: committed as 4872c79 through the gate (review approved; carried the S1 and design docs).
- S3: feat/04-error-pages fast-forwarded into portfolio (no merge commit; portfolio HEAD 4872c79 before this docs commit), pushed and deployed on Render by me. A13 pass (first request after idle, C01 A4, A5, A6, A9). Q2 closed; F1 and F15 resolved. wip/error-pages not deleted (waiting for my confirmation). Docs commit made on portfolio.
- S3: /sdd-validate: A7, A8, A12 rerun, all pass (A12 diff vs 6e607a7, since portfolio now contains S2); manual criteria kept as recorded. Q2 reworded per review note: DB-down page verified locally only, not on Render.
- S3: committed as 7989ed9 through the gate.
- Close: /sdd-close. Code reached portfolio by fast-forward (no merge commit): 4872c79 (S2), 7989ed9 (S3 docs). No new findings or open questions. CLAUDE.md current change set to none.
- Close: wip/error-pages deleted after my confirmation (local only, was 591a770). Process notes written.
- Close: A12's After note still says "no diff vs portfolio" (S2 result, before the merge); the method now names 6e607a7. Result unchanged, note left as recorded.
- Close: committed as b99ba9e, pushed with 7989ed9.
- After close (outside C04, approved 5.10.2026): step 0 model check added to sdd-start, sdd-design (Opus), sdd-step, sdd-validate, sdd-close (Sonnet; sdd-step allows Opus for a hard bug). sdd-review already pins `model: opus`. Skills can't switch models, so each one stops and asks for `/model`.

### Next

- After C04: next change sets up automated testing (F4), so the error pages and C01 checks stop relying on manual runs (Risk 5, D14).


## C03: workflow as Claude Code skills and a commit gate (`docs/changes/03-skills-workflow/`): complete

Branch: `chore/03-skills-workflow`
Decisions: D12, D13 (`docs/decisions.md`).

### Done

- S1: branch from portfolio, spec written, Before filled.
- S2: skills, hook, settings, CLAUDE.md, workflow.md and D12 written; automated check results in the spec's Notes.
- S3: new session in eventsforkids/; A2–A6 pass (After filled); A7 precheck reached the ask prompt. Test file and review.json removed.
- S4: A1, A9–A11 pass (After filled); C03 staged; review packet written to .claude/state/review-packet.md.
- S4: spec size limit: the Notes section counts as results (like the results table), so the spec fits the Light 80-line limit.
- S4: A9 Before corrected from 14 to 13 working rules (S1 miscount); After is 14.
- S4: D13: sdd-review now approves when no failed check is blocking; minor issues become notes.
- S4: hook matcher is Bash|PowerShell (settings.json), broader than the spec's "every Bash call" (Scope In, Why); spec wording left as is.
- S4: progress-note template is `S<n>: ...` (no date, no C<NN> prefix: lines sit under the change's section); workflow.md: the spec's Notes section doesn't count toward size limits (review 4 notes).
- S4: five /sdd-review runs (1–3 rejected, 4–5 approved); A8 pass.
- S5: committed 7dec41f through the gate; A7 pass. ../.claude/ deleted; A12 pass. Review findings logged as F16 (hook passes invalid JSON input) and F17 (shell write to review.json not denied).

- S5: doc updates committed as 026497f; merged into portfolio as f8da455, pushed. No Render deploy (no runtime files).
- S6: closed with /sdd-close. F14 resolved; F18 (codebase-map.md garbled) and F19 (gate cases --all and paths untested) added. Close commit made directly on portfolio (docs only).

### Next

- Me: replace guide v2 in project knowledge with docs/workflow.md.
- C04: error pages from `wip/error-pages` (F1, F15), started with /sdd-start.

## C02: docs migration to project guide v2 (`docs/changes/02-guide-v2/`): complete

Branch: `chore/02-guide-v2`
Decisions: D11 (`docs/decisions.md`).

### Done

- S1: branch from portfolio, spec written, Before filled. Uncommitted Phase 0 work for error pages parked on `wip/error-pages`; it resumes after C03.
- S2: C01 folder renamed to `docs/changes/01-security-patch/`, must-not-change list renamed to `docs/must-not-change.md` (git mv; old paths mapped in D11). Old paths updated in CLAUDE.md, progress.md, findings.md. D11 appended.
- S3: findings F1–F13 numbered in order, F14 (C03: skills and commit-review hook) added. Open questions Q1–Q3 numbered; Q3 reconstructed.
- S4: CLAUDE.md edits.
- S5: no CLAUDE.md or AGENTS.md outside the repo root; ../tmp/ is empty; ../findings.md does not exist. After filled.
- A3: old paths also match in 02-guide-v2/spec.md (describes the rename) and untracked process-notes.md; criterion wording too narrow, accepted.
- CLAUDE.md change protocol: <NN-name> → <NN-slug> to match the folder pattern.
- S6: 7447f13 merged as b180aae, pushed; ../tmp/ removed; A8 pass.
- Close commit made directly on portfolio (docs only).

### Next

- C03: skills conversion (F14). Then error pages from `wip/error-pages`, renumbered.

## Change 01: security patch (`docs/changes/01-security-patch/`): complete

Branch: `chore/security-patch-next`
Decisions: `docs/changes/01-security-patch/decisions.md` (project-wide: `docs/decisions.md`, D10).

### Done

- Steps 1–3: baseline recorded in the spec.
- D3 and D4 applied to the spec (A3 lint criterion; next/eslint-config-next target 16.3.x). D8 raised the next minimum to 16.3.8 and corrected D4's reasoning.
- Steps 4–5: next and eslint-config-next 16.3.8, react and react-dom 19.2.8 (`--save-exact`). No peer dependency conflicts.
- Step 6: A1–A11 all pass.
  - A2: no next/react advisories; 18 others remain (step 10). Portfolio's lockfile had 23, including next (critical).
  - A3: build and tsc pass; lint at 3022, one warning above the baseline, accepted (D9).
  - A4–A9: manual. A5's uploaded image was checked during A6.
  - A11: known noise only, plus a local stray-lockfile warning (dismissed).
- Additional fix (D6): `agentRules: false` in next.config.ts; build, tsc and dev re-checked afterwards.
- `docs/process-notes.md` added to .gitignore (D5: docs are public).
- Step 7: committed (D7).
- Step 8: merged into portfolio, manual Render deploy, A12 pass on the live URL.
- Step 9: rollback not needed.
- Step 10: remaining `npm audit` advisories logged in findings.md.
