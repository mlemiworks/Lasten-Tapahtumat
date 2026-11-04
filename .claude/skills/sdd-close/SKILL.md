---
name: sdd-close
description: Close the current change - progress, findings, open questions, living docs and process review.
disable-model-invocation: true
model: sonnet
---
# Close the current change

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Packet template: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

Light changes close in their last step's commit; use this skill for Standard and Heavy, or when a Light change closes separately.

1. Read the current change's documents, docs/progress.md, docs/findings.md and docs/open-questions.md.
2. Every criterion's After must be filled and the deploy (if any) recorded. If not, stop and list what's missing.
3. Mark the change done in progress.md with its merge commit and update the current-state block. Add new findings (next F#, one line with size and value) and open questions (next Q#). Move findings this change resolved under Archive.
4. Living docs: compare the change's merged diff with docs/codebase-map.md, docs/must-not-change.md and CLAUDE.md. Propose edits for anything now stale, as a diff with one reason each. Editing must-not-change.md is a decision: draft it. Apply only after my ok.
5. Set the current change in CLAUDE.md to none.
6. Offer the three process questions from docs/workflow.md in one short message; they are optional. Append my answers to docs/process-notes.md under the change ID; unanswered ones are recorded as "no answer". If this is the third closed change since the last process edit, propose edits to docs/workflow.md, CLAUDE.md and the skills.
7. Stage the docs and write a review packet to .claude/state/review-packet.md.
8. Finish with the summary from templates.md (target ≤ 5 lines: done, result, what I do). Next: /sdd-review, then I approve the commit.
