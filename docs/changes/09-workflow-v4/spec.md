# C09: workflow v4, a Quick tier and leaner docs
Tier: Light · Status: in progress · Decisions: D16 (planned, docs/decisions.md)

## Context
The process costs the same for a one-line fix as for a docs change, and the docs mix what I read with what the agent needs.
v4 adds a Quick tier, trims Light, turns size numbers into targets with the hard rules marked, and gives me ≤ 5-line skill summaries,
a current-state block in progress.md and one-line findings. References: docs/workflow.md v3.1, D12, D13, findings F1–F37.

## Current behavior
v3.1 has three tiers (Light, Standard, Heavy) whose size and criteria numbers are hard limits. Every skill opens with a step 0 model check.
progress.md holds every change in full (227 lines). findings.md mixes open and resolved entries. Skills end without a fixed summary.

## Scope
In: everything listed in the request (workflow.md v4, Quick tier, Light rules, results cells, summaries, targets vs hard rules,
sdd-quick skill, other skills, templates.md, model frontmatter, CLAUDE.md, progress.md, findings.md, open-questions.md, D16).
Out: closed change folders C01–C08 (history); existing decision entries (append only); docs/process-notes.md (my notes);
docs/codebase-map.md (F18 is done, map is current); .claude/hooks/ and settings.json (the gate already accepts any id);
anything outside docs/, .claude/ and CLAUDE.md.
Assumptions (intake defaults, approved):
- Q1: `model:` set in every skill, step 0 removed; workflow.md says the override lasts one turn, so for skills that wait for me
  (start, design, step) I set /model first if it matters. Source: code.claude.com/docs/en/skills, frontmatter table, `model` row.
- Q2: D16 says C01–C02 followed guide v2, C03–C08 v3.x, v4 applies from C09.
- Q3: C01–C06 collapse to one line each; C07 and C08 stay in full under the current-state block.
- Q4: this spec follows v3.1 Light; after S1 lands, S2 follows v4 Light: validation inside S2's Verify, close in S2's commit.
- Quick commits: `<type>(F<n>): <message>`, review id `F<n>` (or `Q-<slug>` without a finding); sdd-review reviews a Quick commit
  against its commit message and finding when no spec exists.
- I assign each open finding's size and value; I (the user) review them when approving S2.

