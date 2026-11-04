---
name: sdd-design
description: Draft design.md and plan.md for a Standard or Heavy change.
disable-model-invocation: true
model: opus
---
# Design the current change

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Templates: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md. Sizes are targets (workflow.md).

1. Read the current change's spec.md and decisions.md (CLAUDE.md names the change). If the tier is Light or Quick, stop: they have no design.
2. As-is: for each file or area the spec touches, record what it does, who calls it, what data it reads and writes, which tests cover it, and what you couldn't determine. Heavy: this is design.md's As-is section. Standard: target 10 lines in the spec's Current behavior.
3. Draft design.md, plus plan.md for Heavy (or for Standard when the plan doesn't fit in the spec), near the tier's size targets. Every criterion traces to a design section and a step. Every step uses the plan-step format. Standard and Heavy: the first step adds characterization tests for the behavior being changed.
4. Show the drafts in full and wait for "ok" or corrections. Then write them to the change folder and update docs/progress.md.
5. Finish with the summary from templates.md (target ≤ 5 lines: done, result, what I do). Next: /sdd-step S1.
