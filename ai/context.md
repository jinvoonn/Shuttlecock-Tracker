# Project Context: CockCount

## Purpose
CockCount is a premium web app to track badminton group costs — shuttlecock usage, session attendance, player payments, and match results. It replaces Excel sheets with a streamlined real-time interface.

## Main Features
*   **Balance Dashboard**: Real-time debt/credit status for all players.
*   **Session Management**: Log sessions, track shuttlecock usage per purchase.
*   **Match Logging**: Record match results (Team A vs Team B) within sessions with player cycle selection.
*   **Auto-Grouping System**: (Planned) Smart balanced team generation.
*   **Player Profiles**: Win rates, H2H records, best partner analytics, and win streaks.
*   **Analytics Dashboard**: Monthly spending and usage trends visualized with `recharts`.
*   **Dashboard Stats Row**: Horizontal scrollable insights (Most Wins, Win Streaks, Best/Cursed Duos).
*   **Direct Settle**: One-tap settlement of player balances from the mobile dashboard.
*   **Admin Access**: Secret path (`/admin-92Kf8s`) required for ALL mutations except Match logging/editing. Sessions/Payments are Admin-only for edit/delete.

## Tech Stack
*   **Framework**: Next.js 16+ (App Router)
*   **Language**: TypeScript
*   **Backend**: Supabase (PostgreSQL)
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Utilities**: `clsx`, `date-fns`

## Architecture Rules
*   Server Components fetch data (no `useState`/`useEffect` for data)
*   Client Components handle UI interactions
*   Server Actions handle all mutations (in `src/lib/actions/`)
*   Do NOT modify the database schema
*   Do NOT introduce new libraries
*   Always call `revalidatePath` after mutations
*   **FAB Pattern**: Mobile creation buttons (Sessions, Payments) use a standardized Floating Action Button at `fixed bottom-32 right-8` with `bg-emerald-400`.

## Database Schema (Key Tables)
*   **`matches`**: `id`, `session_id`, `team_a_player1`, `team_a_player2`, `team_b_player1`, `team_b_player2`, `team_a_score`, `team_b_score`, `created_at`
*   **`sessions`**: `id`, `date`, `location`, `created_at`
*   **`players`**: `id`, `name`
*   **`session_players`**: `session_id`, `player_id`, joins with `players(id, name)`
*   **`purchases`**, **`session_usage`**, **`brands`** for shuttlecock cost tracking

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Player Selection System (as of 15 Mar 2026)
All match forms (desktop + mobile) use a unified cycle system:

```ts
const [playerTeams, setPlayerTeams] = useState<Record<string, number>>({});
// 0 = unselected, 1 = Team A, 2 = Team B

const cyclePlayer = (id: string) => {
  setPlayerTeams(prev => {
    const current = prev[id] ?? 0;
    const next = (current + 1) % 3;
    return { ...prev, [id]: next };
  });
};

const teamAIds = Object.entries(playerTeams).filter(([, v]) => v === 1).map(([k]) => k);
const teamBIds = Object.entries(playerTeams).filter(([, v]) => v === 2).map(([k]) => k);
```

No team size restrictions. Supports 1v1, 2v2, 3v3, any combo.

## Match Server Actions Payload Format
All match actions in `src/lib/actions/matches.ts` expect:

```ts
{
  sessionId: string;
  teamAIds: string[];
  teamBIds: string[];
  scoreA: number;
  scoreB: number;
}
```

The action maps `teamAIds[0]` → `team_a_player1`, `teamAIds[1]` → `team_a_player2`, etc.

## Current Project Status
**Phase 57 complete (17 Mar 2026).** App features robust analytics, premium assets, and polished mobile UX with consistent action patterns. Successfully verified with production builds.

*"Because Shuttlecocks Aren't Free."*
