# Codebase map

Architecture overview of Lasten tapahtumat. Paths are relative to the repo root (the repo root). Known issues are not listed here: they live in `docs/findings.md`.

## 1. Folders

| Path | Contents |
| --- | --- |
| `src/app/` | App Router pages, API routes, `src/app/globals.css` (Tailwind v4 tokens), error and loading boundaries |
| `src/components/` | Header, login dropdown, event card, event form, event actions, home browser, map and weather components |
| `src/components/ui/` | Button, Input, Select, Textarea, Pill, ImageUploader, `src/components/ui/Illustrations.tsx` (inline SVG illustrations) |
| `src/lib/` | `src/lib/prisma.ts` (singleton client), `src/lib/dataFetching.ts` (data layer), `src/lib/auth.ts` (NextAuth config), `src/lib/categories.ts` (categories, cities with coordinates), `src/lib/imgUrl.ts` (`validImgUrl`) |
| `src/types/types.ts` | `Category` union type only |
| `src/middleware.ts` | NextAuth route guard |
| `src/generated/prisma/` | Generated Prisma client (git-ignored) |
| `prisma/` | `prisma/schema.prisma`, `prisma/migrations/` (3), `prisma/seed.ts` |
| `prisma.config.ts` | Prisma CLI config (`DIRECT_URL`) |
| `tests/e2e/` | Playwright suite, run by `npm run test:e2e` (wipes and reseeds the dev database) |
| `playwright.config.ts`, `playwright.db-error.config.ts` | Main run and the refused-DB-connection run |
| `.github/workflows/reset.yml` | GitHub Actions cron that POSTs to `/api/reset` every 6 hours |
| `.claude/` | Project skills (`sdd-*`), `.claude/hooks/review-gate.mjs` (commit gate), `.claude/settings.json` |
| `docs/` | Working documents: workflow, changes, decisions, findings, progress |
| `public/` | `public/testImages/`, default SVGs, `public/illustrations.jsx` |
| `dev-data/` | Old `dev-data/db.json` (git-ignored, reference only) |

## 2. Pages

| Route | File | Type | Notes |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | server, renders `HomeBrowser` (client) | `force-dynamic`. Filtering and pagination (9 per page) happen in the browser |
| `/[event]` | `src/app/[event]/page.tsx` | server | Detail page. Weather shows if the event is 0–16 days away. `EventActions` is a client component |
| `/[event]/edit` | `src/app/[event]/edit/page.tsx` | server, renders `EditEventClient` (`src/app/[event]/edit/client.tsx`) | Prefills the form. Redirects to `/` if the event doesn't exist. Middleware requires login |
| `/create-event` | `src/app/create-event/page.tsx` | client | POSTs to `/api/create-event`. Middleware requires login |
| `/dashboard` | `src/app/dashboard/page.tsx` | server | Fetches all events, keeps those with `createdBy` equal to the session email. Middleware requires login |
| `/admin` | `src/app/admin/page.tsx` | server, renders `AdminClient` (`src/app/admin/client.tsx`) | Redirects anyone but the admin to `/`. Lists all events with delete |
| `/register` | `src/app/register/page.tsx` | client | POSTs to `/api/register` |

Boundaries: `src/app/layout.tsx` (providers, header, footer), `src/app/loading.tsx` and `src/app/[event]/loading.tsx` (skeletons), `src/app/error.tsx` (root error boundary), `src/app/global-error.tsx`.

## 3. API routes

