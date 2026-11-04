# Templates

docs/workflow.md sets which sections exist for each tier. Sizes and counts below are targets, not limits (workflow.md, "Hard rules and targets").

## Quick commit message
```
<type>(F<n>): <message>

What: <the change, one or two lines>
Why:  <the finding or reason>
Checks: <command → verdict and number>
```
Plus one line each in findings.md (mark F<n> resolved) and progress.md. Review id `F<n>`, or `Q-<slug>` without a finding.

## spec.md
```markdown
# C<NN>: <title>
Tier: Light | Standard | Heavy · Status: draft | in progress | done · Decisions: <D#, ...>

## Context          (target ~5 lines) what changes, why, who is affected, references
## Current behavior (target: Light 3, Standard 10 lines; Heavy: design.md As-is)
## Scope            In / Out, one reason per Out item; findings by F#; assumptions
## Must not change  docs/must-not-change.md + change-specific items
## Risks            (target ~5) each with its mitigation (a criterion or a step)
## Acceptance
Light: a list, one line per criterion: `A<n>: <criterion> · how: <check> · before: <verdict + number> · after: <verdict + number>`
Standard, Heavy: a table
| # | Criterion (EARS for behavior, with tolerance) | How verified | Before | After | Notes |
Before and After hold a verdict plus a number; detail goes to a finding or the commit message.
## Plan             (Light; Standard optional) S1..Sn in plan-step format
## Rollback         how to undo, incl. migrations
## Why              (target ~5 lines) main choices and the rejected alternative
```
Light target: spec ~30 lines. I approve the spec and the commit only (plus any decision).

## design.md (Standard, Heavy)
```markdown
# C<NN> design
## As-is   (Heavy) data, flows, states of the affected area, checked against code
## To-be   as a diff: changed / added / unchanged
## Data    migrations, existing-data conversion, compatibility (or "none")
## Trace   A# → design section → S#
## Why     (target ~5 lines)
```

## Plan step
```
S<n>: <name>
Do:     concrete work
Don't:  files and areas out of bounds; what to do instead
Verify: new checks + full existing check set; A# covered (Light: includes validation of all criteria on the last step)
Commit: <type>(C<NN>-S<n>): <message>
```

## Decision entry
```
D<n>: <decision>
     Supersedes: <D# or spec line, if any>
     Why: <reason>
     Trade-off: <what we give up>
     Affects: <documents, sections, steps>
```

## Finding line (findings.md)
`F<n>: <summary> · size: S|M|L · value: low|medium|high`. Resolved findings move under Archive.

## Progress note
`S<n>: <what happened>` (one line, under the change's section in progress.md)

## Skill summary (last thing every skill prints)
```
Done:   <what changed or was produced>
Result: <verdict + number>
You:    <what I must decide or do next>
```
Target ≤ 5 lines.

## Review packet (written to .claude/state/review-packet.md)
```markdown
## Review packet: C<NN>-S<n>   (Quick: F<n> or Q-<slug>)
Step goal: <one line from the plan>   (Quick: the finding)
Files staged: <path - one line on what changed>, ...
Outside Do/Don't: none | <list>   (Quick: outside the finding's scope)
Callers checked: <list>
Checks run: <command → result, actual output tail>
Criteria: <A# → pass | fail | not yet testable>   (Quick: none)
Deviations: none | <what, why, classification: decision (draft) | finding | progress note>
Odd code touched or removed: none | <path, why it existed if known>
Proposed commit message: <type>(C<NN>-S<n>): <message>   (Quick: the full message with What, Why, Checks)
```
