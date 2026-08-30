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
- **Asymmetric Soft Reset Formula**:
  - If $\text{OLD\_MMR} > 1200$: $\text{NEW\_MMR} = \max(1200, 1200 + (\text{OLD\_MMR} - 1200) \times 0.50)$
  - If $\text{OLD\_MMR} \le 1200$: $\text{NEW\_MMR} = \text{OLD\_MMR}$ (no free lifts or drops)
- **Uncertainty Increase**: $\text{NEW\_RD} = \min(\text{OLD\_RD} + 75, 350)$ (allows fast mobility with early season wins)
- **Base MMR**: 1200 (user-specified)
- **Custom Season Start Date**: Admin modal allows selecting any official calendar start date for Season $N+1$.
- **Safe Rollback**: `rollbackToPreviousSeason()` allows admins to cleanly undo a season transition provided the active season has $0$ recorded matches.
- **Historical Season Badges**: Displayed dynamically on player bio headers from immutable `season_player_results` (🥇 S1 Champion, 🥈 S1 Runner-Up, 🥉 S1 3rd Place, S1 Top 5).
- **Season affects**: MMR, RD, season rank, season wins/losses/games, season leaderboard
- **Season does NOT affect**: money owed, payments, purchases, session costs, balances
- **Admin action**: `endAndStartNewSeason(startDate?)` in `src/lib/actions/seasons.ts` — atomic, double-confirmed
- **Resilient UI**: The Leaderboard card and Season Settings button render unconditionally in admin mode with empty-state indicators and fallback-safe season dropdowns.

