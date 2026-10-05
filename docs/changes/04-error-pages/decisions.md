# C04 decisions

D14: C04's characterization safety net is the manual S1 baseline, not automated tests.
     Supersedes: workflow.md Standard tier "first step adds characterization tests" (C04 only).
     Why: no test setup on this branch (F4); adding one would be a change of its own.
     Trade-off: A1–A6 are rerun by hand, and the error pages can regress unnoticed (Risk 5).
     Affects: spec (Decisions header, Plan S1), design As-is.
