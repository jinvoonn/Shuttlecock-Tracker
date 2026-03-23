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

## Phase 58 — Global Search Removal
*   [x] **UI**: Removed functional and disabled search bars across Dashboard, Sessions, Stock, Payments, and Record modules on both desktop and mobile.
*   [x] **Logic**: Eliminated all `searchTerm`, `filteredX`, and `searchQuery` state dependencies for a cleaner, search-free experience.

## Phase 59 — Desktop Header Standardization
*   [x] **UI**: Standardized all 7 desktop page headers to a fixed `h-14` height with consistent `sticky top-0 z-50` styling.
*   [x] **Cleanup**: Removed the floating "SHUTTLE TRACKER" / "VIEW" text globally; maintained strict right-aligned placement for primary action buttons (Log New, Add Stock, Record Payment).

## Phase 60 — Lists Expand / Collapse Feature
*   [x] **UX**: Restrained long lists (Session History, Purchase History, Transaction Log) to a default 6 visible items to improve performance and scannability.
*   [x] **UI & Logic**: Implemented a responsive "Expand All ({count})" / "Collapse" toggle button tied to a local boolean `expanded` state across the 6 affected desktop and mobile files.

## Phase 61 — Session Inline Edit Modal
*   [x] **UI/UX**: Transitioned session editing functionality from a page-based approach to an inline modal, ensuring seamless operation on both mobile and desktop. Fixed the edit button's accessibility.
*   [x] **Logic**: Integrated `SessionForm` into the modal, allowing comprehensive editing of all session details, including players, directly from the session view.
*   [x] **Cleanup**: Removed outdated dedicated edit page routes (`/sessions/[id]/edit`), standardizing the UI with the app's modern design patterns.

## Phase 62 — Global Dark Mode Standardization (22 Mar 2026)
*   [x] **Enforcement**: Forced `dark` class on root `html` tag and updated `globals.css` with permanent slate-900/800 variables.
*   [x] **Cleanup**: Systematically stripped 50+ instances of `light:` prefixes and conditional theme logic from all components.
*   [x] **Consistency**: Replaced hardcoded light colors (white backgrounds, dark text) with the unified dark palette across all 19+ pages.

## Phase 63 — High-Fidelity Leaderboard Toggle
*   [x] **UI**: Replaced simple button toggles with a premium segmented pill-style control (`[ Wins ] [ Win Rate ]`).
*   [x] **Interaction**: Added `active:scale-95` micro-animations and emerald-400 highlighting for the active segment.
*   [x] **Scope**: Applied to both Global Dashboard and Session-level leaderboards.

## Phase 64 — Session Leaderboard
*   [x] **Feature**: Integrated a toggleable leaderboard directly into individual session pages to track performance per-session.
*   [x] **Logic**: Calculated Session-only Most Wins and Win Rate using localized match data.

## Phase 66 — Session Status Synchronization (23 Mar 2026)
*   [x] **Logic**: Implemented data-driven "Pending/Paid" status in the individual session page based on global player balances (Total Payments - Total Shares).
*   [x] **Revalidation**: Updated `payments.ts` server actions to use layout-wide revalidation (`revalidatePath("/", "layout")`) for real-time UI updates after settlement.

## Phase 67 — Centralized Analytics Engine
*   [x] **Architecture**: Designed and implemented a modular analytics engine in `src/lib/analytics/` with shared types, normalization, and core aggregation logic.
*   [x] **Integration**: Refactored both the Global Dashboard and the Individual Session page to consume the unified engine, eliminating ~150 lines of redundant code and ensuring metric consistency.
*   [x] **Standardization**: Unified win rate thresholds (min 3 games for global insights) and streak calculation across the platform.

## Phase 68 — CockRating Guide & Modal Removal (Today, 23 Mar 2026)
*   [x] **Dedicated Page**: Converted the "CockRating Walkthrough" modal into a premium page at `/[mode]/cockrating` to eliminate z-index and overlap bugs.
*   [x] **UI/UX**: Implemented Hero, Mechanics, Placement, and Rank Tier sections with high-fidelity styling.
*   [x] **Cleanup**: Removed `src/components/ui/CockRatingModal.tsx` and all legacy state logic.

## Phase 69 — Rank Accuracy & Navigation Refinements
*   [x] **Consistency**: Fixed ELO/Rank mismatch in Player Profile by fetching ALL matches for a globally accurate calculation.
*   [x] **Navigation**: Implemented history-aware "Back" buttons (`router.back()`) on the CockRating page with a safe fallback to the Dashboard.
*   [x] **Standardization**: Enforced "Name | 🐣 Unranked 3/5" or "Name | 🐓 CockMaster" format across profiles using centralized `getCockRank` logic.

## Phase 70 — Branding Refinement: ELO to CockRating/CR (Complete)
*   [x] **Dashboard**: Renamed leaderboard "ELO" toggle to "CR".
*   [x] **Dashboard**: Updated desktop leaderboard row suffix from "ELO" to "CR".
*   [x] **Player Profile**: Renamed "ELO" card label to "CR".
*   [x] **Player Profile**: Updated chart title to "CockRating Progression".
*   [x] **Guide Page**: Updated "ELO-Based Logic" and "ELO Bound" to "CockRating Logic" and "Rating Range".
*   [x] **Charts**: Standardized tooltip labels to show "CR" instead of "elo" using name props.

## Phase 71 — CockRating Tier Renaming (Complete)
*   [x] **Config**: Renamed `RANK_TIERS` in `rank.ts` to new tier names (Soft Chick, Rising Chick, Hard Hitter, Big Cock, Battle Cock, Alpha Cock).
*   [x] **Propagation**: Because the entire application uses `getCockRank` and maps over `RANK_TIERS`, updating `rank.ts` automatically applies changes consistently down to the Dashboard, Player Profile, Sessions, and CockRating Guide.

## Phase 72 — Rank Badge Icons (Complete)
*   [x] **Component Design**: Created `/components/ui/RankIcon.tsx` rendering Lucide-based icons with premium gradient/glow backgrounds, supporting standard sizes (`small`, `normal`, `large`).
*   [x] **System Update**: Removed legacy `icon` strings from `CockRank` structure in `rank.ts`.
*   [x] **Component Integration**: Updated `RankBadge.tsx`, `EloRatingCard.tsx`, and `cockrating/page.tsx` to mount `<RankIcon>` mapped by `rank.name`. Legacy emoji sizes dynamically translated into `RankIcon` sizing.
*   [x] **UI Polish**: Resolved badge vertical alignment by modifying compact badge padding and using 20px (`w-5 h-5`) dimension for `RankIcon` small size.

## Current State

The app is highly stable, featuring a **Centralized Analytics Engine** and a dedicated **CockRating Guide** system. All UI bugs related to modal layering have been resolved by moving to page-based education. Rankings are globally consistent across Dashboard and Profiles. Zero lint errors.

## Known Issues / Backlog

*   **Environment Variables**: `.env.local` requires real Supabase keys for public distribution.

## Roadmap & Next Steps

1.  **Placement Match System**: (Complete) Dynamic K-factor and Unranked state implemented.
2.  **Auto-Grouping**: Smart team generation based on skill ratings and partner history.
3.  **Settle Tracking**: Auto-suggest who pays what based on complex debt chains.
4.  **Performance**: Move heavy analytics to Supabase SQL Views for faster dashboard loads.


## Agent Tips

- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` is computed as `/${currentMode}` where `currentMode` is parsed from the first segment of the URL (either `admin-92Kf8s` or `view`).
