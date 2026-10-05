# C05 plan

S1: spec and baseline (done)
Do:     branch from portfolio, spec, Before filled.
Commit: carried by the S2 commit (as in C04).

S2: harness, guard and characterization tests
Do:     npm i -D --save-exact @playwright/test (latest 1.x); npx playwright install chromium
        if its build is missing. Add test:e2e, playwright.config.ts,
        playwright.db-error.config.ts, tests/e2e/env.ts, reset.setup.ts, helpers.ts,
        characterization.spec.ts, api-reset.spec.ts, db-error/error-pages.spec.ts per design.
        Characterization tests use roles and text only, against unchanged src/.
Don't:  any src/ file (S3 adds testids); next.config.ts; package.json beyond the dependency
        and script; .env.production.local (never opened); `npm run dev` or dev:prod;
        reuseExistingServer true. If Next's dev overlay covers the retry button, the dev
        lock doesn't release between the two runs, or the setup can't run before the tests:
        stop and ask.
Verify: npm run test:e2e → exit 0 (A2, A10, A11 pass; if auto mode blocks the
        /api/reset call, I run `! npm run test:e2e`).
        A3: (a) dummy node http server on 3100 that logs every request, then test:e2e →
        exits non-zero before setup, dummy logged nothing; (b) DATABASE_URL set in the shell
        to postgresql://x:x@127.0.0.1:1/x → guard error, no server started.
        A13: build, tsc, eslint ≤ 3022. A14: git diff portfolio --stat -- src → empty.
Commit: test(C05-S2): add Playwright harness, DB guard and characterization tests

S3: data-testids and regression tests
Do:     add the design's testids to the 9 src/ files listed; add browse (ported from
        portfolio-tests: rewritten selectors, no 3-browser config, no example spec, no seed
        log), event-details, event-crud, register, permissions and admin specs. Each test
        deletes the events it creates. Admin tests read E2E_ADMIN_PASSWORD from .env.
Don't:  any src/ change other than data-testid attributes; characterization.spec.ts and the
        S2 specs (they must pass unchanged: Risk 4); merge portfolio-tests; F21 or anything
        else the tests reveal (findings.md instead).
Verify: npm run test:e2e → exit 0, characterization tests still pass (A4–A9, A14).
        A14: git diff portfolio -- src read line by line: only added data-testid
        attributes; git diff portfolio --stat -- docs/must-not-change.md
        .github/workflows/reset.yml src/app/api/reset/route.ts → empty. A13 as in S2.
Commit: test(C05-S3): add data-testids and C01 regression tests

S4: docs, token cleanup, final runs
Do:     CLAUDE.md Commands (test:e2e) and Testing (what the suite covers, that it wipes the
        dev DB, that it needs my dev server stopped, never with .env.production.local values;
        E2E_ADMIN_PASSWORD in .env). After I confirm: delete .env.test.local,
        playwright-report/ and test-results/; close Q3. findings.md: F4 and F11 resolved;
        new finding for CI (repo secrets next to reset.yml). Ask me before deleting
        portfolio-tests.
Don't:  production RESET_TOKEN or the GitHub secrets; reset.yml; dev:prod; any src/ change.
Verify: A1: npm run test:e2e three times in a row, all exit 0. A12: sha256 of RESET_TOKEN
        in .env vs .env.production.local differ (hashes compared, no values printed);
        no file other than .env.production.local holds the production token's hash;
        live POST /api/reset with the dev token → 401 (Claude, after my go-ahead).
        A15: read CLAUDE.md. A13, A14 as in S3. Then /sdd-validate.
Commit: docs(C05-S4): document the e2e suite and close Q3

After S4: I fast-forward portfolio and deploy when I choose (testids only change markup);
/sdd-close.
