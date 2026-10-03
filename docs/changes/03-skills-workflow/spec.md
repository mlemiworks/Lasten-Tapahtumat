# C03: Workflow as Claude Code skills and a commit gate
Tier: Light · Status: done · Decisions: D12, D13

## Context
Guide v2 splits work between chat (plans, reviews) and Claude Code (writes, runs).
Copying between them was the main friction in C01 and C02 (process notes). C03 moves
the workflow into the repo: procedures become project skills, a hook enforces review
before commit, and chat leaves the loop (D12). Developer workflow only. Implements F14.

## Current behavior
No .claude/ in the repo. Sessions start in the parent Eventsforkids/, whose
.claude/settings.local.json holds five allow rules; the repo CLAUDE.md loads only lazily.
Procedures live in CLAUDE.md and project guide v2 (outside the repo).

## Scope
In:
- Six user-invoked skills (disable-model-invocation: true) in .claude/skills/: sdd-start
  (intake, spec, baseline), sdd-design (Standard/Heavy), sdd-step, sdd-review (context: fork,
  general-purpose agent, background: false, model: opus), sdd-validate, sdd-close (also
  refreshes codebase-map.md, must-not-change.md, CLAUDE.md when stale). Templates in sdd-start/templates.md.
- .claude/hooks/review-gate.mjs (Node, exec form). `approve`/`reject` write .claude/state/review.json
  with the hash of git diff --cached. As a PreToolUse hook on every Bash call it blocks git commit
  without a matching approved verdict, any commit option other than -m/-F/-q/-s, and
  `approve`/`reject` outside a subagent. Internal errors on a commit block (exit 2).
- .claude/settings.json: the hook; ask rules for git commit; deny Edit(.claude/state/review.json).
- .claude/settings.local.json (gitignored): the five allow rules from ../.claude/.
- .gitignore: .claude/settings.local.json, .claude/state/.
- CLAUDE.md: facts and hard rules stay; procedures (change protocol, packet format) move to
  skills; add "start sessions in eventsforkids/"; current change: 03-skills-workflow.
- docs/workflow.md (≤ 60 lines): phases, skills, gate, tiers, EARS. Successor to guide v2.
- D12 in docs/decisions.md.
Assumptions (intake defaults, unanswered): sdd- prefix (the bundled /review alias and /verify
collide); three-layer gate; repo is the method's source of truth; EARS for behavior criteria
from C04; C03 itself reviewed by chat under v2, one handoff.
Out:
- F15 and error pages: the change after C03
- Rewriting C01/C02 docs to EARS: closed records
- Gating git merge and commits I run myself: the gate targets the agent; I am the human gate
- Plugins, MCP, agent teams: not needed for one developer

## Must not change
- docs/must-not-change.md (content and items)
- src/, prisma/, public/, .github/, package files, next.config.ts
- Text of D1–D11; contents of docs/changes/01-*/ and 02-*/

## Risks
1. Hook fails open (bad path, crash, wrong exit code) → A3–A6 break-it tests
2. Session started in the parent loads nothing → A2; sdd-start checks the working directory
3. Implementer forges a verdict → A6; deny rule; the ask prompt keeps me as the final gate
4. A hard rule is lost from CLAUDE.md → A9
5. Windows line endings change the hash → one script computes it for approve and check

