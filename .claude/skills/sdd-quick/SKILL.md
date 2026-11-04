---
name: sdd-quick
description: Quick tier - fix one small finding without a change folder; the commit message carries what, why and checks.
argument-hint: "[F# or Q-slug]"
disable-model-invocation: true
model: sonnet
---
# Quick fix: $ARGUMENTS

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md (Rigor tiers). Templates: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

1. Read CLAUDE.md, docs/must-not-change.md and the finding $ARGUMENTS in docs/findings.md. Without a finding, use the request and the id `Q-<slug>`.
2. Trigger check: a small fix in a few files; no schema, auth, must-not-change item or new behavior. If any fails, stop and tell me the change is Light or higher (`/sdd-start`). The tree must be clean apart from the fix.
3. Describe the fix in about 5 lines (target): files, callers you'll check, the check that proves it. Wait for my go.
4. Implement only what the finding names. Anything else you notice goes to findings.md as a new one-line F#, not into the fix. Never modify existing tests to make them pass.
5. Run the check that proves the fix, plus build, tsc and lint compared with the lint baseline in CLAUDE.md. Report the actual output.
6. Write the commit message from the template (What, Why, Checks with verdict plus number). Add one line to findings.md (finding resolved, under Archive) and one line to progress.md. Stage exactly those paths with git add <paths>; never git add -A.
7. Write the review packet (Quick form) to .claude/state/review-packet.md and show it. Never record a verdict or edit .claude/state/review.json.
8. Finish with the summary from templates.md (target ≤ 5 lines: done, result, what I do). Next: I run /sdd-review; the commit uses `git commit -m` with the message above, only after an approved verdict (commit gate, hard rule).
