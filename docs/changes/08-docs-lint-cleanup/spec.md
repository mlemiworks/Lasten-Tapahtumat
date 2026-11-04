# C08: Lint ignores, codebase map rewrite, README version
Tier: Light · Status: in progress · Decisions: none

## Context
`npm run lint` lints the generated Prisma client, so it reports 798 problems and the real
count (8) needs a CLI flag (F10). docs/codebase-map.md is a pasted chat transcript with cut-off
lines and possible bugs mixed into the architecture (F18). README says Next.js 15 (the app runs
16.3.8). All three are the first things a portfolio reviewer runs or reads. Developers only; no
app behavior changes.

## Current behavior
- `npm run lint`: 798 (292 errors, 506 warnings); 790 from src/generated/. With
  `--ignore-pattern "src/generated/**"`: 8 (5 errors, 3 warnings) in 69 files.
- codebase-map.md: chat preamble at line 1, ~12 truncated lines, box-drawing tables, a
  section 6 bug list not in findings.md, ROADMAP rows for a file no longer in the repo.

## Scope
In:
- eslint.config.mjs: add `src/generated/**`, `playwright-report/**`, `test-results/**` to
  globalIgnores (all git-ignored output; only src/generated/ produces problems today).
- CLAUDE.md lint note: plain `npm run lint`, baseline 8.
- codebase-map.md rewritten from the code: plain Markdown tables, architecture only.
- Section 6 observations not yet in findings.md become new F# (F25+), each checked against
  the code first; already covered ones (F21, C04 error pages) are not duplicated.
- README: "Next.js 15" → 16 (2 places).
- findings.md: F10 and F18 resolved by C08.
Out:
- F10's "3022 vs 3021 extra warning": obsolete, the count came from a stale
  playwright-report/ (C05-S2); no comparable baseline left (intake Q1).
- Fixing the 8 lint problems or any new findings: app code, separate changes.
- Other README content: not reported as wrong; A5 checks only the map.
- public/illustrations.jsx and tailwind.config.mjs: become findings, not deleted.
Assumptions (intake, 4.11.2026): Q1 drop, Q2 move to findings, Q3 README in; ignore list
and table format are defaults.

## Must not change
- docs/must-not-change.md, both items.
- src/, tests/, prisma/, package.json, lockfile: no diff.
- ESLint rules: no rule changes, no new eslint-disable comments.

## Risks
1. An ignore hides source files → A2 (same 69 files, same 8 problems).
2. The rewritten map has new errors → A5, A6 checked against the tree; S3 reads the code.
3. An observation is lost or duplicated in the move → A7 mapping list.
4. Observations the old map was unsure about → verified in S3; unverifiable ones say so.

## Acceptance
| # | Criterion (tolerance) | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | `npm run lint` reports exactly 8 problems (5 errors, 3 warnings) | npm run lint | fail: 798 (292 errors, 506 warnings) | pass: 8 (5 errors, 3 warnings) | |
| A2 | `npm run lint` lints the same 69 files, same file/line/rule list as `npx eslint . --ignore-pattern "src/generated/**"` at baseline; 0 differences | eslint -f json, compare | fail: 87 files; the 18 extra are src/generated/ (790 extra problems) | pass: 69 files, same 8 file/line/rule entries, 0 differences | Reference list: Notes |
| A3 | eslint.config.mjs diff adds only the 3 ignore patterns | git diff | fail: none of the 3 patterns present | pass: diff adds exactly the 3 patterns (3 lines, no comment) | |
| A4 | codebase-map.md: 0 matches for chat preamble ("I didn't", "you asked") and box-drawing chars `[┌│├└─]` | grep | fail: 1 preamble match, 73 box-drawing lines | pass: 0 preamble matches, 0 box-drawing lines | |
| A5 | Every file or folder path in codebase-map.md exists; 0 missing | script over backticked paths | fail: 2 of 19 paths don't resolve (edit/client.tsx, hooks/review-gate.mjs) | pass: 61 of 61 paths exist, 0 missing | 0 backticked paths; both files exist under src/app/[event]/edit/ and .claude/hooks/. Script over backticked tokens that look like paths; every path is written repo-relative. Non-paths (router.push, User.id, 2 emails) skipped |
| A6 | Every page.tsx and route.ts under src/app has a row in the map; 0 missing | script | pass: 13 of 13 | pass: 13 of 13 | Weak at baseline: "/" matches any line; After checks route cells. Each page.tsx and route.ts path appears in the Pages and API tables |
| A7 | Each section 6 observation maps to a new F#, an existing F# or "covered by C04"; 0 unmapped | list in Notes | fail: 0 mapped | pass: 14 of 14 mapped (Notes) | |
| A8 | README: 0 matches for "Next.js 15"; Next.js 16 stated | grep | fail: 2 matches, "Next.js 16" 0 | pass: 0 matches for "Next.js 15", "Next.js 16" 2 (lines 3, 26) | |
| A9 | CLAUDE.md lint note: 0 matches for `--ignore-pattern`; names baseline 8 | grep | fail: 1 match | pass: 0 matches; line 61 names baseline 8 | |
| A10 | findings.md: F10 and F18 marked resolved by C08; F10 says the 3022/3021 part is obsolete | read | fail: F10 and F18 open | pass: F10 (S2) and F18 say "Resolved by C08"; F10 says the 3022/3021 part is obsolete | |
| A11 | Diff touches only eslint.config.mjs, README.md, CLAUDE.md, docs/ | git diff --stat vs portfolio | pass: CLAUDE.md (current change line), docs/ only | pass: git diff --stat vs portfolio lists CLAUDE.md, README.md, eslint.config.mjs, docs/ only | |
| A12 | `npm run build` exit 0, `npx tsc --noEmit` exit 0 | run | pass: build 0, tsc 0 | pass (S3): build 0, tsc 0; lint 8 (5 errors, 3 warnings) | |

