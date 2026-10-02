D1: Use a separate Supabase project for development. .env = development, .env.production.local = production (used only through dev:prod).
Why: the production database powers the public demo. Experiments, migrations and test data must not touch it.
Trade-off: a second database that has to be kept in sync by running migrations on both.

D2: Change 1 (security patch) skips separate design and plan documents; the plan lives in the spec. Why: no code or design changes, and the vulnerability is in a public demo. Trade-off: less review before implementation, compensated by the baseline run and the A1–A12 checks.

D3: Change A3's lint criterion from "lint passes" to "lint problem count is not higher than the baseline", measured with npx eslint . --ignore-pattern "src/generated/\*\*".
Supersedes: "lint passes" in A3 of the Change 01 spec.
Why: the baseline showed 3,021 lint problems that existed before the upgrade. "Lint passes" couldn't be met and wasn't what this change is about.
Trade-off: existing lint problems stay for now; they move to the cleanup change in findings.md.
Affects: Change 01 spec, A3.

D4: Upgrade next and eslint-config-next to the latest 16.3.x instead of 16.0.x.
Supersedes: the scope line "within 16.0.x" in the Change 01 spec.
Why: critical advisories have no fix in the 16.0 line; the minimum fixed version is 16.3.6.
Trade-off: a minor-version jump with more behavior change; covered by the baseline comparison.
Affects: spec scope, A1, plan step 5.
→ Why and minimum version superseded by D8.

D5: Working documents live in docs/ inside the repo, committed. The learning log stays outside the repo.
Why: the change protocol commits docs with code, and visible specs and decisions show the process to recruiters.
Trade-off: the planning documents are public, so they must never contain secrets or private notes.
Affects: CLAUDE.md (working documents section), all future changes.

D6: Set `agentRules: false` in next.config.ts as part of Change 01.
Supersedes: "Any code changes" in the Change 01 spec's Out list (for this one config line).
Why: next 16.3.x (D4) makes `next dev` auto-generate AGENTS.md and CLAUDE.md in the repo root on every run. The generated CLAUDE.md would load alongside the project's own CLAUDE.md, and the files would keep reappearing as untracked changes.
Trade-off: a config change in a change that was meant to be package-only; agents don't get Next's version-matched docs pointer (node_modules/next/dist/docs/).
Affects: Change 01 spec scope, next.config.ts, findings.md.

D7: Change 01's step 7 commit includes docs/, .gitignore and next.config.ts, not only package.json and package-lock.json.
Supersedes: "Commit package.json and package-lock.json only" in plan step 7 of the Change 01 spec.
Why: CLAUDE.md and D5 commit docs together with code; D6 added a config change; .gitignore keeps docs/process-notes.md out of the public repo.
Trade-off: the security-patch commit is less minimal; reverting it also reverts the docs and the agentRules line.
Affects: Change 01 spec, plan step 7 (already done in 6a03331; no rework needed).

D8: Raise the next minimum to 16.3.8 and correct D4's reasoning.
Supersedes: D4's "Why" and its minimum version (16.3.6). D4's decision to move from 16.0 to 16.3.x still stands.
Why: Checked against the vendor's advisories (D4 relied on a search result):
- August 25 release, fixed in 16.3.3: two critical advisories (GHSA-2xp9-vwfh-vxw4, GHSA-p293-qw3h-jr36) affect 16.0.8 and have no 16.0.x fix. This is why the upgrade had to leave the 16.0 line.
- September 22, GHSA-vcvr-r3jv-pc5j (critical, RCE in next/og Node.js ImageResponse): affects >=16.2.0 <16.3.6. It never affected 16.0.8, but it rules out stopping at 16.3.3–16.3.5.
- September 30 release, fixed in 16.3.8: one high, five medium and one low advisory in 16.x. This makes 16.3.8 the lowest version with no known advisories.
Sources: nextjs.org/blog (August and September 2026 security releases, September 22 security update).
Trade-off: A1 now requires the latest patch release. A regression in 16.3.8 can't be solved by stepping back to 16.3.6 or 16.3.7 without a new decision, and future security releases will raise the bar again.
Affects: spec Context (new paragraph on these advisories), A1 (>= 16.3.8), spec Status line (add D8), D4 (mark as partly superseded). No rework: 16.3.8 is already installed, and A1 and A2 still pass.
