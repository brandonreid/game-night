// Applies the SQL schema/seed files to whatever database TURSO_DATABASE_URL
// points at — a hosted Turso database or a local `file:local.db`.
//
// Usage (Node 20.6+ reads .env for you):
//   node --env-file=.env scripts/migrate.mjs
// or via the package script:
//   npm run db:migrate
//
// Safe to re-run: tables use CREATE TABLE IF NOT EXISTS and seeds only insert
// when their table is empty.
import { createClient } from "@libsql/client"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const url = process.env.TURSO_DATABASE_URL
if (!url) {
  console.error(
    "Missing TURSO_DATABASE_URL.\n" +
      "Set it in .env (then run `npm run db:migrate`), or pass it inline, e.g.\n" +
      "  TURSO_DATABASE_URL=file:local.db node scripts/migrate.mjs",
  )
  process.exit(1)
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
const here = dirname(fileURLToPath(import.meta.url))

const files = ["000-create-core-tables.sql", "001-create-brian-board-tables.sql"]

try {
  for (const file of files) {
    process.stdout.write(`Applying ${file} ... `)
    await db.executeMultiple(readFileSync(join(here, file), "utf8"))
    console.log("ok")
  }
  console.log(`\nMigration complete against ${url}`)
} catch (err) {
  console.error("\nMigration failed:", err.message)
  process.exit(1)
}
