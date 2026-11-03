# C06: Flaky locator fix
Tier: Light · Status: done · Decisions: none

## Context
`npm run test:e2e` failed once in C05 validate on browse.spec.ts:52: `page-button-2` matched 2
elements (strict mode). Dev-mode streaming briefly leaves a hidden copy of server-rendered
content. Assertions like `toHaveCount` retry and pass anyway, but `click`/`fill` on a bare
`getByTestId` fail immediately. Fixes F24. Affects only developers running the suite.

## Current behavior
- Some test actions use `visibleTestId()` (helpers.ts:40) or `:visible`. These don't:
  browse.spec.ts:43, :48, :58; event-details.spec.ts:5; event-crud.spec.ts:31, :39; helpers.ts:16.
- F24: 1 failure in 4 runs (C05 validate); the C05-S3 runs had the same symptom on other locators.

## Scope
In:
- The 7 actions above: use only visible matches (`visibleTestId` or `:visible`). Local choice
  in S2, matching the existing helper.
- Existing tests are edited on purpose (CLAUDE.md "never modify existing tests" covers making
  failing tests pass by changing them). Locators only: what each test asserts stays the same (A4).
Out:
- Why dev mode leaves a hidden copy: an app/Next.js investigation, beyond Light. A finding
  if S2 learns more.
- F23 (404 on first request, corrupt .next): different suspected cause.
- `getByRole` locators (helpers.ts:5 `login`): ARIA queries already skip hidden elements.
- Form fields on client-rendered pages (/create-event, /register) and the edit form
  (event-crud.spec.ts:33–34): no duplicate seen there.
- src/ changes of any kind.
Assumptions (intake defaults, 3.11.2026): the fix covers all 7 locations; root cause not
investigated; stability shown by 5 full runs plus 10 repeats of browse.spec.ts.

## Must not change
- docs/must-not-change.md, both items (/api/reset and its token check; APP_URL/RESET_TOKEN
  secrets and the 6-hour schedule).
- src/, playwright configs, tests/e2e/env.ts and reset.setup.ts: no diff.
- Test count and assertions: 26 tests (main) + 3 (db-error), same expect calls.

## Risks
1. Flake is rare (≈1 in 10 runs), so green runs prove little → A1 and A2 together (≈60 runs of browse).
2. `:visible` hides a real duplicate-content bug → A4: count assertions stay as they are; F24 note.
3. A hidden copy also breaks a locator outside the 7 → A3 grep lists every remaining bare action.

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | `npm run test:e2e` passes 5 runs in a row: 26 + 3 tests, exit 0. Tolerance: 0 failures | run 5× | Fail: runs 1–2 failed (25/26, browse.spec.ts:52 `page-button-2` strict mode, 2 elements; db-error run skipped), runs 3–5 pass (26 + 3) | Pass: 5 of 5 runs, 26 + 3 each, exit 0 | db-error log shows DatabaseNotReachable by design |
| A2 | `npx playwright test browse.spec.ts --repeat-each=10` passes. Tolerance: 0 failures | run | Fail: 5 of 61 failed, all `page-button-2` strict mode (5 of 10 repeats of browse.spec.ts:52) | Pass: 61 of 61 | 61 = setup + 6 tests × 10 |
| A3 | Bare action locators in tests/e2e/ (`grep -nE "getByTestId\([^)]*\)(\.filter\([^)]*\))?\.(click\|fill\|selectOption)"`) match only register.spec.ts, event-crud.spec.ts:15–17, :33–34, admin.spec.ts:39 (scoped under visible rows) and db-error/error-pages.spec.ts:42 | grep | Fail: 26 matches; 7 outside the allowed list (the 7 targets) | Pass: 0 outside the list | The 5 event-crud form lines moved (15–17, 33–34 → 22–24, 40–41) because the import grew by 7 lines; same lines |
| A4 | Same test titles and count (26 + 3); no `expect` line removed or changed in the diff | `--list`, diff | 26 tests in 9 files (main, incl. setup) + 3 in 1 file (db-error) | Pass: same counts; 0 `expect` lines in the diff | |
| A5 | `git diff portfolio --stat` lists only tests/e2e/*.ts, docs/ and CLAUDE.md (current change line) | git | Pass: CLAUDE.md (current change line); docs/changes/06-flaky-locator/ untracked | Pass: CLAUDE.md, docs/ (progress.md, spec), browse, event-crud, event-details specs and helpers.ts | |
| A6 | build exit 0, tsc exit 0, lint ≤ 8 (C05 result) | run | Pass: build 0, tsc 0, lint 8 (5 errors, 3 warnings) | Pass: build 0, tsc 0, lint 8 (5 errors, 3 warnings), same as baseline | |
| A7 | No diff in src/, playwright*.config.ts, tests/e2e/env.ts, reset.setup.ts, .github/ | git | Pass: no diff | Pass: no diff | |

## Plan
S1: Branch, spec, baseline
Do:     branch fix/06-flaky-locator from portfolio, spec.md, Before column, progress.md.
Don't:  test or src/ edits.
Verify: A1–A7 Before filled.
Commit: carried by S2's commit.

S2: Visible-only locators
Do:     switch the 7 actions to `visibleTestId()` / `:visible`; update F24 (resolved).
Don't:  src/, configs, env.ts, reset.setup.ts, assertions, other tests; new helpers beyond
        what the 7 need. Anything else flaky: stop, note it, ask.
Verify: A1–A7 After; full check set (build, tsc, lint).
Commit: fix(C06-S2): use visible-only locators for actions after navigation

## Rollback
`git revert` the S2 commit. Tests only, so there is no deploy or data impact.

## Why
Reusing `visibleTestId` keeps one pattern across the suite. Rejected alternatives:
`retries: 1` in the config (hides every flake, not just this one), and waiting for
hydration before each action (slower, and it depends on Next internals).
