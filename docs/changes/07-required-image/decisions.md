# C07 decisions

D15: The C05 suite is C07's safety net; no characterization step is added.
     Supersedes: workflow.md "Standard: + characterization tests" for C07.
     Why: the only behaviors that change (placehold.co default, PUT keeping the old imgUrl, form saving without an image) are what C07 removes; tests pinning them would be deleted in S2. The baseline probe measured them (A1, A3, A6 Before).
     Trade-off: no permanent test of the old behavior; the probe spec was deleted after the run.
     Affects: spec Assumptions (safety net), design Plan (starts at S2).
