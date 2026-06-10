import { createClient } from "@libsql/client"

// Single libSQL/Turso client shared across server actions.
//
// In production set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN.
// For local development you can point at a plain SQLite file instead, e.g.
//   TURSO_DATABASE_URL=file:local.db
// in which case no auth token is required.
const url = process.env.TURSO_DATABASE_URL

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL environment variable")
}

export const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// libSQL returns array-like Row objects with a non-plain prototype, which
// Next.js refuses to serialize across the server/client boundary. Copy each
// row into a plain object before handing it to a Client Component.
export function toPlainRows<T>(result: { columns: string[]; rows: unknown[] }): T[] {
  return (result.rows as Record<string, unknown>[]).map((row) => {
    const plain: Record<string, unknown> = {}
    for (const column of result.columns) {
      plain[column] = row[column]
    }
    return plain as T
  })
}

// Row shapes returned to the UI (kept identical to the old Supabase schema).
export interface Player {
  id: string
  name: string
  games: string | null
  joined_at: string
}

export interface GameNight {
  id: string
  date: string
  description: string | null
  is_active: number
}
