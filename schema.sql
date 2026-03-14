-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Purchases Table
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  brand text not null,
  tube_quantity integer not null,
  shuttles_per_tube integer not null default 12,
  total_cost numeric not null,
  cost_per_shuttle numeric generated always as (total_cost / (tube_quantity * shuttles_per_tube)) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions Table
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  dead_shuttles integer not null,
  total_cost numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Session Players Table
create table public.session_players (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_name text not null,
  share_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments Table
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  player_name text not null,
  amount numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on row level security but allow all access for now (since no auth is required per spec)
alter table public.purchases enable row level security;
alter table public.sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.payments enable row level security;

create policy "Allow all operations for public on purchases" on public.purchases for all using (true) with check (true);
create policy "Allow all operations for public on sessions" on public.sessions for all using (true) with check (true);
create policy "Allow all operations for public on session_players" on public.session_players for all using (true) with check (true);
create policy "Allow all operations for public on payments" on public.payments for all using (true) with check (true);
