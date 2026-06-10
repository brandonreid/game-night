# Game Night

A small Next.js + Supabase app for organizing game nights. Visitors land on a
password screen; once authenticated they can view the current game night and
RSVP with the games they're bringing.

Built with Next.js 15 (App Router), React 19, Tailwind
CSS, shadcn/ui, and Supabase (Postgres).

## Prerequisites

- **Node.js 18.18+** (developed against Node 20+)
- **npm** (ships with Node). The project was created with Bun, so a `bun.lock`
  is included — if you have [Bun](https://bun.sh) installed you can use it
  instead (see notes below), but npm works fine.
- A **Supabase** project (free tier is plenty).

## 1. Install dependencies

```bash
npm install
```

> Using Bun instead? Run `bun install`.

## 2. Configure environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.example .env
```

The app only reads three variables:

| Variable                        | Where to find it                                               | Purpose                               |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API → Project URL                        | Supabase endpoint                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → Project API keys → `anon` `public` | Public client key                     |
| `REVALIDATE_SECRET`             | Any random string you choose                                   | Guards the `/api/revalidate` endpoint |

> `.env` is gitignored because it contains secrets — never commit it. The full
> set of Postgres/Supabase variables that Vercel exports is harmless to keep in
> `.env`, but only the three above are actually used.

## 3. Set up the database

If you're pointing at an **existing** Supabase project that already has the
tables, skip this step. To provision a **fresh** project, run the SQL scripts in
`scripts/` (in order) via the Supabase dashboard → **SQL Editor**:

1. `scripts/000-create-core-tables.sql` — creates `game_nights` and `players`
   (the main public board) and seeds a default game night.
2. `scripts/001-create-brian-board-tables.sql` — creates the separate
   "Brian's board" tables (`brian_game_nights`, `brian_players`).

## 4. Run the app

```bash
npm run dev
```

Open <http://localhost:3000>. You'll hit the password screen first.

- **Password:** `halihax` (defined in `app/actions.ts`). After entering it you
  get a 24-hour auth cookie and are redirected to `/game-night`.

## Available scripts

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start the dev server at http://localhost:3000  |
| `npm run build` | Create a production build                      |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint`  | Run Next.js / ESLint checks                    |

## Project structure

```
app/                 App Router pages, server actions, and API routes
  actions.ts         Server actions (auth, RSVP add/remove, revalidation)
  page.tsx           Password screen (/)
  game-night/        Protected game night board (/game-night)
  api/revalidate/    On-demand cache revalidation endpoint
components/          UI components (shadcn/ui + app components)
hooks/               React hooks
lib/                 Supabase client and generated database types
middleware.ts        Protects /game-night, checks the auth cookie
scripts/             SQL migrations for Supabase
```

## Notes

- **Auth is intentionally simple** — a shared password and a base64 cookie, not
  real user accounts. Fine for a private game night; don't reuse it for anything
  sensitive.
- `next.config.mjs` sets `ignoreBuildErrors` and `ignoreDuringBuilds`, so
  TypeScript and ESLint errors won't fail `npm run build`. This is the v0
  default; tighten it if you want stricter builds.

```

```
