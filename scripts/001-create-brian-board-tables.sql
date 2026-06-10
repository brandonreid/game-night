-- Create tables for Brian's secret board game nights

-- Brian's game nights table
CREATE TABLE IF NOT EXISTS brian_game_nights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Brian's players table  
CREATE TABLE IF NOT EXISTS brian_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  games TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default game night for Brian's board
INSERT INTO brian_game_nights (date, description, is_active)
VALUES (
  '2025-05-28T19:00:00.000Z',
  'Board game night at Brian''s place! His basement setup is legendary. Limited spots available.'
, true);
