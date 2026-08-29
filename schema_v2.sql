-- Drop old tables (Warning: this will delete existing data!)
DROP TABLE IF EXISTS public.session_players CASCADE;
DROP TABLE IF EXISTS public.session_usage CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;

-- 1. Brands Table
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

-- 2. Purchases Table
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete restrict not null,
  purchase_date date not null,
  initial_quantity integer not null default 12,
  remaining_quantity integer not null default 12,
  price_per_tube numeric not null default 0,
  price_per_cock numeric not null default 0,
  tube_number integer not null,
  notes text,
  created_at timestamptz default now()
);

-- 3. Players Table
create table public.players (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  skill_rating integer not null default 5 check (skill_rating >= 1 and skill_rating <= 10),
  created_at timestamptz default now()
);

-- 4. Sessions Table
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  location text,
  notes text,
  start_time timestamptz default now(),
  created_at timestamptz default now()
);

-- 5. Session Players Table
create table public.session_players (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete restrict not null
);

-- 6. Session Usage Table
create table public.session_usage (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  purchase_id uuid references public.purchases(id) on delete restrict not null,
  quantity_used integer not null,
  check (quantity_used > 0)
);

-- 7. Payments Table (Updated to use player_id)
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id) on delete restrict not null,
  amount numeric not null,
  date date not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.brands enable row level security;
create policy "Allow all operations on brands" on public.brands for all using (true) with check (true);

alter table public.purchases enable row level security;
create policy "Allow all operations on purchases" on public.purchases for all using (true) with check (true);

alter table public.players enable row level security;
create policy "Allow all operations on players" on public.players for all using (true) with check (true);

alter table public.sessions enable row level security;
create policy "Allow all operations on sessions" on public.sessions for all using (true) with check (true);

alter table public.session_players enable row level security;
create policy "Allow all operations on session_players" on public.session_players for all using (true) with check (true);

alter table public.session_usage enable row level security;
create policy "Allow all operations on session_usage" on public.session_usage for all using (true) with check (true);

alter table public.payments enable row level security;
create policy "Allow all operations on payments" on public.payments for all using (true) with check (true);

-- 8. Matches Table (Simplified Flat Structure)
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  team_a_player1 uuid references public.players(id) on delete restrict not null,
  team_a_player2 uuid references public.players(id) on delete restrict not null,
  team_b_player1 uuid references public.players(id) on delete restrict not null,
  team_b_player2 uuid references public.players(id) on delete restrict not null,
  team_a_score integer not null default 0,
  team_b_score integer not null default 0,
  played_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS for Matches
alter table public.matches enable row level security;
create policy "Allow all operations on matches" on public.matches for all using (true) with check (true);

-- 9. Leaderboard Snapshots Table
create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  period_start date not null,
  period_end date not null,
  type text default 'global',
  player_id uuid references public.players(id) on delete cascade,
  rank int not null,
  wins int,
  win_rate float,
  cock_rating int,
  -- prevent duplicate snapshots for same player + period
  unique (player_id, period_start, period_end, type)
);

create index if not exists idx_snapshots_period 
on public.leaderboard_snapshots(period_start, period_end);

create index if not exists idx_snapshots_player 
on public.leaderboard_snapshots(player_id);

alter table public.leaderboard_snapshots enable row level security;
create policy "Allow all operations on snapshots" on public.leaderboard_snapshots for all using (true) with check (true);

-- 10. Seasons Table
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  season_number integer not null unique,
  name text not null,
  status text not null check (status in ('active', 'completed')) default 'active',
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz default now(),
  ended_at timestamptz,
  config jsonb default '{"base_mmr": 1200, "reset_factor": 0.5, "rd_increment": 75, "max_rd": 350}'::jsonb
);

-- 11. Season Player Results Table (Immutable Historical Snapshots)
create table if not exists public.season_player_results (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  final_mmr float not null,
  final_rd float not null,
  final_xp float not null default 0,
  final_cock_rating integer not null,
  final_rank integer not null,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  matches_played integer not null default 0,
  win_rate float not null default 0,
  streak integer not null default 0,
  max_streak integer not null default 0,
  created_at timestamptz default now(),
  unique (season_id, player_id)
);

create index if not exists idx_seasons_status on public.seasons(status);
create index if not exists idx_season_player_results_season_id on public.season_player_results(season_id);
create index if not exists idx_season_player_results_player_id on public.season_player_results(player_id);

alter table public.seasons enable row level security;
create policy "Allow all operations on seasons" on public.seasons for all using (true) with check (true);

alter table public.season_player_results enable row level security;
create policy "Allow all operations on season_player_results" on public.season_player_results for all using (true) with check (true);

-- 12. Viewer Settings Table (PIN & Granular Permissions)
create table if not exists public.viewer_settings (
  id uuid primary key default gen_random_uuid(),
  pin_hash text,
  permissions jsonb not null default '["LOG_MATCH", "EDIT_MATCH", "DELETE_MATCH"]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.viewer_settings enable row level security;
create policy "Allow all operations on viewer_settings" on public.viewer_settings for all using (true) with check (true);

