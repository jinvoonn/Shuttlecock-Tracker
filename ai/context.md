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
*   **Leaderboards**: Global and Session-level leaderboard with toggleable segmented controls.
*   **Premium Gaming UI**: High-contrast "Obsidian" score pills, rank trophy icons, and player avatars.
*   **FIFA-Style Player Card**: Collectible identity card on each player's profile with 4 visual tiers (Bronze/Silver/Gold/Elite) mapped to CR score. Future-proofed for hero images via `avatar_url`.
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

## Database Schema (Key Tables)
*   **`matches`**: `id`, `session_id`, `team_a_player1`, `team_a_player2`, `team_b_player1`, `team_b_player2`, `team_a_score`, `team_b_score`, `played_at`, `created_at`
*   **`sessions`**: `id`, `date`, `start_time`, `location`, `created_at`
*   **`players`**: `id`, `name` (future: `avatar_url` for Player Card hero images)
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
  playedAt?: string; // ISO timestamp
}
```

The action maps `teamAIds[0]` → `team_a_player1`, `teamAIds[1]` → `team_a_player2`, etc.

## Agent Tips
- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` is computed as `/${currentMode}` where `currentMode` is parsed from the first segment of the URL (either `admin-92Kf8s` or `view`).
- `src/components/player/PlayerCard.tsx` is the Player Card component. Pass `player` (id, name, avatar_url?) and `stats` (elo, winRate, wins, streak, placementMatchesPlayed). Tier is auto-computed.
- Match timestamps use `played_at || created_at` fallback everywhere; sort descending (`timeB - timeA`) for latest-first display.

## Current Project Status
**Phase 85 in progress (23 May 2026).** App features **Explicit Time Tracking**, **Live Leaderboard Updates**, **Premium Gaming UI**, **FIFA-Style Player Cards**, and **Public IG Story Generation**. We have critically designed and simulated a **Floor-Protected Glicko-Lite + Attendance Streak XP** ranking architecture to replace the legacy Elo system. Implementation phase is pending user approval.

*"Because Shuttlecocks Aren't Free."*
