# Workflow: spec-driven changes with Claude Code

Version 3.0 (C03, D12). Successor to project guide v2 (Claude.ai), now retired.
Start every session in `eventsforkids/` (the repo root). From the parent folder, the skills and the commit gate don't load.

## Roles
- Claude Code: drafts every document, implements, runs checks, keeps progress.md, findings.md and results tables.
- Reviewer (`/sdd-review`): a forked subagent that reviews each commit without the implementing conversation.
- Me: answer questions, run manual checks, approve decisions and every commit.

## Phases and skills
| Phase | Skill | Ends when |
|---|---|---|
| Intake, spec, baseline | `/sdd-start <F# or request>` | spec approved, Before column filled |
| Design (Standard, Heavy) | `/sdd-design` | every criterion traces to a design section and a step |
| Implement, per step | `/sdd-step <S#>` | step verified, staged, review packet written |
| Review, per commit | `/sdd-review` | verdict recorded; I approve the commit |
| Validate | `/sdd-validate` | After filled; every difference matches or is decided |
| Deploy | me | live checks pass, or rollback done |
| Close | `/sdd-close` | docs current, process questions answered |
Light changes: `/sdd-start`, then one `/sdd-step` for the whole plan unless the plan splits it.

## Commit gate
1. `/sdd-review` records a verdict tied to the hash of the staged diff (`.claude/state/review.json`).
2. A PreToolUse hook (`.claude/hooks/review-gate.mjs`) blocks Claude's `git commit` unless an approved verdict matches the staged diff. Allowed form: `git commit -m "<message>"` (or `-F`); no `-a`, `--amend` or paths.
3. Claude Code asks me before every commit.
The gate covers Claude's commits only. Merges, and verdicts or commits I make in my own terminal, are my responsibility.

## Rigor tiers
| | Light | Standard | Heavy |
|---|---|---|---|
| Triggers | dependency, config, docs, tooling; no app logic | app behavior changes | schema, auth, data deletion, must-not-change item, production data |
| Documents | spec.md, plan inside | spec.md + design.md | spec.md + design.md + plan.md |
| Size limits (lines) | spec 80 | spec 120, design 80, plan 100 | 150 each |
| Criteria | ≤ 12 | ≤ 15 | ≤ 20 |
| Safety net | baseline | + characterization tests | + rollback rehearsed |
The highest matching trigger wins. Results tables and the spec's Notes section don't count toward limits. Changing tier is a decision.

## Criteria
Behavior criteria use EARS: "When <trigger>, the <system> shall <response>." "If <unwanted condition>, then the <system> shall <response>." "While <state>, ...". Checks (build, lint, versions) stay plain. Every criterion states its tolerance; grep criteria list allowed matches as path patterns. Baseline rule: run every criterion before the change; "nothing broke" means the same results as the baseline.

## Decisions and changes to the plan
Decision (D) only when scope, a criterion, a must-not-change item, the tier or the approach changes, or a result that differs from the baseline is accepted. An out-of-scope observation is a finding (F). Anything else is one line in progress.md. Decisions are ≤ 6 lines, append-only, with global IDs, appended only after I approve.
When implementation shows the spec, design or plan is wrong: stop, report the deviation, change the documents first (spec, then design, then plan, tagged with the D#), then the code.

## Naming
Change folders `docs/changes/NN-slug/`. Branches `<chore|fix|feat>/NN-slug`. Commits `<type>(CNN-Sn): <message>`. Project IDs: C change, D decision, F finding, Q open question. Change-local IDs: A criterion, S step (outside the change, write C03-A2). IDs are never reused.

## Process review
`/sdd-close` asks: What was clumsy? What was skipped, and did it matter? What produced no value? Answers go to docs/process-notes.md. After every third closed change, propose edits to this file, CLAUDE.md and the skills as a diff with one reason each, and raise the version.
