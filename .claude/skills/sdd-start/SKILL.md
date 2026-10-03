---
name: sdd-start
description: Start a spec-driven change - intake, tier, questions, spec draft, branch and baseline.
argument-hint: "[F# or change request]"
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git log *)
---
# Start a change: $ARGUMENTS

Rules: ${CLAUDE_PROJECT_DIR}/docs/workflow.md. Templates: ${CLAUDE_PROJECT_DIR}/.claude/skills/sdd-start/templates.md.

## Repository state
!`git status --short --branch`
!`git log --oneline -5`

1. The working directory must be the repo root (eventsforkids/) and the tree clean. If not, stop and say why.
2. Read CLAUDE.md, docs/workflow.md, docs/progress.md, docs/must-not-change.md, docs/findings.md, docs/open-questions.md, docs/decisions.md and docs/codebase-map.md. If $ARGUMENTS names an F#, read that finding.
3. State in at most 3 lines: the change, its C number and slug, the tier and the trigger that sets it.
4. Read the code the change touches. Ask me only what the code and docs can't answer: at most 5 numbered questions, each with a default and a one-line reason. Wait. Unanswered questions take the default and go into the spec as assumptions. A question only someone else can answer goes to open-questions.md (next Q#) with that person's role.
5. Draft spec.md from the template within the tier's limits. Show it in full and wait for "ok" or corrections.
6. After approval: create branch <type>/<NN>-<slug> from portfolio, write docs/changes/<NN>-<slug>/spec.md, and set the current change in CLAUDE.md.
7. Baseline: run every criterion you can run and fill Before with actual results, including what already fails. Give me the manual criteria as a checklist, then fill Before from my results.
8. Add the change to docs/progress.md. Stop. Next: /sdd-design (Standard, Heavy) or /sdd-step (Light).
