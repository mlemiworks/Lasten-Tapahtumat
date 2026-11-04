# Workflow: spec-driven changes with Claude Code

Version 4 (C09, D16; successor to v3.1, C03/D12). Guide v2 (Claude.ai) is retired. C01–C02 followed guide v2, C03–C08 v3.x, v4 applies from C09.
Start every session in `eventsforkids/` (the repo root). From the parent folder, the skills and the commit gate don't load.

## Hard rules and targets
Hard rules never bend; a change that would break one stops and asks: must-not-change items, the commit gate, secrets, migrations (never edit an existing one), a step's Do/Don't, existing tests (never modified to pass), decisions appended only after my approval.
Everything else with a number is a **target**: line counts, criteria counts, question counts, summary length. Going over a target is fine when the content needs it. Over 1.5× the target, say so in the summary and name what would shrink it. Wording like "≤" or "at most" outside the hard rules above is always a target.

## Roles
- Claude Code: drafts every document, implements, runs checks, keeps progress.md, findings.md and results tables.
- Reviewer (`/sdd-review`): a forked subagent that reviews each commit without the implementing conversation.
- Me: answer questions, run manual checks, approve decisions and every commit.

## Phases and skills
| Phase | Skill | Ends when |
|---|---|---|
| Quick fix | `/sdd-quick <F#>` | fix verified, staged, review packet written |
| Intake, spec, baseline | `/sdd-start <F# or request>` | spec approved, Before column filled |
| Design (Standard, Heavy) | `/sdd-design` | every criterion traces to a design section and a step |
| Implement, per step | `/sdd-step <S#>` | step verified, staged, review packet written |
| Review, per commit | `/sdd-review` | verdict recorded; I approve the commit |
| Validate | `/sdd-validate` | After filled; every difference matches or is decided |
| Deploy | me | live checks pass, or rollback done |
| Close | `/sdd-close` | docs current, process questions answered |
Light changes: `/sdd-start`, then one `/sdd-step` for the whole plan unless the plan splits it. Validation runs inside the last step's Verify and close goes in the same commit, so `/sdd-validate` and `/sdd-close` are optional for Light.
Every skill ends with a summary for me (target ≤ 5 lines): what is done, the result, what I must decide or do.

## Models
Each skill sets `model:` in its frontmatter (start, design, review: Opus; quick, step, validate, close: Sonnet). The override lasts one turn only (code.claude.com/docs/en/skills, frontmatter table, `model` row), so for skills that wait for my reply (start, design, step) I set `/model` first when it matters. Skills no longer check the model.

## Commit gate
1. `/sdd-review` records a verdict tied to the hash of the staged diff (`.claude/state/review.json`).
2. A PreToolUse hook (`.claude/hooks/review-gate.mjs`) blocks Claude's `git commit` unless an approved verdict matches the staged diff. Allowed form: `git commit -m "<message>"` (or `-F`); no `-a`, `--amend` or paths.
3. Claude Code asks me before every commit.
The gate covers Claude's commits only. Merges, and verdicts or commits I make in my own terminal, are my responsibility.

## Rigor tiers
| | Quick | Light | Standard | Heavy |
|---|---|---|---|---|
| Triggers | small fix in a few files; no schema, auth, must-not-change item or new behavior | dependency, config, docs, tooling; no app logic | app behavior changes | schema, auth, data deletion, must-not-change item, production data |
| Documents | none: no change folder | spec.md, plan inside | spec.md + design.md | spec.md + design.md + plan.md |
| Output | commit message with what, why, checks; one line each in findings.md and progress.md; commit gate | spec, one step commit, close in the same commit | as Light, plus design | as Standard, plus plan |
| Size targets (lines) | message ~10 | spec ~30 | spec ~120, design ~80, plan ~100 | ~150 each |
| Criteria target | none | ~12 | ~15 | ~20 |
| Safety net | the fix's own check | baseline | + characterization tests | + rollback rehearsed |
The highest matching trigger wins. Results tables and the spec's Notes section don't count toward size targets. Changing tier is a decision.
Quick: I name the finding (`/sdd-quick F12`), Claude Code checks the triggers and stops if any fails (then the change is Light or higher). Commit `<type>(F<n>): <message>`; review id `F<n>`, or `Q-<slug>` without a finding. `/sdd-review` judges a Quick commit against its message and the finding.
Light: the spec uses checks as a list, Before/After as one line per cell, and I approve the spec and the commit only (plus any decision).

## Criteria
Behavior criteria use EARS: "When <trigger>, the <system> shall <response>." "If <unwanted condition>, then the <system> shall <response>." "While <state>, ...". Checks (build, lint, versions) stay plain. Every criterion states its tolerance; grep criteria list allowed matches as path patterns. Baseline rule: run every criterion before the change; "nothing broke" means the same results as the baseline.
Results cells (Before, After) hold a verdict plus a number (`pass: 0 matches`, `fail: lint 12`). Detail goes to a finding or the commit message, not the cell.

## Decisions and changes to the plan
Decision (D) only when scope, a criterion, a must-not-change item, the tier or the approach changes, or a result that differs from the baseline is accepted. An out-of-scope observation is a finding (F), one line: `F#: summary · size: … · value: …`. Anything else is one line in progress.md. Decisions are short (target ~6 lines), append-only, with global IDs, appended only after I approve.
Defaults: where a sensible default exists and the stakes are low (naming, formatting, internal structure, wording), decide, state the choice in the summary or as a spec assumption, and don't ask. Ask only when scope, a criterion, a must-not-change item, the tier or the approach is at stake.
When implementation shows the spec, design or plan is wrong: stop, report the deviation, change the documents first (spec, then design, then plan, tagged with the D#), then the code.

## Naming
Change folders `docs/changes/NN-slug/`. Branches `<chore|fix|feat>/NN-slug`. Commits `<type>(CNN-Sn): <message>`, Quick `<type>(F<n>): <message>`. Project IDs: C change, D decision, F finding, Q open question. Change-local IDs: A criterion, S step (outside the change, write C03-A2). IDs are never reused.

## Notifications
A Notification hook (`.claude/hooks/notify.ps1`, set in `.claude/settings.json`) shows a Windows toast and plays a sound whenever Claude Code waits for my input or a permission.

## Process review
`/sdd-close` offers (optional; unanswered counts as no answer): What was clumsy? What was skipped, and did it matter? What produced no value? Answers go to docs/process-notes.md. After every third closed change, propose edits to this file, CLAUDE.md and the skills as a diff with one reason each, and raise the version.
