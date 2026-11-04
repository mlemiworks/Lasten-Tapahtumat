# Progress

## Current state

- Last closed change: C09 (workflow v4, Quick tier), branch `chore/09-workflow-v4`: S1 ce404da, S2 in the close commit; not yet fast-forwarded into portfolio. Before it: C08 (lint ignores, codebase map).
- Branch `portfolio` is the deployed demo; all changes merge there by fast-forward. Lint baseline 8 (5 errors, 3 warnings), build 0, tsc 0.
- Backlog: `docs/findings.md` (30 open, F1–F39), `docs/open-questions.md` (Q1 open).
- Next: fast-forward C09 into portfolio, then pick a change from findings.md (high value: F13, F20, F26). Quick tier (`/sdd-quick`) fits the small S-size ones.

## Earlier changes (C01–C06)

- C01: security patch, next 16.3.8 and react 19.2.8 (CVE fix), A1–A12 pass, lint accepted at 3022 (D9); code 6a03331, close 89e3e1f, merged into portfolio and deployed (`docs/changes/01-security-patch/`).
- C02: docs migrated to project guide v2, A8 pass; merged as b180aae, close d7e9888 (`docs/changes/02-guide-v2/`).
- C03: workflow as skills and a commit gate (D12, D13); merged as f8da455, close 6e607a7 (`docs/changes/03-skills-workflow/`).
- C04: error pages and 5 s DB connect timeout (D14), A13 pass on Render; code 4872c79, docs 7989ed9, close b99ba9e (`docs/changes/04-error-pages/`).
- C05: Playwright e2e suite (26 + 3 tests), A1 accepted on the last 3 of 4 runs; code 387c5bd, 0ad29b1, 3f556ab, close 07461a4 (`docs/changes/05-e2e-tests/`).
- C06: flaky locator fix, 7 bare action locators use `visibleTestId`, 61 of 61 repeats green; code bd7e4da, validate 6eb21d7, close 2f0d770 (`docs/changes/06-flaky-locator/`).

## C09: workflow v4, a Quick tier and leaner docs (`docs/changes/09-workflow-v4/`): complete

Branch: `chore/09-workflow-v4`
Tier: Light. Decisions: D16 (`docs/decisions.md`).

### Done

- Start: branch from portfolio, spec written. Intake: C08 and D15 were taken, so the change is C09 and the decision D16. Model docs (code.claude.com/docs/en/skills): `model` frontmatter applies to inline skills but only for the current turn. Q1–Q4 took defaults: `model:` in every skill and step 0 removed; D16 says C03–C08 followed v3.x; C01–C06 collapse, C07–C08 stay; S2 follows v4 Light (validation and close in S2).
- Start: Before filled: A9 and A12 pass (0 change-folder refs in skills; build 0, tsc 0, lint 8); A1–A8, A10, A11 fail (no v4 content yet). No manual criteria.

- S1: `docs/workflow.md` v4 (Quick tier, hard-rules list, targets with the 1.5× rule, results cells, models section), `templates.md`, new `sdd-quick`, `model:` and a summary ending in all 7 skills, step 0 removed, Quick branch in `sdd-review`, CLAUDE.md procedures, D16 appended (approved). A1–A10, A12 After filled in the spec (S2 reruns them); results: build 0, tsc 0, lint 8 (5 errors, 3 warnings), A8 14 rules before, 15 after, none removed, A3 0 unclassified, A10 6 added 0 removed.
- S1: local choices: Sonnet for quick, step, validate, close; Opus for start, design, review; `sdd-validate` and `sdd-close` marked optional for Light.
- S1 review notes fixed: A3 count 12 matches (10 targets), sdd-review reads Quick ids (F<n>, Q-<slug>), Light approval says "plus any decision", A2 line ref corrected.

- S2: `progress.md` current-state block and C01–C06 one line each (hashes from git log); `findings.md` in v4 form (30 open with size and value that I proposed for you to review, 9 resolved under Archive, F1–F39 once each); `open-questions.md` Q2, Q3 under Archive. New findings F38 (gate usage text `<CNN-Sn>`) and F39 (hard-rules list lacks staging and `--force` ban) from the S1 review notes.
- S2: validation: A11, A12 After filled, A1–A10 rerun, all pass; build 0, tsc 0, lint 8 (5 errors, 3 warnings). No manual criteria, no differences from Before that need a decision.
- Close: spec status complete, CLAUDE.md current change set to none. Living docs checked: codebase-map.md and must-not-change.md untouched and still current; no deploy, no migration. Not the third closed change since the C07 process edit (C08, C09), so no process edits proposed; process questions are optional and unanswered.
- Close: fast-forward into portfolio is yours after the commit; record the hash then.

