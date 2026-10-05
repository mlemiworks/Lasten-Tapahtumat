# Progress

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

### Next

- Separate commit outside C04: step-0 model check in five sdd skills (approved 5.10.2026), with its own /sdd-review.
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
