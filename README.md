# Game Night

A small Next.js app for organizing game nights, backed by
[Turso](https://turso.tech) (SQLite/libSQL). Visitors land on a password screen;
once authenticated they can view the current game night and RSVP with the games
they're bringing.

Built with Next.js 15 (App Router), React 19, Tailwind
CSS, shadcn/ui, and Turso (SQLite / libSQL).

## Prerequisites

- **Node.js 18.18+** (developed against Node 20+)
- **npm** (ships with Node)
- A **Turso** database (free tier is plenty), or just a local SQLite file for
  development — see step 3.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example file and fill in your Turso values:

```bash
cp .env.example .env
```

The app reads three variables:

| Variable             | Where to find it                                              | Purpose                               |
| -------------------- | ------------------------------------------------------------ | ------------------------------------- |
| `TURSO_DATABASE_URL` | `turso db show --url <db>` (or `file:local.db` for local dev) | libSQL/Turso connection URL           |
| `TURSO_AUTH_TOKEN`   | `turso db tokens create <db>` (omit for a local file)         | Auth token for the hosted database    |
| `REVALIDATE_SECRET`  | Any random string you choose                                  | Guards the `/api/revalidate` endpoint |

> `.env` is gitignored because it contains secrets — never commit it.

## 3. Set up the database

The schema lives in `scripts/` as plain SQLite:

1. `scripts/000-create-core-tables.sql` — creates `game_nights` and `players`
   (the main public board) and seeds a default game night.
2. `scripts/001-create-brian-board-tables.sql` — creates the separate
   "Brian's board" tables (`brian_game_nights`, `brian_players`).

Apply them with the bundled migration script, which runs against whatever
`TURSO_DATABASE_URL` is set in `.env` (hosted Turso *or* a local file). It's
safe to re-run:

```bash
npm run db:migrate
```

**Hosted Turso (for Vercel):** the simplest way to provision a database is the
[Turso dashboard](https://turso.tech) — sign up, create a database, and copy its
**URL** and an **auth token** into `.env`. Then run `npm run db:migrate`. No CLI
required.

> Prefer the CLI? Note that `turso` (the Turso **Cloud** CLI) is a different
> binary from `tursodb` (the local in-process database engine). The Homebrew
> formula currently pulls in `sqld` and compiles a Rust toolchain; the install
> script is faster: `curl -sSfL https://get.tur.so/install.sh | bash`. Then
> `turso auth login`, `turso db create game-night`, `turso db show game-night
> --url`, and `turso db tokens create game-night`.

**Local SQLite file:** set `TURSO_DATABASE_URL=file:local.db` in `.env`, then
run `npm run db:migrate`. (`local.db` is gitignored.)

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
| `npm run db:migrate` | Apply `scripts/*.sql` to `TURSO_DATABASE_URL` (safe to re-run) |

## Project structure

```
app/                 App Router pages, server actions, and API routes
  actions.ts         Server actions (auth, RSVP add/remove, revalidation)
  page.tsx           Password screen (/)
  game-night/        Protected game night board (/game-night)
  api/revalidate/    On-demand cache revalidation endpoint
components/          UI components (shadcn/ui + app components)
hooks/               React hooks
lib/                 libSQL/Turso client (db.ts) and row types
middleware.ts        Protects /game-night, checks the auth cookie
scripts/             SQLite schema / seed scripts
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
