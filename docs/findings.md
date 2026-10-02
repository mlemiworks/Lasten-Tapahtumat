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

- ESLint lints non-source folders (generated Prisma client, probably .next/, test reports, public/illustrations.jsx). Measure per folder and add ignores to eslint.config.mjs.
  Also identify the one extra warning that appeared after the next/eslint-config-next 16.3.8 upgrade (3022 vs the 3021 baseline). Accepted for Change 01 by D9 (`docs/changes/security-patch/decisions.md`); compare `eslint -f json` output per file against 16.0.8 on `portfolio`.

- if reset token for both prod and dev is same, leaked dev token may be used to reset prod

- consider Dependabot or a similar tool for security update alerts.

- npm audit after Change 01 (next 16.3.8, react 19.2.8): 18 advisories remain, none in next/react (1 critical, 10 high, 5 moderate, 2 low). Top-level packages they come through: prisma/@prisma/client, next-auth, eslint, eslint-config-next, tsx, @supabase/supabase-js. Review in a separate change.
