---
name: sdd-validate
description: Rerun every acceptance criterion after implementation and compare the results with the baseline.
disable-model-invocation: true
---
# Validate the current change

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Packet template: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

0. Model check: say which model you are running as. This skill expects Sonnet. On another model, stop and tell me to run `/model sonnet` and invoke /sdd-validate again.
1. Read the current change's spec.md and decisions.md.
2. Rerun every automated criterion. Fill After with actual results (output tail in Notes where useful).
3. Give me the manual criteria as a checklist. Wait, then fill them in from my results.
4. Compare After with Before. Each difference either matches or beats the baseline, or needs a decision: draft one (≤ 6 lines). Never reword a criterion to fit a result.
5. Update docs/progress.md, stage the docs, and write a review packet to .claude/state/review-packet.md. Stop. Next: /sdd-review, then deploy per the spec's plan.
