# Project Context: CockCount

## Purpose
CockCount is a premium **Dark Mode Only** web app to track badminton group costs — shuttlecock usage, session attendance, player payments, and match results. It replaces Excel sheets with a streamlined real-time interface.

## Main Features
*   **Live Leaderboard**: Real-time rank animations and optimistic updates using `MatchesContext`.
*   **Balance Dashboard**: Debt/credit status for all players.
*   **Session Management**: Log sessions, track shuttlecock usage per purchase.
*   **Match Logging**: Record results with instant UI feedback (Optimistic UI).
*   **Player Profiles**: Win rates, H2H records, best partner analytics, and win streaks.
*   **Centralized Analytics Engine**: Unified logic for all match stats in `src/lib/analytics/`.
*   **Glicko-Lite Ranking Engine**: Floor-protected Glicko-Lite + Attendance Streak XP hybrid replaces the legacy zero-sum Elo system. Skill floor = 1000, close-match 70% damping, soft streak decay.
*   **Match Rating Delta Indicators**: Every match log shows a per-player `+N` / `-N` CockRating change badge in emerald/rose/grey, rendered on session pages (desktop + mobile) and player profile match history.
*   **Light Social Adjustments**: Surgically injected Underdog win bonuses (+20% for wins with probability < 30%) to reward underdogs for high-impact upset victories.
*   **Season System**: Full competitive season management with soft MMR reset (base 1200, 50% compression), immutable historical snapshots in `season_player_results`, season-scoped leaderboards (Current / Final Standings / All-Time Career), and Admin "Season Settings" modal for atomic season transitions. Financial system is 100% isolated from seasons.
*   **Leaderboards**: Global and Session-level leaderboard with toggleable segmented controls. Season selector dropdown to switch between current, historical, and all-time views.
*   **Premium Gaming UI**: High-contrast "Obsidian" score pills, rank trophy icons, and player avatars.
*   **FIFA-Style Player Card**: Collectible identity card on each player's profile with 4 visual tiers (Bronze/Silver/Gold/Elite) mapped to CR score. Dynamic `seasonEdition` footer (e.g. "Season 2 Edition"). Future-proofed for hero images via `avatar_url`.
*   **Session Story Card Generator**: 9:16 IG-ready shareable cards with high-res PNG/Sticker export. Multi-card Podium carousel system in design phase.
*   **Direct Settle**: One-tap settlement from the mobile dashboard.
*   **Auto-Grouping System**: (Planned) Smart balanced team generation.

## Tech Stack
*   **Framework**: Next.js 16+ (App Router)
*   **Language**: TypeScript
*   **Backend**: Supabase (PostgreSQL)
*   **State Management**: React Context (`MatchesProvider`, `AuthProvider`)
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Utilities**: `clsx`, `date-fns`

## Architecture Rules
*   **Global Match State**: ALL match-related UI must consume `matches` from `useMatches()` to ensure real-time synchronization.
*   **Optimistic UI**: Any match mutation should call `addOptimisticMatch` to provide instant feedback.
*   **Build Stability**: Server components should avoid blocking `await` on external databases during the build phase; use client-side hydration for large datasets where necessary.
*   **Dynamic Components**: Heavy UI blocks (like the Dashboard) use `next/dynamic` with `ssr: false` to optimize build memory.
*   **Dark Mode Only**: All UI must adhere to the Slate-900/800 background and Emerald-400 accent palette. Light mode is not supported.
*   **FAB Pattern**: Mobile creation buttons (Sessions, Payments) use a standardized Floating Action Button at `fixed bottom-32 right-8` with `bg-emerald-400`.
*   **Financial Isolation**: The financial system (payments, session costs, balances) MUST remain completely independent of the season/MMR system. Never modify financial data during season transitions.

