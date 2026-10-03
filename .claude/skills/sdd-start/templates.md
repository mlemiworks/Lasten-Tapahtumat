# Templates

docs/workflow.md sets which sections exist for each tier and their limits.

## spec.md
```markdown
# C<NN>: <title>
Tier: Light | Standard | Heavy · Status: draft | in progress | done · Decisions: <D#, ...>

## Context          (≤ 5 lines) what changes, why, who is affected, references
## Current behavior (Light ≤ 3, Standard ≤ 10 lines; Heavy: design.md As-is)
## Scope            In / Out, one reason per Out item; findings by F#; assumptions
## Must not change  docs/must-not-change.md + change-specific items
## Risks            ≤ 5, each with its mitigation (a criterion or a step)
## Acceptance
| # | Criterion (EARS for behavior, with tolerance) | How verified | Before | After | Notes |
## Plan             (Light; Standard optional) S1..Sn in plan-step format
## Rollback         how to undo, incl. migrations
## Why              ≤ 5 lines: main choices and the rejected alternative
```

## design.md (Standard, Heavy)
```markdown
# C<NN> design
## As-is   (Heavy) data, flows, states of the affected area, checked against code
## To-be   as a diff: changed / added / unchanged
## Data    migrations, existing-data conversion, compatibility (or "none")
## Trace   A# → design section → S#
## Why     ≤ 5 lines
```

## Plan step
```
S<n>: <name>
Do:     concrete work
Don't:  files and areas out of bounds; what to do instead
Verify: new checks + full existing check set; A# covered
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

## Progress note
`S<n>: <what happened>` (one line, under the change's section in progress.md)

## Review packet (written to .claude/state/review-packet.md)
```markdown
## Review packet: C<NN>-S<n>
Step goal: <one line from the plan>
Files staged: <path - one line on what changed>, ...
Outside Do/Don't: none | <list>
Callers checked: <list>
Checks run: <command → result, actual output tail>
Criteria: <A# → pass | fail | not yet testable>
Deviations: none | <what, why, classification: decision (draft) | finding | progress note>
Odd code touched or removed: none | <path, why it existed if known>
Proposed commit message: <type>(C<NN>-S<n>): <message>
```