## Must not change
docs/must-not-change.md (/api/reset, the GitHub secrets and 6-hour schedule): untouched. Change-specific: every hard rule in
CLAUDE.md stays (commit gate, staging, secrets, migrations, tests, Do/Don't, decisions after approval); review-gate.mjs and
settings.json unchanged; existing decisions and F/Q numbers unchanged.

## Risks
1. A hard rule gets lost while rewording CLAUDE.md or skills → A3, A8 (per-rule check against the old text).
2. sdd-review rejects or can't place Quick commits without a spec → A5 (Quick branch in sdd-review).
3. "Targets" read as "no limits" → A3 (1.5× rule and the hard-rule list in workflow.md).
4. Collapsing progress.md drops a merge commit or result → A11 (each line names result, commit, folder; checked against git log).
5. Findings re-sorted lose or renumber an F# → A11 (F1–F37 each exactly once).

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | workflow.md says Version 4 and its tier table has Quick, Light, Standard, Heavy; Quick has the triggers (small fix, few files; no schema, auth, must-not-change item or new behavior) and the output (no folder, commit message with what/why/checks, one line in findings.md and progress.md, commit gate) | read + grep "Version 4", "Quick" | fail: 0 and 0 matches | pass: Version 4 1 match, Quick 4; tier table has Quick, Light, Standard, Heavy | |
| A2 | Light in workflow.md and templates.md: spec target ~30 lines, checks as a list, Before/After one line per cell, validation inside the step's Verify, close in the same commit, I approve spec and commit only; sdd-step and sdd-close match | read | fail: 0 matches | pass: Light target ~30, list form, one line per cell, validation and close in last step, approval only (workflow.md:44, 49-50, templates.md:26-34); sdd-step and sdd-close match | |
| A3 | workflow.md has a hard-rules list (must-not-change, commit gate, secrets, migrations, Do/Don't) and marks sizes and counts as targets with the 1.5× summary rule; every "≤", "at most", "limit" in workflow.md, templates.md and skills is either labelled a target or a hard rule | grep, each match classified in Notes; 0 unclassified | fail: no hard-rule list; 18 unclassified matches | pass: hard-rules list in workflow.md:7; 12 matches, 0 unclassified (10 targets, workflow.md:8 defines the rule, CLAUDE.md:153 pooler limits is external) | |
| A4 | Results cells: workflow.md and templates.md say verdict plus a number, detail to a finding or the commit message | read | fail: 0 matches | pass: workflow.md:53, templates.md:29 | |
| A5 | .claude/skills/sdd-quick/SKILL.md exists (disable-model-invocation: true), covers trigger check, commit message what/why/checks, findings and progress lines, review packet and the gate; sdd-review has a Quick branch | read | fail: no sdd-quick; 0 Quick in sdd-review | pass: sdd-quick exists (disable-model-invocation: true); Quick branch in sdd-review | |
| A6 | Every SKILL.md has a `model:` frontmatter line; 0 "Model check" lines in .claude/skills; workflow.md states the one-turn scope and the doc source | grep | fail: 1 of 6 with model (sdd-review); 5 Model check lines | pass: 7 of 7 with model:, 0 Model check lines; workflow.md Models section states the one-turn scope and doc source | |
| A7 | Every SKILL.md (7) ends with the ≤ 5-line summary for me (done, result, what I must decide or do) | grep, 7 of 7 | fail: 0 of 6 | pass: 7 of 7 end with the summary line | |
| A8 | CLAUDE.md lists sdd-quick and the v4 procedures; every Working rules bullet from 33f23bf is still present or reworded with the same rule | diff vs 33f23bf, each removed line mapped in Notes | fail: 0 sdd-quick (14 Working rules bullets) | pass: 14 rules before, 15 after; none removed; plan bullet extended for Quick, targets bullet added | |
| A9 | Skills point to templates.md and to no change folder | grep "docs/changes/[0-9]" in .claude/skills: 0 | pass: 0 | pass: 0 matches | |
| A10 | docs/decisions.md gains D16 only; D1–D13 lines unchanged | git diff: additions only | fail: no D16 | pass: D16 added, 6 lines added, 0 removed | |
| A11 | progress.md starts with a current-state block; C01–C06 one line each (result, merge commit, folder); C07, C08 sections unchanged. findings.md: open findings as "F#: summary · size: … · value: …", resolved ones under Archive, F1–F37 each exactly once. open-questions.md: closed Q2, Q3 under Archive, Q1 open | read + grep counts | fail: no block (starts with C08), 8 full sections; 0 size lines, 0 Archive sections (F1–F37 present once: 37) | | |
| A12 | Changed files only in docs/workflow.md, docs/decisions.md, docs/progress.md, docs/findings.md, docs/open-questions.md, docs/changes/09-workflow-v4/, .claude/skills/, CLAUDE.md; build, tsc, lint unchanged (lint 8) | git diff --name-only portfolio; npm run build, npx tsc --noEmit, npm run lint | pass: 0 files; build 0, tsc 0, lint 8 (5 errors, 3 warnings) | pass: build 0, tsc 0, lint 8 (5 errors, 3 warnings); S1 files are in the allowed set | |

## Plan
S1: tooling
Do:     workflow.md v4; templates.md (Quick commit message, lean Light spec, results cells, summary); new sdd-quick; update sdd-start,
        sdd-design, sdd-step, sdd-review, sdd-validate, sdd-close (model frontmatter, no step 0, summary, Light and Quick paths,
        target wording); CLAUDE.md procedures; D16 in docs/decisions.md; progress.md line.
Don't:  hooks, settings.json, change folders C01–C08, existing decisions, codebase-map.md, process-notes.md; living-doc reshaping (S2).
Verify: A1–A10, A12.
Commit: chore(C09-S1): workflow v4 with a Quick tier, size targets and skill summaries

S2: living docs and close (v4 Light)
Do:     progress.md current-state block and C01–C06 collapse; findings.md format and archive; open-questions.md archive;
        validation of all criteria in this Verify; close (After filled, CLAUDE.md current change none, process questions).
Don't:  F/Q renumbering, finding content beyond the one-line summary, anything S1 owns.
Verify: A11, A12, then rerun A1–A10.
Commit: chore(C09-S2): living docs in v4 form, close C09

## Rollback
Docs and skills only, no migration: git revert the S2 and S1 commits (or reset portfolio to 33f23bf before push).

## Why
Quick tier: a one-file fix shouldn't need a folder and five skills; the commit gate still applies, so review stays.
Targets over limits: v3 hard limits produced trimming work with no value (guide v2 "at most = hard limit" reversed in D16).
Rejected: a separate "docs for me" file next to progress.md; the current-state block and one-line findings do that without a new file.
