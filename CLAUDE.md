# CLAUDE.md

Guidance for Claude Code when working in this repository (Lasten tapahtumat, a Next.js portfolio project).

## Working documents

All in `docs/` (see decisions D5, D11, D12):

- `docs/workflow.md`: the method: phases, skills, commit gate, rigor tiers, criteria format, decision threshold, naming.
- `docs/changes/<NN-slug>/`: spec.md (and design.md and plan.md when present) and decisions.md for one change. **The current change is: none.**
- Decision logs (D10). IDs are one sequence across all files: check every decisions.md for the next free number. Append only; mark superseded entries, never delete them.
  - `docs/decisions.md`: project-wide decisions (D1, D5, D10, ...).
  - `docs/changes/<NN-slug>/decisions.md`: decisions for that change only (C01: `docs/changes/01-security-patch/decisions.md`, D2–D4, D6–D9).
- `docs/progress.md`: what's done and what's next.
- `docs/codebase-map.md`: architecture overview.
- `docs/must-not-change.md`: the project-wide "Must not change" list.
- `docs/findings.md`: backlog of known issues. Do **not** fix these unless the current change's spec includes them.
- `docs/open-questions.md`

Procedures are project skills in `.claude/skills/`, invoked only by me: `/sdd-start`, `/sdd-design`, `/sdd-step`, `/sdd-review`, `/sdd-validate`, `/sdd-close`. Templates, including the review packet: `.claude/skills/sdd-start/templates.md`.

ID prefixes: C change, D decision (global), F finding, Q open question, A criterion and S step (A and S are local to a change; outside it write C01-A3).

Read the current change's spec.md and decisions.md, the project-wide `docs/decisions.md` and `docs/progress.md` before starting any work.

decisions.md = a choice we made, with reason and trade-off
findings.md = something observed but not acted on (backlog)
open-questions = something only a person can answer

## Working rules

- Never edit an existing migration file; add a new one.
- Sessions start in `eventsforkids/` (the repo root). From the parent folder, the skills and the commit gate don't load.
- Follow the current change's plan step by step; stay within each step's Do and Don't.
- Don't modify code outside the current step's scope. Don't "clean up" unrelated code, even if it looks wrong. Note it for findings.md instead.
- Small, local choices within the current step (naming, formatting, internal structure): decide, and state the choice in your summary.
- Anything that would deviate from the plan, touch a Don't item, change a must-not-change item, or require changing the spec or design: **stop and ask**. Documents change first, code follows; spec, design and plan edits apply only after I approve them.
- Never modify existing tests to make them pass. If a test seems wrong, stop and explain.
- Never run `npm audit fix --force`. Upgrade only the packages the current step names.
- Before marking a step done, run the checks the step's Verify section lists and report the actual output.
- Update docs/progress.md at the end of each step. Commit docs and code together.
- Never print, log or commit secrets or `.env` values.
- Never commit without an approved `/sdd-review` verdict for the exact staged diff; `.claude/hooks/review-gate.mjs` enforces it. Stage paths explicitly (never `git add -A`) and commit only with `git commit -m` or `-F`: no `-a`, `--amend` or paths. Never record a verdict yourself or edit `.claude/state/review.json`.
- Fill baseline and results tables, progress.md and findings.md yourself. Append decisions only after I approve them.
- Write a decision only when scope, an acceptance criterion, a must-not-change item, the tier or the approach changes. Otherwise add one line to progress.md.

## Commands

All commands run from the `eventsforkids/` directory (the git repo).

```bash
npm run dev          # Dev server at localhost:3000, uses .env (development database)
npm run build        # Production build
npm run lint         # ESLint (see the lint note below)
npx tsc --noEmit     # Type check
npx prisma migrate deploy   # Apply existing migrations (uses DIRECT_URL from .env)
npx prisma db seed          # Seed the database in .env
```

