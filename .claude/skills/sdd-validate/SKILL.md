---
name: sdd-validate
description: Rerun every acceptance criterion after implementation and compare the results with the baseline.
disable-model-invocation: true
model: sonnet
---
# Validate the current change

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Packet template: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

Light changes validate inside the last step's Verify; use this skill for Standard and Heavy, or when a Light change wants a separate pass.

1. Read the current change's spec.md and decisions.md.
2. Rerun every automated criterion. Fill After with a verdict plus a number (detail to a finding or the commit message).
3. Give me the manual criteria as a checklist. Wait, then fill them in from my results.
4. Compare After with Before. Each difference either matches or beats the baseline, or needs a decision: draft one (target ~6 lines). Never reword a criterion to fit a result.
5. Update docs/progress.md, stage the docs, and write a review packet to .claude/state/review-packet.md.
6. Finish with the summary from templates.md (target ≤ 5 lines: done, result, what I do). Next: /sdd-review, then deploy per the spec's plan.