## Database Schema (Key Tables)
*   **`matches`**: `id`, `session_id`, `season_id` (FK → seasons), `team_a_player1`, `team_a_player2`, `team_b_player1`, `team_b_player2`, `team_a_score`, `team_b_score`, `played_at`, `created_at`
*   **`sessions`**: `id`, `date`, `start_time`, `location`, `created_at`
*   **`players`**: `id`, `name` (future: `avatar_url` for Player Card hero images)
*   **`session_players`**: `session_id`, `player_id`, joins with `players(id, name)`
*   **`seasons`**: `id`, `season_number`, `name`, `status` ('active'|'completed'), `start_date`, `end_date`, `config` (JSONB: `base_mmr`, `reset_factor`, `rd_increment`, `max_rd`, `mmr_floor`)
*   **`season_player_results`**: `id`, `season_id`, `player_id`, `final_mmr`, `final_rd`, `final_rank`, `season_wins`, `season_losses`, `season_games` — **immutable** end-of-season snapshot, unique `(season_id, player_id)`
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
  playedAt?: string; // ISO timestamp
}
```

The action maps `teamAIds[0]` → `team_a_player1`, `teamAIds[1]` → `team_a_player2`, etc.

## Ranking Engine (`src/lib/analytics/rankingEngine.ts`)
The unified engine `calculateGlickoHybridRatings(matches, options?)` returns:
- `current: EloMap` — final display rating per player (`MMR + XP`)
- `history: EloHistoryMap` — chronological rating history per player
- `deltas: Record<matchId, Record<playerId, number>>` — display rating change per player per match
- `detailed: Record<playerId, { r, rd, xp }>` — raw component breakdown

Key constants: `DEFAULT_RATING = 1200`, `DEFAULT_RD = 350`, `MMR_FLOOR = 1000`.

The engine is called via `aggregatePlayerStats()` in `core.ts`, which accepts optional `{ initialRatings }` for seeded season starts and re-exports all maps plus `stats`.

## Light Social Adjustments (Underdog Bonus)
A single surgical modifier applied inside `calculateGlickoHybridRatings` after the base Glicko delta and close-match dampening, before skill floor enforcement:

```ts
// Applied only on wins
let finalDelta = delta;
if (outcome === 1 && expected < 0.3) {
  finalDelta *= 1.2; // +20% underdog bonus
}
R[p] = Math.max(MMR_FLOOR, playerR + finalDelta);
```

- **Trigger**: Player wins a match where Glicko-calculated expected win probability is < 30%
- **Effect**: ΔR × 1.2 (hard-capped at +20%, no stacking)
- **Does NOT affect**: RD (uncertainty), XP/streak system, database schema, or losing players
- **Historical validation**: 23 triggers across 95 matches; top-player shifts +19 to +24 (non-inflationary)

## Rating Delta Badges
Delta badges are injected at the **page (server) level** and rendered in:
- `DesktopSessionDetails.tsx` — left of Team A name, right of Team B name
- `MobileSessionDetails.tsx` — right of each player name
- `MatchHistory.tsx` (player profile) — inline next to Win/Loss/Draw tag

Badge colours: emerald (`+`), rose (`-`), slate (`±0`).

## Season System Design
- **Soft Reset Formula**: `NEW_MMR = 1200 + (OLD_MMR − 1200) × 0.50`
- **Uncertainty Increase**: `NEW_RD = min(OLD_RD + 75, 350)`
- **Base MMR**: 1200 (user-specified)
- **Season affects**: MMR, RD, season rank, season wins/losses/games, season leaderboard
- **Season does NOT affect**: money owed, payments, purchases, session costs, balances
- **Admin action**: `endAndStartNewSeason()` in `src/lib/actions/seasons.ts` — atomic, double-confirmed

## Agent Tips
- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` is computed as `/${currentMode}` where `currentMode` is parsed from the first segment of the URL (either `admin-92Kf8s` or `view`).
- `src/components/player/PlayerCard.tsx` accepts `seasonEdition?: string` (e.g. `"Season 2 Edition"`) — defaults to `"Season 1 Edition"` if not passed.
- Match timestamps use `played_at || created_at` fallback everywhere; sort descending (`timeB - timeA`) for latest-first display.
- `deltas?.[matchId]?.[playerId]` is the safe-access pattern to read a player's rating change for any given match.
- `src/lib/actions/seasons.ts` contains all season server actions. Never call `endAndStartNewSeason()` without the admin double-confirmation UI.
- Season selector in dashboards: `"all-time"` ID = career stats, active season ID = current season, completed season ID = frozen snapshot from `season_player_results`.
- **PowerShell build**: Always use `npm.cmd run build` not `npm run build` on Windows due to script execution policy.

## Current Project Status
**Phase 89 complete (22 Aug 2026).** CockCount now features a **full competitive Season System** with soft MMR resets (base 1200, 50% compression), immutable historical snapshots, season-scoped leaderboards, and an Admin Season Management modal — all with complete financial isolation. Combined with the existing **Floor-Protected Glicko-Lite + Attendance Streak XP** ranking engine, **Underdog Bonus**, **Match Rating Deltas**, **FIFA-Style Player Cards** with dynamic season edition branding, and the **Synchronized User Guide**, CockCount is a feature-complete competitive badminton tracking platform. Production build verified (Exit code: 0, all 16 routes).

*"Because Shuttlecocks Aren't Free."*
