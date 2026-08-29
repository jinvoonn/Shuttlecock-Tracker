export interface Brand {
  id: string;
  name: string;
}

export interface Purchase {
  id: string;
  brand_id: string;
  purchase_date: string;
  initial_quantity: number;
  remaining_quantity: number;
  price_per_tube: number;
  price_per_cock: number;
  tube_number: number;
  notes?: string | null;
  created_at?: string;
  brands?: Brand | Brand[] | null;
}

export interface Player {
  id: string;
  name: string;
  skill_rating?: number;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Session {
  id: string;
  date: string;
  location?: string | null;
  notes?: string | null;
  start_time?: string;
  created_at?: string;
  session_players?: { player_id: string; players?: Player | Player[] }[];
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_id: string;
  players?: Player | Player[];
}

export interface SessionUsage {
  id: string;
  session_id: string;
  purchase_id: string;
  quantity_used: number;
  purchases?: { price_per_cock: number } | { price_per_cock: number }[];
}

export interface Payment {
  id: string;
  player_id: string;
  amount: number;
  date: string;
  note?: string | null;
  created_at?: string;
  players?: Player | Player[];
}

export interface MatchRow {
  id: string;
  session_id: string;
  season_id?: string | null;
  team_a_player1: string;
  team_a_player2?: string | null;
  team_b_player1: string;
  team_b_player2?: string | null;
  team_a_score: number;
  team_b_score: number;
  played_at?: string;
  created_at?: string;
}

export interface LeaderboardSnapshot {
  id: string;
  created_at?: string;
  period_start: string;
  period_end: string;
  type?: string;
  player_id: string;
  rank: number;
  wins?: number;
  win_rate?: number;
  cock_rating?: number;
}

export interface Season {
  id: string;
  season_number: number;
  name: string;
  status: 'active' | 'completed';
  start_date: string;
  end_date?: string | null;
  created_at?: string;
  ended_at?: string | null;
  config?: {
    base_mmr?: number;
    reset_factor?: number;
    rd_increment?: number;
    max_rd?: number;
    mmr_floor?: number;
  };
}

export interface SeasonPlayerResult {
  id: string;
  season_id: string;
  player_id: string;
  final_mmr: number;
  final_rd: number;
  final_xp: number;
  final_cock_rating: number;
  final_rank: number;
  wins: number;
  losses: number;
  draws: number;
  matches_played: number;
  win_rate: number;
  streak: number;
  max_streak: number;
  created_at?: string;
}

export interface ViewerSettings {
  id: string;
  pin_hash?: string | null;
  permissions: string[];
  updated_at?: string;
}
