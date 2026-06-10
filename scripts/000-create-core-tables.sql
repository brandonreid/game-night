-- Core tables for the public Game Night board.
-- Run this BEFORE 001-create-brian-board-tables.sql.
-- Schema mirrors lib/database.types.ts.

-- Game nights table
CREATE TABLE IF NOT EXISTS game_nights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Players (RSVPs) table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  games TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed a default active game night so the board has something to show
INSERT INTO game_nights (date, description, is_active)
VALUES (
  '2025-05-28T19:00:00.000Z',
  'Game night! Bring your favorite games and snacks.',
  true
);
