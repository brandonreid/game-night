-- Core tables for the public Game Night board (SQLite / libSQL / Turso).
-- Run this BEFORE 001-create-brian-board-tables.sql.

-- Game nights table
CREATE TABLE IF NOT EXISTS game_nights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Players (RSVPs) table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  games TEXT,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Seed a default active game night so the board has something to show.
-- Idempotent: only inserts when the table is empty, so re-running is safe.
INSERT INTO game_nights (date, description, is_active)
SELECT
  '2025-05-28T19:00:00.000Z',
  'Game night! Bring your favorite games and snacks.',
  1
WHERE NOT EXISTS (SELECT 1 FROM game_nights);
