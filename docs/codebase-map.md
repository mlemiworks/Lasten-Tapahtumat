I didn't modify any files. I skipped eventsforkids/docs/ as you asked. The checked-out branch is portfolio.

1. Folders and main components

eventsforkids/ ← the Next.js app and git repo; sessions start here (the parent folder holds nothing else)
.claude/ skills (sdd-*), hooks/review-gate.mjs (commit gate), settings.json
docs/ workflow.md, changes/, decisions, findings, progress
prisma/ schema, 3 migrations, seed.ts
prisma.config.ts Prisma CLI config (DIRECT_URL)
.github/workflows/reset.yml GitHub Actions cron that calls /api/reset every 6 hours
public/ testImages/\*.jpg, default SVGs, illustrations.jsx (?)
dev-data/ old db.json (gitignored, kept for reference)
src/
middleware.ts NextAuth route guard
lib/ prisma.ts (singleton), dataFetching.ts (data layer), auth.ts (NextAuth config),
categories.ts (CATEGORIES, CITIES with coordinates, getCityCoords)
types/types.ts Category union type only
app/ App Router pages and API routes (see below)
components/ header, login-dropdown (Radix
eventCard, event-form, event-actions, LocationPicker,
EventMap + EventMapClient, Wea
generated/prisma/ generated Prisma client (gitignored)

Pages:

┌───────────────┬────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Route │ Type │ Notes │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ / │ server → HomeBrowser │ force-dynamic. iltering and pagination (9 per page) all happen in the │
│ │ (client) │ browser. │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /[event] │ server │ Detail page. Maeather appears if the event is 0–16 days away. EventActions │
│ │ │ is a client component. │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /[event]/edit │ server → EditEventClient │ Prefills the fo. │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /create-event │ client │ Sends a POST to /api/create-event. │
├───────────────┼────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ /dashboard │ server │ Fetches all events, then filters by createdBy === session email. │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /admin │ server → AdminClient │ Admin check is d delete. │
├───────────────┼────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /register │ client │ Sends a POST to /api/register. │
└───────────────┴────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

2. Request flow (landing page → database → back)

1. Browser GET / → middleware.ts (doesn't match /, so it passes through).
1. app/page.tsx (server component) → fetchEvents() in lib/datandMany → PrismaPg adapter → Supabase Postgres via DATABASE_URL(pooler).
1. The events are rendered on the server and passed as props to HomeBrowser (client), which handles filtering in the browser.
1. A click on a card goes to /[id]. That page's server compone renders the detail page.
1. The browser then makes its own calls: EventMap loads OpenStreetMap tiles, WeatherForecast calls Open-Meteo, and EventActions reads the session with useSession().
1. Writes: client form → fetch('/api/...') → route handler → gg → Prisma → JSON response → router.push.

1. Where data lives

- Postgres (Supabase), through Prisma 7. There are two models:
  - Event: dates are stored as text (YYYY-MM-DD), price is a string, lat/lng are optional floats.
  - User: email is unique and password holds a bcrypt hash.
  - Event.createdBy is a foreign key to User.email, not User.id, with ON DELETE SET NULL.
- Supabase Storage, bucket event-images. /api/upload-image uploads with the service-role key and returns a public URL.
- Images in other places:
  - public/testImages/ (local files)
  - inline SVG illustrations in ui/Illustrations.tsx
  - the placehold.co placeholder used when an event has no image
- External APIs, all called from the browser:
  - Nominatim, to geocode the city in LocationPicker
  - OpenStreetMap tiles
  - unpkg, for the Leaflet marker icons
  - Open-Meteo, for weather. It uses the city coordinates from CITIES, not the event's own lat/lng.
- Seed data is defined twice: in prisma/seed.ts (upsert) and ite). Both have 9 events and 2 users.

4. Authentication and authorization

- Login: NextAuth v4 with a credentials provider (lib/auth.ts). It finds the user by email and checks the password with bcrypt. Sessions are JWTs and signIn points to /.
- Logging in and out: login-dropdown.tsx calls signIn('credenthe password with bcrypt (10 rounds) and requires at least 8characters.
- Middleware (src/middleware.ts) blocks logged-out users from /dashboard and /admin.
- Admin check. Admin means the session email equals 'admin@example.fi'. There is no role field. This check happens in four places:
  - app/admin/page.tsx:11,15: defines ADMIN_EMAIL and redirects anyone else (this is the server-side gate).
  - app/api/events/[id]/route.ts:10,27: imports ADMIN_EMAIL fr
  - components/event-actions.tsx:28: hardcoded string, used only to decide what to show.
  - components/header.tsx:82: hardcoded string, used only to decide what to show.
- Ownership: resolveEvent() in api/events/[id] lets a request through only if the user is the owner or the admin. This applies to both PUT and DELETE.

5. API routes

┌──────────┬─────────────────────────┬─────────────────────┬──────────────────────────────────────────────────────────────┐
│ Method │ Route │ Auth │ What it does │
├──────────┼─────────────────────────┼─────────────────────┼──────────────────────────────────────────────────────────────┤
│ GET/POST │ /api/auth/[...nextauth] │ — │ NextAuth handlers │
├──────────┼─────────────────────────┼─────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ POST │ /api/register │ none │ Vssword, creates the user │
├──────────┼─────────────────────────┼─────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ POST │ /api/create-event │ session │ Validates that title and date exist and that the category is known; sets createdBy to the │
│ │ │ │ │
├──────────┼─────────────────────────┼─────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ PUT │ /api/events/[id] │ owner or admin │ Updates the event. lat/lng: undefined keeps the old value, null clears it │
├──────────┼─────────────────────────┼─────────────────────┼──────────────────────────────────────────────────────────────┤
│ DELETE │ /api/events/[id] │ owner or admin │ Deletes the event │
├──────────┼─────────────────────────┼─────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ POST │ /api/upload-image │ session │ Iase Storage with a UUID filename → returns { url } │
├──────────┼─────────────────────────┼─────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
│ POST │ /api/reset │ x-reset-token │ Deletes all events and users, then reseeds them (dates are relative to today) │
│ │ │ header │ │
└──────────┴─────────────────────────┴─────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘

6. Unusual things and things I couldn't determine

Possible bugs and security issues:

- The edit page doesn't check ownership on the server. Any logged-in user can open /<anyId>/edit and see the prefilled form. Saving is still blocked by the API, which returns 403.
- Admins can't reach the edit page from the UI. EventActions shows "Muokkaa" (Edit) only to the owner, even though the API allows admin PUTs.
- The organizer's email is shown publicly in the "Järjestäjä" (organizer) row on the detail page (createdBy).
- Create skips some required fields. It doesn't validate location, city or category; missing values are stored as ''.
- PUT and create handle an empty time differently. PUT uses ?? null, so an empty string is stored as ''. Create uses || null, so it is stored as null.
- Client code types id as a number. create-event/page.tsx and edit/client.tsx use id?: number, but IDs are cuid strings.
- Uploaded images are never deleted. I found no code that removes them from Storage when an event is deleted or the database is reset. (Fairly sure, but not 100%.)
- No error.tsx or global-error.tsx. If the database is down, the landing page crashes (also noted in findings.md).
- Debugging output left in: WeatherForecast.tsx has console.log calls.

Leftovers and unclear files:

- public/illustrations.jsx doesn't seem to be imported anywhere. Because it's in public/, its raw source file is served to anyone who requests it.
- tailwind.config.mjs is a Tailwind v3-style config with paths that don't match this project. I assume Tailwind v4 ignores it (unsure).
- The lat/lng migration is named 20260521090321_init, the same ROADMAP planned to call it add-event-coordinates.
- NEXT_PUBLIC_SUPABASE_ANON_KEY is defined in .env but nothing in the code uses it.
- .env has no SUPABASE_SERVICE_ROLE_KEY, so image upload probably fails with a plain npm run dev. The key only exists in .env.production.local and
  .env.test.local.
- /api/reset compares the token with !==, which isn't a constant-time comparison. It does fail safely if RESET_TOKEN is unset.

Couldn't determine:

- Whether the Render hosting setup also has its own cron job.
- What production users see when the database is down.
- What the stale Playwright output in playwright-report/ and t

7. Where CLAUDE.md, README and ROADMAP don't match the code

┌──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Claim │ Actual │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: "All DB access goes through │ app/api/reset/route.ts imports prisma directly (and so does prisma/seed.ts, though that's a │
│ dataFetching.ts — no other file imports Prisma" │ script). │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: "Seeded events have no createdBy" │ True. │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: Playwright e2e and data-testid │ There is no @playwright/test dependency, no config and no spec files on this branch. data-testid │
│ conventions │ appears only in event-form, Illustrations and ImageUploader, not on event cards, filters and so │
│ │ on. (findings.md says the tests are on the stale portfolio-tests branch.) │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: price stored as "5", "0", null │ Code comments and the detail page also handle "5€" and "Vapaa pääsy" (free entry). │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: "Admin email … hardcoded in │ It is alsder.tsx and event-actions.tsx, and the API imports it from │
│ src/app/admin/page.tsx" │ the page file. │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md env section │ Leaves ouRL, RESET_TOKEN, NEXT_PUBLIC_SUPABASE_ANON_KEY and │
│ │ BASE_URL. │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ README and ROADMAP: "Next.js 15" │ package.jrns that middleware is deprecated. │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROADMAP: "Render cron job that resets DB every │ The repo resets through a GitHub Actions workflow (reset.yml). │
│ 6h" │ │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ ROADMAP: "update src/types/types.ts … Event │ Event now comes from Prisma, and types.ts only holds Category. That part of the plan is outdated. │
│ type" │ │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ README API table: register, create-event, │ Matches the code. │
│ events, reset, upload-image │ │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ CLAUDE.md: middleware matcher, Leaflet notes, │ │
│ illustration IDs, imgUrl rules, Prisma 7 import │ All match the code. │
│ path and adapter │ │
└──────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────┘
