# C02: Docs migration to project guide v2
Tier: Light · Status: in progress · Decisions: D11

## Context
Project guide v2.0 replaces v1.0, based on the C01 process notes. The repo docs
conflict with v2: docs/spec.md shares its name with change specs, and CLAUDE.md
names change folders <NN-name> while the C01 folder is security-patch.

## Current behavior
Docs layout per D5 and D10. No app behavior is involved.

## Scope
In:
- git mv docs/changes/security-patch docs/changes/01-security-patch (D11)
- git mv docs/spec.md docs/must-not-change.md (D11)
- Update old paths in current-state docs: CLAUDE.md, progress.md, findings.md, open-questions.md
- Number findings F1.. and open questions Q1.. in their current order
- Add finding: convert the workflow to Claude Code skills and a commit-review hook (planned C03)
- Complete the cut-off open question from the folder on disk; mark it "(reconstructed)"
- CLAUDE.md edits in S4
- Append D11 to docs/decisions.md
- Delete ../tmp/ in S6 (outside the repo, untracked). List its files in the review packet first.
Out:
- Editing any existing decision entry: logs are append-only; D11 maps old paths
- Contents of docs/changes/01-security-patch/spec.md: closed change, historical record
- ../findings.md (outside the repo): list only
- Anything in src/, prisma/, public/, .github/, package files, next.config.ts
- The skills conversion: C03

## Must not change
- Content of the must-not-change list (file renamed only)
- Text of D1–D10
- Files outside docs/ and CLAUDE.md

## Risks
1. A stale path remains → A3
2. A CLAUDE.md rule is dropped while editing → A5
3. Git history is lost on rename → git mv; A2

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | docs/changes/01-security-patch/ holds spec.md and decisions.md; docs/changes/security-patch/ does not exist | ls | Fail: only docs/changes/security-patch/ exists | Pass: 01-security-patch/ holds decisions.md, spec.md; old folder gone | |
| A2 | docs/must-not-change.md exists with unchanged content; docs/spec.md does not exist | git diff -M --stat portfolio shows renames | Fail: docs/spec.md exists, docs/must-not-change.md does not; diff empty | Pass: both renames at 100% similarity (spec.md => must-not-change.md; security-patch => 01-security-patch) | |
| A3 | No "changes/security-patch" or "docs/spec.md" in CLAUDE.md, progress.md, findings.md, open-questions.md | grep -rn; matches allowed only in decisions.md files and 01-security-patch/spec.md | Fail: 6 matches (CLAUDE.md:9, 12, 15; progress.md:3, 6; findings.md:22) | Pass: 0 matches in the four files | Outside them: 02-guide-v2/spec.md (describes the rename) and docs/process-notes.md:15 (untracked, historical note) |
| A4 | Every finding has a unique F number; every open question a unique Q number | read both files | Fail: 13 findings, 3 open questions, none numbered; the 3rd question is cut off | Pass: F1–F14 unique, Q1–Q3 unique; Q3 marked (reconstructed) | |
| A5 | CLAUDE.md contains every S4 edit; every old rule is still present or its move is listed in the review packet | git diff portfolio -- CLAUDE.md | Fail: no S4 edits yet | Pass: all S4 edits present; one rule moved (migration rule, Commands → Working rules) | Also changed <NN-name> to <NN-slug> in Change protocol |
| A6 | Changes only in docs/ and CLAUDE.md | git diff --stat portfolio | Pass: diff empty | Pass: 9 files, all in docs/ or CLAUDE.md | |
| A7 | D11 appended; D1–D10 unchanged | git diff portfolio -- docs/decisions.md shows only added lines | Fail: no D11; diff empty | Pass: only + lines (blank line + D11, 6 lines) | |
| A8 | ../tmp/ does not exist | ls .. (after S6) | Fail: ../tmp/ exists (empty) | Pending S6 | ../tmp/ is empty: nothing to list |

## Plan
S1: Branch, write this spec, fill Before.
S2: Both git mv renames. Update old paths in the four current-state docs. Append D11:
    D11: Adopt project guide v2 naming conventions.
         Refines: D5, D10.
         Why: v1 names conflicted (docs/spec.md vs change spec.md; CLAUDE.md said <NN-name>,
         the folder was security-patch). Specs need stable IDs to cite findings and questions.
         Trade-off: D2–D10 and the C01 spec keep old paths: docs/changes/security-patch/ =
         docs/changes/01-security-patch/; docs/spec.md = docs/must-not-change.md.
         Affects: docs/ layout, CLAUDE.md, progress.md, findings.md (F#), open-questions.md (Q#).
S3: Number findings and open questions. Add the C03 finding. Complete the cut-off question.
S4: CLAUDE.md edits:
    - Working documents: folder pattern docs/changes/<NN-slug>/; current change: docs/changes/02-guide-v2/;
      add docs/must-not-change.md; add ID prefixes: C change, D decision (global), F finding,
      Q open question, A criterion and S step (local to a change; outside it write C01-A3).
    - Working rules, first line: "Never edit an existing migration file; add a new one." Remove it from Commands.
    - Working rules, add: "Never commit until I confirm the review packet was approved. Before every
      commit, stop with a review packet: step goal; files changed with one line each; anything outside
      Do/Don't; checks run with actual output tail; criteria status; deviations; odd code touched or
      removed; proposed commit message."
    - Working rules, add: "Fill baseline and results tables, progress.md and findings.md yourself.
      Append decisions only after I approve them."
    - Working rules, add: "Write a decision only when scope, an acceptance criterion, a must-not-change
      item, the tier or the approach changes. Otherwise add one line to progress.md."
    - Commands, lint note: replace the hardcoded baseline count with "see the current change's spec".
S5: Confirm no CLAUDE.md or AGENTS.md exists outside the repo root, including parent folders.
    List the files in ../tmp/. Add a C02 entry to progress.md. Append to docs/process-notes.md:
    "v2 H1/H3 split is heavy for docs-only Light changes; C02 used one handoff." Fill After. Review packet.
S6 (after approval): commit "docs(C02): migrate docs to project guide v2", merge into portfolio,
    push. No Render deploy: no runtime file changes. Then delete ../tmp/ and fill A8's After column.

## Rollback
git revert the merge commit on portfolio.

## Why
- Old log entries keep old paths; D11 maps them. Rejected: rewriting paths inside logs.
- One handoff and one commit. Rejected: per-step reviews; docs-only, no runtime risk.
- No deploy. Rejected: a manual Render deploy; nothing it serves changes.