- **Lint:** the config currently also lints non-source folders. To compare with the baseline, use `npx eslint . --ignore-pattern "src/generated/**"` (baseline: see the current change's spec).
- **Do not use `npm run dev:prod`**. It connects the local app to the **production** database.
- New migrations: `npx prisma migrate dev --name <description>`, only when a plan step says so.
- Package manager: npm. Next.js and React are pinned to exact versions; install upgrades with `--save-exact`.

## Environment

- `.env`: development database and keys (Next.js `next dev` and the Prisma CLI both read it).
- `.env.production.local`: production. Only used through `dev:prod`. Never use it for testing.
- Runtime variables: `DATABASE_URL` (transaction pooler, port 6543), `DIRECT_URL` (session pooler, port 5432, Prisma CLI only), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, used in `/api/upload-image`, never in client code, never with a `NEXT_PUBLIC_` prefix), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESET_TOKEN`.
- `/api/reset` wipes and reseeds **whichever database the running app uses**.

---

## Architecture

**Next.js 16 App Router.** Server components are the default; client components (`'use client'`) are used where interactivity is needed. Data fetching in server components happens via `async/await` at render time, not `useEffect`.

**Server/client split pattern**: a server component fetches data and passes it as props to a `'use client'` child for interactivity. Used on: home (HomeBrowser), admin (AdminClient), edit (EditEventClient).

See `docs/codebase-map.md` for routes, API routes and data flow.

## Database (Prisma 7: breaking changes from v6)

- `PrismaClient` is imported from `'../generated/prisma'` (relative path), NOT `'@prisma/client'`.
- Connection URLs live in `prisma.config.ts`, NOT in `schema.prisma`.
- A driver adapter (`PrismaPg`) is required; see `src/lib/prisma.ts`.
- Singleton client lives in `src/lib/prisma.ts`.
- DB access goes through `src/lib/dataFetching.ts`. Known exceptions: `app/api/reset/route.ts` and `prisma/seed.ts`. Don't add new ones.
- `Event` and `User` types come from Prisma: import from `'@/src/lib/dataFetching'`, NOT from `'@/src/types/types'`.
- Event/User IDs are `string` (cuid). Never use `parseInt()` on them.
- `CATEGORY_BY_KEY[event.category as Category]`: the cast is needed because Prisma types category as `string`.
- Run `npx prisma generate` after schema changes.

## Maps (Leaflet + OpenStreetMap)

- Leaflet accesses `window` on import: always use `dynamic(() => import('...'), { ssr: false })`, called from a `'use client'` component, not a server component.
- Leaflet's default marker icon is broken in webpack/Next.js: construct it manually with CDN URLs (`unpkg.com/leaflet@1.9.4/dist/images/...`).
- To re-center a `<MapContainer>` after mount, render a child component that calls `useMap().setView()`. The `center` prop is initial-only.
- `lat` and `lng` are `Float? | null` on `Event`. Always guard with `event.lat != null && event.lng != null` before rendering a map.

## Gotchas

- `price` is stored as `string | null`. Values seen: `"5"`, `"0"`, `"5€"`, `"Vapaa pääsy"`, `null`.
- Dates and times are stored as strings (date `YYYY-MM-DD`).
- `location` = venue name; `city` = city name. Separate fields.
- `Event.createdBy` references `User.email` (not id). Seeded events have no `createdBy`.
- `imgUrl`: values starting with `http://`, `https://` or `/testImages` render as `<img>`; everything else is treated as an `IllustrationId`.
- Valid illustration IDs: `music`, `sirkus`, `taide`, `luonto`, `teatteri`, `liikunta`, `savi`, `piano`, `vesi`.
- Admin = session email `admin@example.fi`. Defined in `src/app/admin/page.tsx`, also hardcoded in `header.tsx` and `event-actions.tsx` (UI only). The server-side checks are in `admin/page.tsx` and `api/events/[id]/route.ts`.
- Middleware (deprecated name in Next 16, not yet renamed) protects: `/create-event`, `/:path*/edit`, `/dashboard`, `/admin`.

## Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Design tokens in `globals.css` under `@theme inline`.

- Shadow CSS vars: `shadow-(--shadow-card)` not `shadow-[var(--shadow-card)]`
- Aspect ratio: `aspect-4/3` not `aspect-[4/3]`
- Path alias: `@/*` resolves to repo root (use `@/src/...`)

Key token groups: `bg`, `surface`, `surface-soft`, `ink`, `ink-soft`, `border`, `primary`, `secondary`, `accent`, `warn`, `cat-{category}`.

## Testing

No automated tests on this branch yet (Playwright tests exist only on the stale `portfolio-tests` branch). When adding tests, add `data-testid` attributes to:

- Cards and list items representing data entities
- Meaningful interactive elements (buttons, fields, modals, dropdowns)
- Error messages and empty states
- Navigation elements

Use kebab-case describing what the element _is_: `event-card`, `category-filter`. Skip decorative or layout wrappers.

## Comments

Comments explain _why_, never _what_. Default: no comment. Add one only when a
competent Next.js/TypeScript developer would otherwise be surprised:

- Workarounds and library quirks (link the issue or docs if possible)
- Domain rules (e.g. why seeded events have no owner)
- Constraints from outside the code (pooler limits, external API limits)
- Deliberate choices that look wrong (e.g. dates stored as strings)

Never: explain language or framework basics; narrate changes (use the commit
message); leave commented-out code; add TODOs without a findings.md entry.
Prefer renaming over commenting. Keep comments to 1–2 lines above the block.
When you change code, update or remove its comments.

Explain TypeScript and Next.js patterns to me in your summary, not in code comments.
