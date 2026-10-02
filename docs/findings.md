### Observed:

- when the DB is unreachable, the landing page crashes (dev shows error overlay). Unverified: what production users see. Check whether error.tsx / global-error.tsx exist.

- Next.js 16 warns that middleware is deprecated in favor of proxy. Works for now.

- portfolio branch is the demo version deployed on render. Master is the future "real product". Changes in portfolio might cause drift from master, if not kept up to date.

- portfolio-tests is stale (missing the lat/lng map feature); tests not run in a while; decide later whether to revive the tests on portfolio.

- When user doesn't select any image for their event, the image just shows empty placeholder with text 600x400.

- The reseeding always makes the events have future dates. Might be worth looking into, what happens when an event date has passed.

- admin is able to also create events, might think about it if it's even necessary.

- The users dont have a role. The admin page appearing is hardcoded email comparison.

- When a user logs in and clicks on create event, nothing happens. But when refressing the page and clicking on it again, it works. This doesnt always happen, but should be looked into.

- Small, local choices within the current step's scope (naming, formatting, internal structure): decide, and state the choice in your summary.
  Anything that would deviate from plan.md, touch a step's Don't list, change a must-not-change item, or require changing the spec or design: stop and ask.

- ESLint lints non-source folders (generated Prisma client, probably .next/, test reports, public/illustrations.jsx). Measure per folder and add ignores to eslint.config.mjs.

- if reset token for both prod and dev is same, leaked dev token may be used to reset prod

- consider Dependabot or a similar tool for security update alerts.

- Change 01 (security-patch), A3 lint (D3, D4): after upgrading to next/eslint-config-next 16.3.8, `npx eslint . --ignore-pattern "src/generated/**"` reports 3022 problems (190 errors, 2832 warnings) vs the baseline 3021 (190 errors, 2831 warnings). One extra warning, so D3's "not higher than the baseline" is not met. The source of the warning is unknown: the baseline only recorded a total. 3014 of the 3022 problems are in `playwright-report/trace/*.js`; `src/` has 8 (5 errors, 3 warnings). Likely cause: a new or changed rule in eslint-config-next 16.3.x, which is the minor-version jump D4 accepted. To resolve: rerun lint with 16.0.8 (on `portfolio`) using `-f json`, diff per file, then record the outcome as a decision that amends D3, or fold it into the ESLint scope finding above.
  → Accepted by D9 (lint at 3022). The source of the warning is still unidentified; resolve it with the ESLint scope finding above.

- Change 01 (security-patch), found during A10 (D4): next 16.3.x `next dev` auto-generates AGENTS.md and a one-line CLAUDE.md (`@AGENTS.md`) in the repo root on every run. **Fixed in Change 01 (D6):** `agentRules: false` in next.config.ts; the generated files were deleted. Recheck on future Next upgrades.
- Build and dev warn: "Next.js ignored package-lock.json in <home folder> because it is outside the current Git repository". A stray lockfile in the user's home folder; not part of the repo. Remove it or set `turbopack.root`.