### Next

- Fast-forward `chore/09-workflow-v4` into portfolio, then pick the next change from findings.md.

## C08: lint ignores, codebase map rewrite, README version (`docs/changes/08-docs-lint-cleanup/`): complete

Branch: `chore/08-docs-lint-cleanup`
Tier: Light. Decisions: none.

### Done

- S1: branch from portfolio, spec written (F10, F18). Intake: Q1 F10's 3022/3021 part dropped as obsolete; Q2 codebase-map section 6 observations move to findings.md as new F#; Q3 README "Next.js 15" fix in. Ignore list (src/generated, playwright-report, test-results) and table format are defaults.
- S1: Before filled: A1–A5, A7–A10 fail (lint 798, map has preamble and 73 box-drawing lines, README says Next.js 15); A6, A11, A12 pass (build 0, tsc 0). Only src/generated/ adds lint problems today; the 8 reference problems are listed in the spec's Notes for A2. No manual criteria.
- S1: A5 checked bare paths (the map has no backticked ones); A6's baseline grep is weak because "/" matches any line, so After checks the route cells.

- S2: `eslint.config.mjs` ignores `src/generated/**`, `playwright-report/**`, `test-results/**`; CLAUDE.md lint note now says plain `npm run lint`, baseline 8; F10 resolved. A1, A2, A3, A9, A12 After filled, all pass (lint 8: 5 errors, 3 warnings; same 69 files and same 8 entries as the baseline; build 0, tsc 0). A10 waits for F18 in S3.
- S2: local choices: no comment above the new ignores (CLAUDE.md comment rule, A3 wants only the patterns); older changes' specs keep their `--ignore-pattern` text (history).
- S3: `docs/codebase-map.md` rewritten from the code (7 sections, plain tables, repo-relative paths, architecture only); section 6 observations mapped in the spec's Notes: new findings F25–F36 (12), F21 and C04 reused, plus F37 (Render cron, unverified); README says Next.js 16 (2 places); F18 resolved; spec.md line 1 heading repaired (S2 review note). A4–A8, A10–A12 After filled, all pass (lint 8, build 0, tsc 0).
- S3: local choices: old section 7 (CLAUDE.md/README/ROADMAP mismatches) dropped, not mapped; "SERVICE_ROLE_KEY missing from .env" dropped as obsolete (key is present); one table per area; F25–F37 are one line each, no new decisions.

- Validate: all 12 criteria rerun on `chore/08-docs-lint-cleanup`, all pass, After values unchanged (lint 8: 5 errors, 3 warnings, 69 files, same 8 entries; build 0; tsc 0; A4/A8/A9 greps 0; A6 13 of 13; A5 path script finds only URL route patterns, a fetch call and the /testImages/ URL unresolved, no missing file). No manual criteria, no differences from Before that need a decision.

- Close: /sdd-close. Docs-only change, no deploy, no migration. Code and docs reached portfolio by fast-forward (no merge commit, local, not pushed): a0cfb5c (S2), 5855b6a (S3), e79c2a3 (close). F10 and F18 resolved; new findings F25–F37 were filed in S3; no new open questions. CLAUDE.md current change set to none.
- Close: living docs checked against the diff: codebase-map.md rewritten in S3, CLAUDE.md lint note updated in S2, must-not-change.md unchanged; nothing stale. Not the third closed change since the last process edit (C07), so no process edits proposed.

### Next

- Pick the next change from findings.md (F25–F37 are new; F20–F24 older).

## C07: required image or illustration (`docs/changes/07-required-image/`): complete

Branch: `feat/07-required-image`
Tier: Standard. Decisions: D15 (`docs/changes/07-required-image/decisions.md`).

### Done

