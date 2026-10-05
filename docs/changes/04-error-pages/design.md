# C04 design

## As-is

(Standard: summary in the spec's Current behavior; extra facts checked against code here.)

- src/app/layout.tsx: root layout, server component. Wraps every page in Providers
  (SessionProvider), Header (client), <main>, Footer (server). No error boundary anywhere.
- src/app/loading.tsx: root Suspense fallback. It streams first, so a failing page still
  returns HTTP 200 with header and footer, and the error replaces the content afterwards.
- Pages that read the DB at render time (all through dataFetching.ts): page.tsx,
  [event]/page.tsx, [event]/edit/page.tsx, dashboard/page.tsx, admin/page.tsx.
  A failed query throws during render, and Next shows its built-in page.
- src/lib/prisma.ts: singleton; PrismaPg({ connectionString }). The pg pool has no
  connectionTimeoutMillis, so an unreachable host waits for the OS TCP timeout (~22 s on Windows).
- Next 16.3.8 error boundaries receive `error` plus `retry()` (re-fetches server data
  and re-renders) and `reset()` (re-renders only, no re-fetch). Checked in
  node_modules/next/dist/docs/.../error.md and error-boundary.d.ts.
- Tests: none on this branch (F4). The safety net is the manual S1 baseline (D14).

## To-be

Added: src/app/error.tsx ('use client')

- Renders inside the root layout's <main>, so the header and footer stay (A1, A2).
- Text: heading "Jokin meni pieleen"; body "Sivua ei saatu juuri nyt ladattua.
  Yritä hetken päästä uudelleen." This does not name the database (Risk 3).
- Button "Yritä uudelleen" calls retry(), not reset(): reset would re-render the
  cached server error (Risk 4, A5).
- next/link "Etusivulle" to "/".
- Ignores `error` entirely: no message, digest or stack rendered, and no console.error.
  Next logs the original server error on the server by itself (A4).
- Styling: existing tokens (bg-bg, text-ink, text-ink-soft, bg-primary text-primary-ink);
  data-testid: error-page, error-retry, error-home-link (CLAUDE.md testing rule).
  Added: src/app/global-error.tsx ('use client')
- Replaces the root layout when the layout itself throws (A6). Own
  <html lang="fi"><body>, React <title>Virhe – Lasten tapahtumat</title>.
- Imports ./globals.css (global-error gets no global styles otherwise). No next/font:
  the font CSS variables fall back to the stack in globals.css. No Header or Footer,
  because they belong to the layout that failed.
- Same text and button (retry); the home link uses a plain `/` href, so a broken
  client router is not needed to get there.
  Changed: src/lib/prisma.ts
- PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }). It covers only acquiring
  a new pool connection; it is not a query or statement timeout (Risk 2, A10).
- Comment (why): pg has no connect timeout by default, so an unreachable host hangs
  until the OS gives up.
  Unchanged: dataFetching.ts, every page and API route, loading.tsx, layout.tsx,
  middleware, must-not-change files.

## Data

None. No schema, migration or data change.

## Trace

| A#           | Design section                                    | Step |
| ------------ | ------------------------------------------------- | ---- |
| A1, A2       | To-be: error.tsx                                  | S2   |
| A3           | To-be: prisma.ts                                  | S2   |
| A4           | To-be: error.tsx (no client logging; server logs) | S2   |
| A5           | To-be: error.tsx retry()                          | S2   |
| A6           | To-be: global-error.tsx                           | S2   |
| A7, A8, A12  | To-be (all); Unchanged                            | S2   |
| A9, A10, A11 | To-be: prisma.ts (connect only); Unchanged        | S2   |
| A13          | To-be: prisma.ts (5 s margin on Render)           | S3   |

## Why

retry() is Next 16's re-fetching recovery, so A5 needs no router.refresh() workaround.
One root error.tsx covers every route with the layout kept. global-error.tsx is only
the last resort. The pg pool option is the narrowest timeout. Rejected: a Prisma or
pg statement_timeout, because it limits queries (Risk 2) instead of the measured connect hang.