## Plan
S1: Spec and baseline (this /sdd-start).
S2: Lint ignores
Do:     3 globalIgnores in eslint.config.mjs; CLAUDE.md lint note; F10 resolved.
Don't:  rules, source files, eslint-disable comments.
Verify: A1, A2, A3, A9, A12.
Commit: chore(C08-S2): ignore generated output in ESLint
S3: Codebase map, findings, README
Do:     rewrite codebase-map.md from the code; new F# for section 6 items; README version;
        F18 resolved.
Don't:  fix any observation; other README sections; src/.
Verify: A4–A8, A10, A11, A12.
Commit: docs(C08-S3): rewrite codebase map from the code

## Notes
A2 reference (baseline, `npx eslint . --ignore-pattern "src/generated/**"`, 69 files):
[event]/page.tsx:84 warn no-img-element · dashboard/page.tsx:41 err no-html-link-for-pages ·
register/page.tsx:121 err no-html-link-for-pages (×2) · WeatherForecast.tsx:40 err
set-state-in-effect · eventCard.tsx:55 warn no-img-element · login-dropdown.tsx:135 err
no-html-link-for-pages · ui/ImageUploader.tsx:95 warn no-img-element.

## Rollback
`git revert` the S2 and S3 commits. No migrations, no deploy.

## Why
The ignore goes in the config, not the CLI flag, so the single documented command is the real
count; rejected: keeping `--ignore-pattern` in CLAUDE.md. The map is rewritten rather than
patched because the cut-off text can't be recovered. Bugs go to findings.md because the map
describes the architecture and findings.md is the backlog.

A7 mapping (old codebase-map section 6, verified against the code in S3):
1. Edit page doesn't check ownership → existing F21
2. Admins can't reach the edit page from the UI → new F25
3. Organizer email shown publicly → new F26
4. Create skips location, city, category → new F27
5. PUT vs create empty time/description → new F28
6. Client types id as number → new F29
7. Uploaded images never deleted → new F30
8. error.tsx / global-error.tsx, 5 s timeout → covered by C04 (F1)
9. console.log in WeatherForecast → new F31
10. public/illustrations.jsx unused and served → new F32
11. tailwind.config.mjs v3-style → new F33
12. Lat/lng migration named "init" → new F34
13. NEXT_PUBLIC_SUPABASE_ANON_KEY unused → new F35
14. /api/reset token compared with !== → new F36
Also: Render cron unknown → new F37 (unverified). SERVICE_ROLE_KEY "missing from .env": obsolete, now present. Stale playwright output: closed by C05. Old section 7 (CLAUDE.md/README/ROADMAP mismatches) dropped: CLAUDE.md claims were fixed since, ROADMAP no longer exists, README handled by A8.
