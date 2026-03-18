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

## Phase 43 — Session Tube Cost Displays
*   [x] **Server Actions**: Update Supabase queries in `log/page.tsx` and `edit/page.tsx` to select & map `price_per_tube`.
*   [x] **Desktop UI**: Update `DesktopSessions.tsx` to handle `price_per_tube` prop and show Cost per Tube + Cost per Shuttle prominently.
*   [x] **Mobile UI**: Update `MobileLogSessions.tsx` to handle `price_per_tube` prop and show Cost per Tube + Cost per Shuttle prominently.

## Phase 44 — Payment Ledger Edit/Delete Functional Wire-up
*   [x] **Database Schema**: Add `note` (text) column to `payments` table in Supabase.
*   [x] **Server Actions**: Update `editPayment`, `addPayment`, and `deletePayment` in `payments.ts` to support the `note` field. Update the SELECT queries in `payments/page.tsx` to pull `note`.
*   [x] **Desktop UI**: Wire up inline Edit/Delete functions in `DesktopPaymentLedger.tsx`. Ensure "Record Payment" link points to `/payments/record-transaction`. Add `note` support.
*   [x] **Mobile UI**: Update inline Edit form in `MobilePaymentLedger.tsx` to support the new `note` field.

## Phase 45 — Mobile Dashboard Fixes
*   [x] Remove unused buttons (bell and settings)
*   [x] Wire up player cards to navigate to their profiles
*   [x] Remove Elite Status badge/text
*   [x] Adjust bottom navigation tab thickness to match other mobile pages (h-24)

## Phase 46 — Mobile Dashboard Player Click Issue
*   [x] Fix 404 error when clicking player card by using `/players/[id]` instead of `/player/[id]`

## Phase 47 — Mobile App Theme Unification
*   [x] Replace `sky` accents with `emerald` in Stock page
*   [x] Replace `sky` accents with `emerald` in Player Profile
*   [x] Verify backgrounds use `bg-slate-900` and cards use `bg-slate-800` on all mobile pages

## Phase 48 — Player Profile Stats & Partner Analytics
*   [x] **Logic**: Implement "Best Partner" and "Sadge Partner" (lowest win rate) calculation in `players/[id]/page.tsx`.
*   [x] **UI**: Add win-streak display card and partner stats section to the profile summary.

## Phase 49 — Unified Branding & Global Logo
*   [x] **Design**: Standardize gradient `Feather` icon (indigo-500 to sky-600) and "CockCount" branding.
*   [x] **Implementation**: Update logo and tagline ("Because Shuttlecocks Aren’t Free") across all 19+ pages and forms.

## Phase 50 — mobile layout cleanup
*   [x] **UI**: Remove unused Search and Add icons from Sessions and Stock headers on mobile.

## Phase 51 — Session Permissions Refinement (RBAC)
*   [x] **Logic**: Restrict session Create/Edit/Delete to Admins only.
*   [x] **Security**: Implement server-side role validation in session actions.
*   [x] **Consistency**: Ensure match management remains open to all users.

## Phase 52 — Dashboard Statistics Row
*   [x] **Logic**: Implement complex server-side calculation for Most Wins, Best Win Rate, Longest Win Streak, Best Duo, and Most Cursed Duo.
*   [x] **UI**: Add horizontal scrollable stats row at the top of the Dashboard (Mobile & Desktop).
*   [x] **UX**: Add `scrollbar-hide` utility for a clean mobile swipe experience.

## Phase 54 — Analytics Trends & Asset Cleanup
*   [x] **Monthly Trends**: Integrated `recharts` for spending (AreaChart) and usage (BarChart). Computed 6 months of historical data server-side.
*   [x] **Mobile UX**: Added chart toggles for a cleaner layout on small screens.
*   [x] **Premium Assets**: Replaced placeholder hero images with cinematic, AI-generated badminton court backgrounds (`/public/badminton-hero-v2.png`).

## Phase 55 — Mobile Functional Fixes
*   [x] **Direct Settle**: "Settle" button on Dashboard now executes `quickSettle` server action immediately (disabled if balance is zero).
*   [x] **Payment Fix**: Corrected redirect and saving logic in `RecordTransaction.tsx`; ensured `mode` is passed for proper auth.

## Phase 56 — UI/UX Improvements
*   [x] **Sessions FAB**: Moved session creation button to an emerald Floating Action Button (FAB) at the bottom right, matching the Payments UI.
*   [x] **Chart Interaction**: Suppressed parent click events on charts using `stopPropagation` to prevent accidental navigation.

## Phase 57 — Critical Fixes
*   [x] **Submission Redirect**: Corrected 404 error in `LogSessions.tsx` by using dynamic `basePath` for post-submission routing.
*   [x] **Focus Suppression**: Removed focus rings, outlines, and text selection effects from charts for a cleaner "static" feel.

## Current State

The app is highly stable and verified with successful production builds. Analytics are functional, branding is premium, and the mobile UX is refined with consistent action patterns. Zero lint errors.

## Known Issues / Backlog

*   **Environment Variables**: `.env.local` requires real Supabase keys for public distribution.
*   **Session revalidation**: Dynamic session detail paths (`/sessions/[id]`) may need explicit revalidation if match changes don't propagate immediately.

## Roadmap & Next Steps

1.  **Auto-Grouping**: Smart team generation based on skill ratings and partner history.
2.  **Settle Tracking**: Auto-suggest who pays what based on complex debt chains.
3.  **Performance**: Move heavy analytics to Supabase SQL Views for faster dashboard loads.
4.  **Advanced Match Filters**: Search matches by player name or date range.

## Agent Tips

- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` is computed as `/${currentMode}` where `currentMode` is parsed from the first segment of the URL (either `admin-92Kf8s` or `view`).
