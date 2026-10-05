---
name: sdd-step
description: Implement one plan step of the current change, then stage it and write a review packet.
argument-hint: "[S#]"
disable-model-invocation: true
---
# Implement step $ARGUMENTS

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Packet template: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

0. Model check: say which model you are running as. This skill expects Sonnet (Opus is fine for a hard bug: say so first). On another model, stop and tell me to run `/model sonnet` and invoke /sdd-step again.
1. Read CLAUDE.md, the current change's spec.md, decisions.md, design.md and plan.md if present, and docs/progress.md. Find step $ARGUMENTS, or the next undone step if none is given.
2. Describe your approach in at most 10 lines: files you'll change, callers you'll check, how you'll verify. Wait for my go.
3. Implement within the step's Do and Don't. Small local choices: decide, and note them in the packet.
4. If anything requires leaving Do/Don't, touching a must-not-change item, or changing the spec, design or plan: stop and make no code change for it. Report it as a deviation and classify it (decision, finding, progress note). For a decision, draft the entry and the exact document edits, spec first, then design, then plan, each tagged with the D#. Apply them only after I approve; add rework steps if done steps are affected.
5. Run the step's Verify and the full existing check set (build, tsc, lint compared with the spec's baseline). Fill the result columns this step covers.
6. Update docs/progress.md. Stage exactly the step's files, docs included, with git add <paths>; never git add -A.
7. Write the review packet to .claude/state/review-packet.md and show it. Stop. Next: I run /sdd-review.