## Acceptance
| # | Criterion | How verified | Before | After | Notes |
|---|---|---|---|---|---|
| A1 | Six .claude/skills/sdd-*/SKILL.md exist, each with disable-model-invocation: true; frontmatter parses | grep; claude plugin validate .claude/skills | Fail: does not exist (no .claude/ in repo) | Pass: grep -L → no output, 6 SKILL.md files; plugin validate → ✔ Validation passed | |
| A2 | When a session starts in eventsforkids/, the / menu lists the six sdd- skills and /hooks shows the gate | Manual | Fail: does not exist (no .claude/ in repo) | Pass: / lists the six sdd- skills; /hooks shows PreToolUse → review-gate.mjs | Checked by me |
| A3 | When Claude runs git commit with no verdict, the hook shall block it with a reason | Manual: stage a test line, ask Claude to commit | Fail: does not exist (no hook; only the ask rule in ../.claude/) | Pass: blocked, "Commit gate: no review verdict. Run /sdd-review on the staged diff first." | |
| A4 | If the staged diff changes after approval, then the hook shall block the commit | Manual: approve, stage one more line, ask to commit | Fail: does not exist | Pass: blocked, "Commit gate: the staged diff changed after review C03-T1. Run /sdd-review again." | Precheck: with a matching verdict, the commit reached the ask prompt (answered No) |
| A5 | If the commit uses -a, --all, --amend or paths, then the hook shall block it | Manual | Fail: does not exist | Pass: `git commit -am test` blocked, "Commit gate: "-am" is not allowed." | Only -am tested; --all, --amend and paths not tried |
| A6 | If the main session runs `review-gate.mjs approve` or edits .claude/state/review.json, then it shall be blocked; /sdd-review shall write the verdict | Manual | Fail: does not exist | Pass: `approve C03-T1` blocked, "Commit gate: only /sdd-review (a forked subagent) may record a verdict."; Write tool on review.json denied by permission settings | Shell write to review.json not tested. /sdd-review writing the verdict: S4 |
| A7 | When an approved verdict matches the staged diff, Claude Code shall ask me, and the commit succeeds | The C03 commit itself (S5) | Fail: does not exist (ask prompt only, from ../.claude/) | Pass: approved verdict C03-S4 (hash 9e8ed5100126); git commit -m reached the ask prompt and succeeded as 7dec41f | |
| A8 | /sdd-review returns its report in the same turn and lists the files it read | Manual, S4 | Fail: does not exist | Pass: five /sdd-review runs in S4, each returned its report in the same turn with a "Files read" list | Runs 1–3 rejected, 4–5 approved (D13 between 3 and 4) |
| A9 | CLAUDE.md keeps every current hard rule; each moved procedure is listed in the packet | git diff portfolio -- CLAUDE.md | No diff; 13 working rules + 5-step change protocol | Pass: 14 working rules (13 kept, 2 of them reworded, 1 added); change protocol and packet format moved, listed in the S4 packet | Reworded: stop-and-ask (adds documents-first), commit rule (now the gate) |
| A10 | docs/workflow.md ≤ 60 lines; D12 appended; D1–D11 unchanged | wc -l; git diff portfolio -- docs/decisions.md shows only + lines | Fail: docs/workflow.md does not exist; decisions.md has D1, D5, D10, D11; no diff | Pass: 50 lines; decisions.md diff: 12 + lines (blank + D12, blank + D13), no - lines | |
| A11 | Changes only in allowed paths | git diff --stat portfolio; allowed: .claude/**, docs/**, CLAUDE.md, .gitignore | No diff | Pass: staged files only in .claude/**, docs/**, CLAUDE.md, .gitignore | |
| A12 | .claude/settings.local.json and .claude/state/ gitignored; ../.claude/ gone | git check-ignore -v; ls .. (after S5) | Fail: check-ignore exit 1 (neither ignored); ../.claude/ exists | Pass: check-ignore → .gitignore:54 settings.local.json, .gitignore:55 .claude/state/; ls .. → only eventsforkids | ../.claude/ deleted by me after 7dec41f |

## Notes
- S2 first half: git check-ignore -v → .gitignore:54 .claude/settings.local.json; .gitignore:55 .claude/state/ (exit 0). ../.claude/ still exists (deleted in S5)
- S2: git status --short → .gitignore, CLAUDE.md, docs/decisions.md, docs/progress.md (M); .claude/, docs/changes/03-skills-workflow/, docs/workflow.md (??); all allowed
- S2: wc -l docs/workflow.md → 50; git diff portfolio -- docs/decisions.md → 6 + lines (blank + D12), no - lines
- S2 unit: `review-gate.mjs approve C03-T1` without agent_id → exit 2; with agent_id → exit 0
- S2 unit: `git commit -am test` → exit 2 ("-am" not allowed); `git -C . commit --amend -m x` → exit 2 ("--amend" not allowed)
- S2 unit (hook via stdin, nothing staged): `git commit -m test` → exit 2 "nothing is staged"; `npm run build && git commit -m x` → exit 2; `echo "git commit"`, `git log --oneline`, `npm run build` → exit 0
- S2: grep -L → no output (all six have it); claude plugin validate .claude/skills → ✔ Validation passed (CLI 2.1.288)

## Plan
S1: Branch chore/03-skills-workflow from portfolio; write this spec; fill Before.
S2: Write the Scope In files exactly as given in the handoff. Append D12. Update progress.md.
S3: I restart Claude Code in eventsforkids/ (a new top-level .claude/ needs a new session),
    then run A2–A6 manually. Claude Code fills After; test changes are removed.
S4: Claude Code stages C03 and writes .claude/state/review-packet.md. I run /sdd-review
    (dogfood) and upload the packet and the report to chat (no terminal cut-offs).
S5: After chat approves: commit "chore(C03): move workflow to skills and commit gate" through
    the gate (A7). Merge into portfolio, push. No Render deploy: no runtime files.
    Delete ../.claude/; fill A12.
S6: Close with /sdd-close (first use). I replace guide v2 in project knowledge with docs/workflow.md.

## Rollback
git revert the merge on portfolio. The repo-local settings file keeps the allow rules.

## Why
- Repo is the method's source of truth. Rejected: guide in chat knowledge; drifts once chat leaves.
- Gate = hash-matched verdict + ask prompt. Rejected: hook alone (forgeable), prompt alone (no review proof).
- Node hook on every Bash call. Rejected: bash+jq (not on Windows Git Bash) and `if` filters (best-effort; miss `git -C . commit`).
- Sessions start in the repo. Rejected: .claude/ in the parent; uncommitted, invisible to the repo.
