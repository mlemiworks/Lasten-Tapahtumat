# Change 01: Next.js / React security patch

Status: done · Decisions: D1 (`docs/decisions.md`); D2, D3, D4, D6, D7, D8, D9 (`decisions.md` in this folder) · Plan included here (per D2)

## Context

The `portfolio` branch, deployed to Render as the public demo, runs `next 16.0.8` and `react 19.2.1`. These versions are affected by known vulnerabilities:

- **CVE-2025-55184:** denial of service, high severity. A crafted request can make the server hang.
- **CVE-2025-55183:** source code exposure, medium severity. It only affects apps using Server Actions; this app appears not to, but that is unverified.

Both are fixed in Next.js 16.0.10 and React 19.2.3+. (CVE-2025-66478, the critical remote-code-execution bug, is already fixed in 16.0.8.)

Later advisories raise the bar (D8). Two critical advisories fixed in 16.3.3 (GHSA-2xp9-vwfh-vxw4, GHSA-p293-qw3h-jr36) affect 16.0.8 and have no 16.0.x fix, so the upgrade has to leave the 16.0 line (D4). GHSA-vcvr-r3jv-pc5j (critical, RCE in next/og, >=16.2.0 <16.3.6) rules out 16.3.3–16.3.5, and the September 30 release fixes one high, five medium and one low advisory in 16.3.8, the lowest version with no known advisories. Sources: nextjs.org/blog (August and September 2026 security releases, September 22 security update).

Reference: https://vercel.com/kb/bulletin/security-bulletin-cve-2025-55184-and-cve-2025-55183

Who is affected: anyone using the demo, including recruiters. A hung server means a dead demo.

## Scope

**In:**

- Upgrade `next`, `eslint-config-next`, `react` and `react-dom` to the latest patched versions: `next` and `eslint-config-next` to the latest 16.3.x (D4); `react` and `react-dom` to the latest 19.2.x.
- Additional fix found during the upgrade: set `agentRules: false` in `next.config.ts` so `next dev` stops generating AGENTS.md and CLAUDE.md (D6).

**Out (with reasons):**

- Other `npm audit` findings: logged in findings.md, not fixed here, to keep the change small and traceable.
- Other minor or major version upgrades: bigger behavior changes than this fix needs. Exception: next 16.0 → 16.3 (D4).
- The `middleware` to `proxy` rename: a separate change, because it touches authentication.
- Any code changes, except the `agentRules` config line (D6).

## Must not change

- Project-wide items, see "Must not change" in `docs/spec.md`: `/api/reset`, the `x-reset-token` check, the GitHub Actions reset (6-hour schedule, `APP_URL` and `RESET_TOKEN` secrets).
- All user flows and authorization rules (see the acceptance criteria).

## Risks

- A patch release changes behavior somewhere.
- The local build passes but the Render build fails.
- Already-broken features get blamed on the upgrade. Mitigated by the baseline run.

## Preconditions (setup, not part of the change)

- `.env` has `SUPABASE_SERVICE_ROLE_KEY` for the **development** project.
- The development Supabase project has a public `event-images` storage bucket, like production.
- Test data exists: one event with lat/lng **and** a date within 16 days, so both the map and the weather appear.

## Acceptance criteria