| Method | Route | File | Auth | What it does |
| --- | --- | --- | --- | --- |
| GET, POST | `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | none | NextAuth handlers |
| POST | `/api/register` | `src/app/api/register/route.ts` | none | Requires email and password (8+ characters), rejects an email already in use, hashes with bcrypt (10 rounds), creates the user |
| POST | `/api/create-event` | `src/app/api/create-event/route.ts` | session | Requires title and date and a valid `imgUrl`, sets `createdBy` to the session email |
| PUT | `/api/events/[id]` | `src/app/api/events/[id]/route.ts` | owner or admin | Updates the event. `lat`/`lng`: `undefined` keeps the old value, `null` clears it |
| DELETE | `/api/events/[id]` | `src/app/api/events/[id]/route.ts` | owner or admin | Deletes the event |
| POST | `/api/upload-image` | `src/app/api/upload-image/route.ts` | session | Uploads an image file to Supabase Storage under a UUID filename and returns `{ url }` |
| POST | `/api/reset` | `src/app/api/reset/route.ts` | `x-reset-token` header | Deletes all events and users, then reseeds them with dates relative to today |

## 4. Request flow

1. Browser GET `/`. `src/middleware.ts` doesn't match it, so it passes through.
2. `src/app/page.tsx` (server) calls `fetchEvents()` in `src/lib/dataFetching.ts`, which goes through Prisma and the `PrismaPg` adapter to Supabase Postgres (`DATABASE_URL`, transaction pooler). The pool uses a 5 s connect timeout.
3. The events render on the server and go as props to `HomeBrowser` (client), which filters in the browser.
4. A card click goes to `/[event]`, whose server component fetches that event.
5. The browser then makes its own calls: `EventMap` loads OpenStreetMap tiles, `WeatherForecast` calls Open-Meteo, `EventActions` reads the session with `useSession()`.
6. Writes: client form, `fetch('/api/...')`, route handler, `src/lib/dataFetching.ts`, Prisma, JSON response, `router.push`.

If the database is unreachable, `src/app/error.tsx` and `src/app/global-error.tsx` show an error page.

## 5. Data

- **Postgres (Supabase) through Prisma 7**, two models:
  - `Event`: date and time are text (`YYYY-MM-DD`), `price` is a string, `lat`/`lng` are optional floats.
  - `User`: `email` is unique, `password` holds a bcrypt hash.
  - `Event.createdBy` references `User.email` (not `User.id`) with `ON DELETE SET NULL`.
- **Supabase Storage**: bucket `event-images`. `/api/upload-image` uploads with the service-role key and returns a public URL.
- **Event images**: `imgUrl` is required and checked by `validImgUrl` in `src/lib/imgUrl.ts`. It accepts an illustration ID (rendered from `src/components/ui/Illustrations.tsx`), a `/testImages/` path (`public/testImages/`) or a URL under our own Supabase bucket.
- **External APIs, all called from the browser**: Nominatim (geocodes the city in `LocationPicker`), OpenStreetMap tiles, unpkg (Leaflet marker icons), Open-Meteo (weather, using the city coordinates from `CITIES`, not the event's own `lat`/`lng`).
- **Seed data** is defined twice: `prisma/seed.ts` (upsert) and `src/app/api/reset/route.ts` (delete and recreate). Both create 9 events and the users `testi@example.com` and `admin@example.fi`.
- **Direct Prisma access outside `src/lib/dataFetching.ts`**: `src/app/api/reset/route.ts` and `prisma/seed.ts`.

## 6. Authentication and authorization

- **Login**: NextAuth v4, credentials provider (`src/lib/auth.ts`). It finds the user by email and checks the password with bcrypt. Sessions are JWTs. `signIn` points to `/`, where `src/components/login-dropdown.tsx` calls `signIn('credentials')`.
- **Middleware** (`src/middleware.ts`, `withAuth`) guards `/create-event`, `/:path*/edit`, `/dashboard` and `/admin`.
- **Admin** means the session email equals `admin@example.fi`; there is no role field.
  - `src/app/admin/page.tsx` defines `ADMIN_EMAIL` and redirects anyone else (server-side gate).
  - `src/app/api/events/[id]/route.ts` imports `ADMIN_EMAIL` from that page.
  - `src/components/event-actions.tsx` and `src/components/header.tsx` hardcode the string and use it only to decide what to show.
- **Ownership**: `resolveEvent()` in `src/app/api/events/[id]/route.ts` returns 401 without a session, 404 for an unknown id and 403 unless the user owns the event or is the admin. It guards both PUT and DELETE.
- **Reset**: `/api/reset` compares the `x-reset-token` header to `RESET_TOKEN` and rejects when it is unset.

## 7. Environment and deployment

- `.env` (development) and `.env.production.local` (production) hold the runtime variables listed in `CLAUDE.md`.
- Hosting is Render. `.github/workflows/reset.yml` resets the demo database through `/api/reset` with the `APP_URL` and `RESET_TOKEN` secrets.
