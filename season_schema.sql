-- ==============================================================================
-- COCKCOUNT V2: SEASON SYSTEM DATABASE MIGRATION
-- ==============================================================================

-- 1. Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  config JSONB DEFAULT '{"base_mmr": 1200, "reset_factor": 0.5, "rd_increment": 75, "max_rd": 350}'::jsonb
);

-- 2. Season Player Results Table (Immutable Historical Snapshots)
CREATE TABLE IF NOT EXISTS public.season_player_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  final_mmr FLOAT NOT NULL,
  final_rd FLOAT NOT NULL,
  final_xp FLOAT NOT NULL DEFAULT 0,
  final_cock_rating INTEGER NOT NULL,
  final_rank INTEGER NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  win_rate FLOAT NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (season_id, player_id)
);

-- 3. Match Association to Season
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on seasons" ON public.seasons FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.season_player_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on season_player_results" ON public.season_player_results FOR ALL USING (true) WITH CHECK (true);

-- 5. Indexes for fast leaderboard and season snapshot lookups
CREATE INDEX IF NOT EXISTS idx_seasons_status ON public.seasons(status);
CREATE INDEX IF NOT EXISTS idx_season_player_results_season_id ON public.season_player_results(season_id);
CREATE INDEX IF NOT EXISTS idx_season_player_results_player_id ON public.season_player_results(player_id);
CREATE INDEX IF NOT EXISTS idx_matches_season_id ON public.matches(season_id);

-- 6. Seed Season 1 as active if no seasons exist
INSERT INTO public.seasons (season_number, name, status, start_date)
VALUES (1, 'Season 1', 'active', '2023-09-13')
ON CONFLICT (season_number) DO NOTHING;

-- 7. Associate all existing matches to Season 1
UPDATE public.matches
SET season_id = (SELECT id FROM public.seasons WHERE season_number = 1 LIMIT 1)
WHERE season_id IS NULL;
