# Progress

## C02: docs migration to project guide v2 (`docs/changes/02-guide-v2/`): in review

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

### Next

- S6 after review: commit, merge into portfolio, push, delete ../tmp/, fill A8.
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
