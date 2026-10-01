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

D5: Working documents live in docs/ inside the repo, committed. The learning log stays outside the repo.
Why: the change protocol commits docs with code, and visible specs and decisions show the process to recruiters.
Trade-off: the planning documents are public, so they must never contain secrets or private notes.
Affects: CLAUDE.md (working documents section), all future changes.

D6: Set `agentRules: false` in next.config.ts as part of Change 01.
Supersedes: "Any code changes" in the Change 01 spec's Out list (for this one config line).
Why: next 16.3.x (D4) makes `next dev` auto-generate AGENTS.md and CLAUDE.md in the repo root on every run. The generated CLAUDE.md would load alongside the project's own CLAUDE.md, and the files would keep reappearing as untracked changes.
Trade-off: a config change in a change that was meant to be package-only; agents don't get Next's version-matched docs pointer (node_modules/next/dist/docs/).
Affects: Change 01 spec scope, next.config.ts, findings.md.
