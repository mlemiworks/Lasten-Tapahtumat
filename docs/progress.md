# Progress

## Change 01: security patch (`docs/changes/security-patch/`)

Branch: `chore/security-patch-next`

### Done

- Steps 1–3: baseline recorded in the spec.
- D3 and D4 applied to the spec (A3 lint criterion; next/eslint-config-next target 16.3.x).
- Steps 4–5: next and eslint-config-next 16.3.8, react and react-dom 19.2.8 (`--save-exact`). No peer dependency conflicts.
- Step 6 (partial):
  - A1: pass.
  - A2: pass. No next/react advisories; 18 others remain (step 10).
  - A3: build and tsc pass; lint is one warning above the baseline, deferred (see findings.md).
  - A10: pass (200 / 401).
- Additional fix (D6): `agentRules: false` in next.config.ts; build, tsc and dev re-checked afterwards.
- `docs/process-notes.md` added to .gitignore (D5: docs are public).

### Next

- A4–A9 and A11: browser checks, done by hand.
- Decide on the extra lint warning (findings.md).
- Step 8: merge into `portfolio`, push, manual Render deploy, A12.
- Step 10: log the remaining `npm audit` findings in findings.md.