## Architecture & Calculations Engine (Phase 92)
- **Centralized Balance Calculations**: [`src/lib/calculations/balance.ts`](file:///c:/Users/jinvo/OneDrive/Documents/Antigravity/Shuttlecocks/shuttle-tracker/src/lib/calculations/balance.ts) provides pure, testable functions (`calculateSessionCosts`, `calculateSessionAttendeeCounts`, `calculateAllPlayerBalances`) ensuring financial numbers are 100% consistent across Dashboard, Player Profiles, and Payments.
- **Server Action Authorization**: [`src/lib/auth.ts`](file:///c:/Users/jinvo/OneDrive/Documents/Antigravity/Shuttlecocks/shuttle-tracker/src/lib/auth.ts) implements `assertAdmin(mode?, actionName?)` guarding mutations across sessions, purchases, and payments with fallback to request headers.
- **Unified Routing Hook**: [`src/hooks/useAppRoute.ts`](file:///c:/Users/jinvo/OneDrive/Documents/Antigravity/Shuttlecocks/shuttle-tracker/src/hooks/useAppRoute.ts) provides `{ basePath, currentMode, isAdmin, getRoute }` eliminating string-splitting route fragmentation.
- **Database Types**: [`src/types/database.ts`](file:///c:/Users/jinvo/OneDrive/Documents/Antigravity/Shuttlecocks/shuttle-tracker/src/types/database.ts) mirrors `schema_v2.sql`.

## Viewer PIN Unlock & Granular Permissions (Phase 93)
- **3-State Permission Model**:
  - `Admin` (`/admin-92Kf8s`): Full unrestricted administrative access.
  - `Viewer Locked` (`/view`): Default read-only browsing experience.
  - `Viewer Unlocked` (`/view` + PIN): 60-minute temporary unlock granting only configured permissions (`LOG_MATCH`, `EDIT_MATCH`, `DELETE_MATCH`).
- **Security Architecture**:
  - PINs are hashed using **bcryptjs** and stored in `viewer_settings.pin_hash`. Plaintext PINs are never returned to clients.
  - Verification issues an **HTTP-only, Secure, SameSite=Lax signed cookie** (`cockcount_viewer_unlock`) with HMAC-SHA256 signature and 60-minute expiration.
  - Server actions call `assertAdminOrViewerPermission(permission)` to enforce server-side validation on every mutation.
- **UI Components & Modals**:
  - `ViewerUnlockButton`: Displays `🔒 Unlock` (opens PIN modal) or `🔓 Unlocked` (with click-to-lock popover), supporting an `icon` variant placed discreetly in the top-right header on mobile.
  - `ViewerPinModal`: Masked numeric input with error feedback and auto-refresh.
  - `ViewerAccessModal`: Admin panel under `/admin` to change PIN and toggle granular permission checkboxes.
  - **Portal Teleportation**: All modal dialogs (`ViewerPinModal`, `ViewerAccessModal`, session popups) mount via `createPortal(..., document.body)` to escape CSS transform/filter containing-blocks on headers, guaranteeing viewport centering.

## Agent Tips
- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` and `currentMode` are resolved via `useAppRoute()` hook in `src/hooks/useAppRoute.ts`. Do NOT use `pathname.split('/')[1]` manually in new components.
- Admin role is enforced server-side via `assertAdmin(mode?, actionName?)` in `src/lib/auth.ts`.
- Viewer permissions are enforced server-side via `assertAdminOrViewerPermission(permission, mode?, actionName?)` in `src/lib/auth.ts`.
- **Server Action Coverage**: ALL 9 viewer permissions are now wired end-to-end: `LOG_MATCH` / `EDIT_MATCH` / `DELETE_MATCH` (matches.ts), `EDIT_SESSION` / `DELETE_SESSION` (sessions.ts), `EDIT_STOCK` / `DELETE_STOCK` (purchases.ts), `EDIT_PAYMENT` / `DELETE_PAYMENT` (payments.ts).
- **UI Permission Pattern**: Always use `canPerform(VIEWER_PERMISSIONS.X)` (not `isAdmin`) to gate edit/delete buttons that have corresponding viewer permissions. Use `isAdmin` ONLY for admin-exclusive features (e.g., PIN config, season resets, adding new sessions/payments/stock).
- Balance calculations live exclusively in `src/lib/calculations/balance.ts`. Do NOT duplicate session cost or share logic anywhere else.
- `src/types/database.ts` contains TypeScript interfaces for all 12 Supabase tables — use these instead of `any[]` in new code.
- `src/components/player/PlayerCard.tsx` accepts `seasonEdition?: string` (e.g. `"Season 2 Edition"`) — defaults to `"Season 1 Edition"` if not passed.
- Match timestamps use `played_at || created_at` fallback everywhere; sort descending (`timeB - timeA`) for latest-first display.
- `deltas?.[matchId]?.[playerId]` is the safe-access pattern to read a player's rating change for any given match.
- `src/lib/actions/seasons.ts` contains all season server actions. Never call `endAndStartNewSeason()` without the admin double-confirmation UI.
- Season selector in dashboards: `"all-time"` ID = career stats, active season ID = current season, completed season ID = frozen snapshot from `season_player_results`.
- **PowerShell build**: Always use `npm.cmd run build` not `npm run build` on Windows due to script execution policy.
- Scratch/migration scripts live in `/scripts` (not `src/`). The `src/` directory is now clean.

## Current Project Status
**Phase 93 complete + Permission Wiring Fixed (30 Aug 2026).** CockCount features a fully end-to-end **secure 3-state permission model** (Admin, Viewer Locked, Viewer Unlocked via bcrypt-hashed PIN & HMAC-signed session cookies). All 9 granular permissions (`LOG_MATCH`, `EDIT_MATCH`, `DELETE_MATCH`, `EDIT_SESSION`, `DELETE_SESSION`, `EDIT_STOCK`, `DELETE_STOCK`, `EDIT_PAYMENT`, `DELETE_PAYMENT`) are now enforced both server-side (via `assertAdminOrViewerPermission`) and in the UI (via `canPerform()`). An Admin Viewer Access panel allows toggling permissions, and unlocked viewers see exactly the actions the admin has enabled.

Layered on top of the full **Asymmetric Soft Reset Season System** ($\text{MMR} > 1200$ compresses towards 1200; $\text{MMR} \le 1200$ preserved), historical Season Finish Badges, immutable season snapshots, season-scoped leaderboards, **Floor-Protected Glicko-Lite + Attendance Streak XP** ranking engine, **Underdog Bonus**, **Match Rating Deltas**, and **FIFA-Style Player Cards**. Production build verified (Exit code: 0, all 16 routes, Turbopack).

*"Because Shuttlecocks Aren't Free."*

