# Decisions (project-wide)

Project-wide decisions only. Decisions for a single change live in that change's folder: `docs/changes/<name>/decisions.md` (Change 01: `docs/changes/security-patch/decisions.md`). IDs are one sequence across all decisions.md files: check them all for the next free number (D10).

D1: Use a separate Supabase project for development. .env = development, .env.production.local = production (used only through dev:prod).
Why: the production database powers the public demo. Experiments, migrations and test data must not touch it.
Trade-off: a second database that has to be kept in sync by running migrations on both.

D5: Working documents live in docs/ inside the repo, committed. The learning log stays outside the repo.
Why: the change protocol commits docs with code, and visible specs and decisions show the process to recruiters.
Trade-off: the planning documents are public, so they must never contain secrets or private notes.
Affects: CLAUDE.md (working documents section), all future changes.
→ Decision log location refined by D10.

D10: Split the decision log. Project-wide decisions stay in docs/decisions.md; decisions for one change live in docs/changes/<name>/decisions.md. IDs stay one sequence across all files and are never renumbered.
Refines: D5 (where working documents live).
Why: most decisions so far (D2–D4, D6–D9) only concern Change 01. Keeping them next to the change's spec makes each change self-contained and keeps the project-wide log short.
Trade-off: finding the next free ID means checking every decisions.md, and references across files need the file location.
Affects: CLAUDE.md (working documents, change protocol), docs/decisions.md, docs/changes/security-patch/ (new decisions.md; spec.md references), findings.md, progress.md. D2–D4 and D6–D9 moved to docs/changes/security-patch/decisions.md unchanged.
