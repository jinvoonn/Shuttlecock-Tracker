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
  created_at timestamptz default now()
);

-- RLS for Matches
alter table public.matches enable row level security;
create policy "Allow all operations on matches" on public.matches for all using (true) with check (true);
