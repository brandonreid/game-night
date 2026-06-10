-- Tables for Brian's secret board game nights (SQLite / libSQL / Turso).

-- Brian's game nights table
CREATE TABLE IF NOT EXISTS brian_game_nights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Brian's players table
CREATE TABLE IF NOT EXISTS brian_players (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  games TEXT,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Insert a default game night for Brian's board.
-- Idempotent: only inserts when the table is empty, so re-running is safe.
INSERT INTO brian_game_nights (date, description, is_active)
SELECT
  '2025-05-28T19:00:00.000Z',
  'Board game night at Brian''s place! His basement setup is legendary. Limited spots available.',
  1
WHERE NOT EXISTS (SELECT 1 FROM brian_game_nights);
