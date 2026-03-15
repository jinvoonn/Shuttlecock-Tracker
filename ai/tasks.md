# Project Tasks: Shuttle Tracker

## Completed Features (Phases 1–40)

*   [x] **Mobile Responsiveness Order**: Optimized all primary tracking pages for mobile.
*   [x] **Global Navigation Fix**: Standardized bottom navigation for mobile.
*   [x] **CRUD Operations Restored**: Inline editing for Stock, Payments, Sessions; functional Delete with confirmation.
*   [x] **Deployment Stability**: Resolved all Type/Lint errors; `npm run build` passes locally and on Vercel.
*   [x] **Log Match Restoration**: Restored submit button and implemented loading states.
*   [x] **Session Click-through Fixed**: `/[mode]/sessions/[id]` now loads correctly; Supabase query and page params corrected.
*   [x] **Match Column Fix**: Corrected all references from `player1_id/player2_id` → `team_a_player1` etc. to match actual schema.
*   [x] **TypeScript Build Stability**: Resolved all `any` type issues; zero lint errors across codebase.

## Phase 40 — Match Player Selection Overhaul (Today, 15 Mar 2026)

*   [x] **Unified Cycle-based Player Selection**: Both desktop and mobile Log Match now use a single `playerTeams: Record<string, number>` state with `cyclePlayer()` — `(current + 1) % 3` — instead of fragile two-array system.
    *   Affected: `desktop/RecordMatch.tsx`, `mobile/RecordMatch.tsx`, `SessionMatches.tsx`
*   [x] **No Team Size Cap**: Removed the `teamAIds.length >= 2` restriction. Supports 1v1, 2v2, 3v2, 3v3, any combo.
*   [x] **Correct Color System**: Team A = `sky-500`, Team B = `emerald-500`, Unselected = `slate-800`.
*   [x] **SessionMatches.tsx & AddMatchModal Fixed**: Rewrote both desktop entry points (inline card and modal) with the new cycle pattern to eliminate bugs on desktop.
*   [x] **Mobile Match Edit & Delete**: `mobile/SessionDetails.tsx` now has Pencil + Trash2 action buttons per match card, with an inline edit panel.
*   [x] **Server Action Payload Synchronization**: Rewrote `addMatch` and `updateMatch` in `lib/actions/matches.ts` to accept `teamAIds[]`/`teamBIds[]` arrays from all 5 match entry points.

## Phase 41 — Stock UI & Purchase Logs Improvements
*   [x] **Server Actions**: Update `editPurchase` to support partial updates (without requiring `brand_id`).
*   [x] **Stock Page Data**: Update `activeTubes` mapping to include `pricePerTube` and `pricePerCock`.
*   [x] **Desktop UI**: Add inline Edit/Delete to Active Tubes. Wire History Edit/Delete placeholders.
*   [x] **Mobile UI**: Remove Tube ID and add Cost/Shuttle to Active Tubes. Fix History inline edit form (add Edit/Delete to Active Tubes).

## Phase 42 — Session Log Tube Selection Redesign
*   [x] **SessionForm.tsx UI**: Redesign Shuttlecock Usage row into Premium Dark interactive cards.
*   [x] **SessionForm.tsx Data**: Add prominent Cost per Tube and Cost per Shuttle metrics.
*   [x] **SessionForm.tsx UX**: Add `border-emerald-400 bg-emerald-900/10` dynamic highlighting when tube is selected.

## Current State

The app is stable. All match CRUD operations (add, edit, delete) work on both desktop and mobile. Zero lint errors.

## Known Issues / Backlog

*   **Asset Placeholders**: Hero images use hardcoded Google URLs.
*   **Environment Variables**: `.env.local` requires real Supabase keys.
*   **Session revalidation**: `revalidatePath` covers `/` and `/sessions`; dynamic session detail paths (`/sessions/[id]`) may need explicit revalidation if changes don't propagate.

## Roadmap & Next Steps

1.  **Analytics**: Charts for monthly spending and usage trends.
2.  **Auto-Grouping**: Smart team generation based on skill ratings and partner history.
3.  **Player Profiles**: Win rates, H2H records, best partner analytics.
4.  **Settle Tracking**: Auto-suggest who pays what based on debt.
5.  **Performance**: Move heavy analytics to Supabase SQL Views.

## Agent Tips

- `lib/actions/matches.ts` is the single source of truth for match mutations. It now expects `{ teamAIds: string[], teamBIds: string[], scoreA: number, scoreB: number, sessionId: string }`.
- The 4 player columns in the matches table are: `team_a_player1`, `team_a_player2`, `team_b_player1`, `team_b_player2`.
- `stitch-designs/` contains the presentational components. `app/[mode]/` contains the routing and data-fetching pages.
- Do NOT modify the database schema.