- S1: branch from portfolio, spec written (F5). Intake: Q1 revised by me: valid imgUrl = illustration ID, `/testImages/` path or own bucket URL (no other http(s) URLs, common practice on event sites); Q2 PUT rejects too; Q3 no placeholder conversion (edits of placeholder events get 400); Q4, Q5 defaults.
- S1: Before filled: A1, A3, A6, A8, A10, A15 fail (all bad values 200 on POST and PUT, form saves placehold.co, no `*`, placeholder live); A2, A4, A5, A9, A11–A14 pass (26 + 3, 3 of 3 runs; build 0, tsc 0, lint 8); A7 n/a. A8 and A15 run by me (upload works in dev and live).
- S1: A1–A4, A6 measured with a temporary probe spec (logs only, deleted after the run). A1 wording corrected from "5 of 5" to "6 of 6" (it lists 6 cases; spec not yet committed, so no D#).
- Design: design.md written, plan inside it (S2 rule + API, S3 form, S4 docs + deploy). Rule in `src/lib/imgUrl.ts`; `IllustrationId` derives from its ID list; bucket prefix from `NEXT_PUBLIC_SUPABASE_URL` (literal read, trailing `/` stripped, unset → reject); a prefix needs at least one character after it (my approval). New tests in `image-rule.spec.ts`, which reads the prefix from `.env` itself (env.ts unchanged, A12). D15: the C05 suite is the safety net, no characterization step.

- S2: `src/lib/imgUrl.ts` (rule, IDs, message), `IllustrationId` derived from it, POST and PUT check `imgUrl` (placeholder and keep-old fallback removed), `helpers.createEvent` default `imgUrl: 'music'`, event-crud picks an illustration, new `image-rule.spec.ts` (12 tests: A1–A4, A9). `npm run test:e2e`: 38 (26 + 12 new) + 3 pass, exit 0, 1 run. A1–A5, A7, A9, A10, A12–A14 After filled, all pass; A11 waits for the 3 runs in S4.
- S2: local choices: new spec uses `:visible` locators on `event-media` (first run hit the F24-style hidden duplicate: 2 svg elements); `import type` for `ILLUSTRATION_IDS` in Illustrations.tsx (types only); the dev server on :3000 had to be stopped first (dev lock).

- S3: `event-form.tsx`: `required` on the image Field (red `*`), client check with `validImgUrl` before `setLoading` (no fetch), `data-testid="event-form-error"` on the error line. New form test in `image-rule.spec.ts`. `npm run test:e2e`: 39 + 3 pass, exit 0. build 0, tsc 0, lint 8. A6 After filled (pass); A8 manual by me; A11 waits for S4.
- S3: local choices: the check sits before `setLoading`; the error `<p>` is now a multi-line JSX block; the test counts requests with `page.on('request')`.

- S4: CLAUDE.md Gotchas `imgUrl` line, codebase-map placeholder line, F5 resolved. A11 After filled: `npm run test:e2e` 39 + 3 pass, 3 of 3 runs, exit 0 (the DatabaseNotReachable lines in the output come from the db-error run, which refuses the connection on purpose). A8 pass (run by me, dev): `*` shows, upload saves and shows.

- Validate: all automated criteria rerun, After values unchanged: A10 0 matches; A11 39 + 3, 3 of 3 runs; A12 only event-crud (+1) and helpers (+7/-1), 0 expect lines changed; A13 build 0, tsc 0, lint 8; A14 no diff. A15 pass (run by me, Render): no-image create shows the error and saves nothing, uploaded image saves. All 15 criteria pass; no After differs from Before in a way that needs a decision. Missing Notes cells added to the criteria table.

- Validate docs committed as c7ae3e8 through the gate.
- Close: /sdd-close. Code reached portfolio by fast-forward (no merge commit, local, not pushed): b1f31ea (S2), 79eeb29 (S3), 9b47a13 (S4 docs), c7ae3e8 (validate docs). Deploy: A15 pass on Render (run by me). F5 resolved; no new findings or open questions. CLAUDE.md current change set to none.
- Close: codebase-map.md API rows (POST, PUT) and tests/e2e line updated for the imgUrl rule; must-not-change.md unchanged. Process notes written.
- Close: process edits approved by me (third change since the last edit): defaults are taken without asking when stakes are low (sdd-start step 4, workflow.md, CLAUDE.md); process questions are optional (sdd-close step 6); Notification hook `.claude/hooks/notify.ps1` shows a toast and sound when input is needed. workflow.md is now version 3.1.

### Next

- Next change: not chosen. Open backlog worth considering: F23 (flaky first request, corrupt .next), F22 (CI for the suite), F21 (non-owner sees the edit form).