| #   | Criterion                                                                                                                                                                 | How verified                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A1  | `next` >= 16.3.8 (16.3.x) (D4, D8); `react` and `react-dom` >= 19.2.3 (19.2.x) installed                                                                                      | `npm list next react react-dom`                                    |
| A2  | No Next.js or React advisories remain                                                                                                                                     | `npm audit` (other findings logged, not fixed)                     |
| A3  | Build and type check pass; the lint problem count is not higher than the baseline (3021 problems, 190 errors) (D3)                                                        | `npm run build`, `npx eslint . --ignore-pattern "src/generated/**"`, `npx tsc --noEmit` |
| A4  | Front page: events listed; search by word works; city filter works; category pills filter; pagination moves between pages                                                 | Manual, logged out                                                 |
| A5  | Event page: details shown; map shown for an event with lat/lng; weather shown for an event within 16 days; a test image, an illustration and an uploaded image all render | Manual                                                             |
| A6  | Existing user can log in, create an event (with image upload), see it in `/dashboard`, edit it, delete it, and log out                                                    | Manual, test account                                               |
| A7  | New user can register (a password under 8 characters is rejected) and do the A6 flow                                                                                      | Manual, new email                                                  |
| A8  | A non-owner cannot edit or delete another user's event: the API returns 403                                                                                               | Manual, logged in as a non-owner, `fetch` from the browser console |
| A9  | Admin sees the admin panel, can search, and can delete from both the admin panel and an event page; a non-admin is redirected away from `/admin`                          | Manual                                                             |
| A10 | `/api/reset` with the correct token resets and reseeds; a wrong token is rejected                                                                                         | `curl` locally, token from `.env`                                  |
| A11 | No new errors in the browser console or the server terminal during A4–A10                                                                                                 | Compare with the baseline run                                      |
| A12 | The Render demo passes A4, A5, A6 and A9 after deployment                                                                                                                 | Manual, on the live URL                                            |

**Baseline rule:** run A3–A11 **before** the upgrade and record the results, including what already fails, such as the create-event refresh bug. After the upgrade, "nothing broke" means **the same results as the baseline**.

### Baseline results (fill in)

| #   | Before | After | Notes                                                                                                  |
| --- | ------ | ----- | ------------------------------------------------------------------------------------------------------ |
| A3  | Pass\* | Pass\* | After: build and tsc pass; lint 3022 problems (190 errors, 2832 warnings), one warning above the baseline, accepted (D9). Before: 3021 problems (190 errors, 2831 warnings), command npx eslint . --ignore-pattern "src/generated/\*\*". |
| A4  | Pass   | Pass  |                                                                                                        |
| A5  | Pass   | Pass  | After: uploaded image checked during A6 (the A10 reset removed uploaded events).                     |
| A6  | Pass   | Pass  | Upload OK; refresh bug not seen this run (intermittent)                                                |
| A7  | Pass   | Pass  |                                                                                                        |
| A8  | Pass   | Pass  | Non-owner → 403 (PUT and DELETE)                                                                                     |
| A9  | Pass   | Pass  |                                                                                                        |
| A10 | Pass   | Pass  | Correct token 200, wrong token 401                                                                     |
| A11 | Pass   | Pass  | Known noise only: middleware warning, WeatherForecast console.log. After: plus a local stray-lockfile warning (dismissed)                                |

## Plan

Done by hand, not with Claude Code: a few commands, and the old CLAUDE.md still says "make reasonable assumptions".

1. `git status` shows a clean working tree; check out `portfolio`.
2. Render auto-deploy on `portfolio`: **off** (checked). Merging does not deploy.
3. Set up the preconditions. Run the baseline (A3–A11) and record the results above.
4. `git checkout -b chore/security-patch-next`
5. Upgrade only the four packages, to exact versions: `next`/`eslint-config-next` latest 16.3.x (D4), `react`/`react-dom` latest 19.2.x. Do **not** use `npm audit fix --force`.
6. Run A1–A11. If anything differs from the baseline: stop, log it in this change's decisions.md (`docs/changes/security-patch/decisions.md`), and decide using the change protocol. No quiet fixes.
7. Commit `package.json`, `package-lock.json`, `next.config.ts` (D6), `.gitignore` and `docs/` together (D5, D7):
   `chore: patch next/react for CVE-2025-55184, CVE-2025-55183`
8. Merge into `portfolio` and push. Trigger a **manual deploy** in Render. Run A12.
9. **Rollback:** if A12 fails, redeploy the previous commit from Render's dashboard, then revert the merge on `portfolio`.
10. Update progress.md; log the remaining `npm audit` findings in findings.md.

## Done when

All of A1–A12 match the baseline or are better than it; progress.md is updated; remaining audit findings are logged.
