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

## Phase 72 — Emoji Rank Indicators Reversion (Complete)
*   [x] **Config Update**: Centralized a `rankEmojiMap` inside `rank.ts` and created the `getRankEmoji(rank)` helper. Re-added strictly mapped emojis.
*   [x] **Component Teardown**: Deleted the `RankIcon.tsx` component to enforce simplicity and resolve complex dependencies.
*   [x] **System Integration**: Rewired `RankBadge.tsx`, `EloRatingCard.tsx`, and `cockrating/page.tsx` to mount standard `<span>{getRankEmoji(rank.name)}</span>` across both full and compact views.

## Phase 73 — Live Leaderboard Updates & Animations (Today, 23 Mar 2026)
*   [x] **CSS Animations**: Added `moveUp`, `moveDown`, `promotionFlash`, and `demotionFlash` keyframes to `globals.css` for cinematic rank movement.
*   [x] **Global Sync**: Implemented `MatchesContext.tsx` and `ClientProviders.tsx` to provide real-time Supabase match subscriptions across the entire app.
*   [x] **Optimistic UI**: Updated `SessionMatches.tsx` and `RecordMatch.tsx` to use `addOptimisticMatch`, updating the leaderboard instantly before DB confirmation.
*   [x] **Dashboard Reactivity**: Created `DashboardClient.tsx` to handle live recomputation of ELO, win rates, and rank changes without page refreshes.

## Phase 74 — Deployment & Build Optimization (Today, 23 Mar 2026)
*   [x] **Server-side Safety**: Removed blocking database fetches from `RootLayout` and `DashboardPage` to prevent Vercel build hangs; added `force-dynamic` to layout.
*   [x] **Client-side Hydration**: Shifted initial match fetching to `MatchesProvider` `useEffect` to ensure a lightweight, static-friendly build shell.
*   [x] **Code Splitting**: Implemented `next/dynamic` for `MobileDashboard` and `DesktopDashboard` to reduce memory pressure during production builds.

## Phase 75 — Global Loading System & Stuck Loader Fix (28 Mar 2026)
*   [x] **Bug Fix**: Moved the `setIsLoading(false)` listener to the root `GlobalLoader` component, ensuring navigation always kills the loader.
*   [x] **UI**: Updated the loading screen to a premium dark design with a centered animated feather logo and progress bar.

## Phase 76 — Premium Leaderboard UI Overhaul
*   [x] **Layout**: Restructured leaderboard rows to feature a Rank Number box on the left and a scaled "Trophy" `RankBadgeIcon` on the far right.
*   [x] **Visuals**: Implemented the "Obsidian" Score Pill — a high-contrast black capsule with fixed width for perfect vertical alignment of stats (CR, Wins, Rate).
*   [x] **Avatars**: Added initial-based player avatars next to usernames for a personalized gaming feel.

## Phase 77 — Rank Delta & Snapshot System
*   [x] **Logic**: Verified and standardized the weekly `leaderboard_snapshots` comparison logic.
*   [x] **UI**: Integrated rank change indicators (Promotion 🔼, Demotion 🔻, New ✨) directly into the new leaderboard row layout.
*   [x] **Animations**: Synchronized `animate-moveUp` and `animate-promotionFlash` with real-time match results.

## Phase 78 — Session Story Card Generator (Sticker Mode)
*   [x] **Design**: Developed a minimalistic Strava-inspired IG Story (9:16) card with large, bold metrics.
*   [x] **Logic**: Automated calculation of Session MVP, Longest Win Streak, and "Most Cursed" player.
*   [x] **Feature**: Implemented "Sticker Mode" toggle for transparent PNG exports, allowing users to layer stats over court photos.
*   [x] **RBAC**: Implemented conditional watermarking — `cockcount.vercel.app` URL only appears on Admin-generated stories; Viewers get a clean sticker.
*   [x] **Public Access**: Opened the Story generator to all users (Admins + Viewers) while maintaining role-based watermark logic.
*   [x] **Tech**: Integrated `html-to-image` for high-res (3x pixel ratio) mobile exports.

## Phase 79 — Branding & Domain Migration
*   [x] **SEO**: Updated `src/lib/seo.ts` to reflect the new production domain `cockcount.vercel.app`.
*   [x] **Branding**: Updated Story Card footer and global watermarks to the new domain.

## Phase 81 — Match & Session Time Tracking & Win Streak Fix (29 Mar 2026)
*   [x] **Database Schema**: Updated `matches` to include `played_at` (timestamptz) and `sessions` to include `start_time` (timestamptz).
*   [x] **Server Actions**: Updated `addMatch`, `updateMatch`, `addSession`, and `editSession` to handle explicit timestamps.
*   [x] **Analytics**: Refactored `src/lib/analytics/core.ts` to sort matches by `playedAt` instead of `createdAt`, fixing win streak inaccuracies for out-of-order logging.
*   [x] **UI/UX**: Added time selection (HTML5 time input) to `RecordMatch` (Desktop/Mobile) and `SessionForm` (Session Log/Edit).
*   [x] **Data Flow**: Ensured `played_at` and `start_time` are fetched and passed through all relevant page and component layers.

## Phase 82 — Match Sorting & Timezone Fix (29 Mar 2026)
*   [x] **Bug Fix**: Fixed timezone shift bug in `RecordMatch` (Desktop & Mobile) and `AddMatchModal` — time inputs were incorrectly treating local time as UTC, causing an 8-hour shift in stored timestamps.
*   [x] **Time Construction**: Refactored all recording components to build timestamps using `${sessionDate}T00:00:00` + `setHours()` to preserve local time as the correct UTC value.
*   [x] **Match Sorting**: Implemented latest-first descending sort (`timeB - timeA`) on the matches array in `src/app/[mode]/sessions/[id]/page.tsx` and `SessionMatches.tsx` using `played_at || created_at` as fallback.
*   [x] **Session Header**: Updated Session Details header to display `start_time` with fallback to `created_at` instead of a generic "12:00 AM".
*   [x] **TypeScript**: Added `created_at` to the match mapping object in `page.tsx` to resolve build-time type error.

## Phase 83 — FIFA-Style Player Card System (29 Mar 2026)
*   [x] **Component**: Created `src/components/player/PlayerCard.tsx` — a premium collectible-style identity card with 4 visual tiers (Bronze / Silver / Gold / Elite) auto-selected by CR score.
*   [x] **Tier Logic**: Maps player elo to rank tiers consistent with `rank.ts` — Soft Chick / Rising Chick / Hard Hitter / Big Cock / Battle Cock / Alpha Cock / CockMaster.
*   [x] **Visual Effects**: Tier-specific glow, holographic shine animation, glassmorphism gradients, and `Lexend` typography.
*   [x] **Future-Proof**: Includes an `avatar_url` prop and stylized placeholder (User icon + styled cutout) ready for future hero image support without schema changes.
*   [x] **Integration**: Replaced the generic profile header in `src/app/[mode]/players/[id]/page.tsx` with the Player Card as the hero element. Maintained "Official Bio", Best Synergy badge, and Season tags as the companion sidebar.
*   [x] **Responsive**: Card is centered on mobile (portrait), side-by-side with bio on desktop.

## Phase 84 — Multi-Card Story System: Design Phase (29 Mar 2026, In Progress)
*   [x] **Concept**: Designed a second story card — a **Podium Card** — for the session story share feature showcasing Top 3 players by wins.
*   [x] **3 Podium Concepts Explored**: Classic Podium (elevated #1), Card Stack (vertical ranked rows), and Minimal Premium (typographic standings).
*   [x] **Strava-Inspired Redesign**: Redesigned both a Light and Dark variant using Strava's activity-card language — signature orange `#FC4C02`, clean 2-zone layout (MVP hero stat + segment podium), Instagram Story 9:16 ratio.
*   [ ] **PodiumCard Component**: Create `src/components/story/PodiumCard.tsx` (pending user design approval).
*   [ ] **Carousel Integration**: Update `StoryPreviewModal.tsx` to horizontal snap-scroll carousel (`overflow-x-auto snap-x snap-mandatory`).
*   [ ] **Download UX**: Implement per-card download buttons so each card in the story can be saved individually.

## Phase 85 — CockCount Ranking Architecture Overhaul (23 May 2026, Complete)
*   [x] **Critical Redesign Audit**: Audited legacy zero-sum Elo engine (`src/lib/analytics/elo.ts`) and identified critical closed-pool pitfalls (Elo deflated point traps, same-opponent farming, inactive inflation, severe close-match deuce punishment).
*   [x] **Formulate Proposals**: Engineered 4 design approaches balancing professional skill metrics with casual gaming motivation (Glicko-Lite, Seasonal RP + floors, Diminishing H2H, and XP Progression).
*   [x] **Database & Replay Simulation**: Programmed a Node.js simulator replaying all 18 players and 95 chronological matches from Supabase.
*   [x] **Consistency Streak System**: Designed a soft-decay attendance streak system ($+1$ for attending, $-2$ for missing sessions) to scale progression XP.
*   [x] **Floor Protected MMR**: Designed a Glicko-Lite background MMR system with a hard skill floor of `1000`, leveraging accumulated consistency XP to lift low-tier players above the floor (rescuing Jang Zhe and Huai Zhou).
*   [x] **Close-Match Protection**: Designed 70% MMR dampening on deuces/close margins ($\le 2$).
*   [x] **Ranking Engine Integration**: Implemented `src/lib/analytics/rankingEngine.ts` containing the unified floor-protected Glicko-Lite + Streak XP logic.
*   [x] **Integrate Core Analytics**: Wired `rankingEngine.ts` into `src/lib/analytics/core.ts` and standard page controllers via `calculateGlickoHybridRatings`.
*   [x] **Session ID Support**: Added `sessionId` to `NormalizedMatch` type and normalization pipeline for session-grouped streak processing.
*   [x] **Production Build Verified**: Full `npm run build` passed (Exit code: 0).

## Phase 86 — Match-by-Match Rating Delta Indicators (23 May 2026, Complete)
*   [x] **Engine Enhancement**: Extended `calculateGlickoHybridRatings` in `rankingEngine.ts` to capture display rating before and after each match and compute `delta = newRating - oldRating` per player per match.
*   [x] **Return Type Expansion**: Updated return type to include `deltas: Record<string, Record<string, number>>` (keyed by `matchId → playerId → delta`).
*   [x] **Analytics Propagation**: Updated `aggregatePlayerStats` in `core.ts` to destructure and re-export `deltas` alongside `stats`, `elo`, and `eloHistory`.
*   [x] **Session Page Integration**: Updated `app/[mode]/sessions/[id]/page.tsx` to retrieve `globalDeltas` and inject `ratingDelta` into every player in `teamAPlayers` and `teamBPlayers`.
*   [x] **Player Profile Integration**: Updated `app/[mode]/players/[id]/page.tsx` to inject `ratingDelta: deltas?.[m.id]?.[id]` for the profile player into `formattedMatches`.
*   [x] **Desktop UI**: Updated `DesktopSessionDetails.tsx` — delta badge renders **left of player name** for Team A, **right of player name** for Team B using colour-coded glowing pills.
*   [x] **Mobile UI**: Updated `MobileSessionDetails.tsx` with matching delta badges inline after each player name.
*   [x] **Player Profile UI**: Updated `MatchHistory.tsx` — delta badge renders alongside the Win/Loss/Draw tag on every match card.
*   [x] **Badge Design**: `+N` = emerald green, `-N` = rose red, `±0` = muted grey. Consistent `font-mono` formatting across all views.
*   [x] **Production Build Verified**: Full `npm run build` passed (Exit code: 0, all 17 routes compiled).

## Phase 87 — Light Social Adjustments (23 May 2026, Complete)
*   [x] **Mismatch Fairness Analysis**: Conducted a deep mathematical analysis of how forced mismatches in a small recurring 8-person pool over-penalise strong players (asymmetric risk/reward trap where a single upset wipes out 10–15 expected wins).
*   [x] **Design Proposals**: Authored a research report evaluating 4 alternative approaches: Dynamic K-Factor, Score-Margin Dampening, Adaptive Win/Loss Clamps, and the full Hype Hybrid.
*   [x] **Simulation Harness**: Built multiple Node.js simulation scripts replaying all historical Supabase matches chronologically to compare Baseline vs. proposed systems.
*   [x] **Mentor Carry Modifier (Evaluated & Removed)**: Implemented and simulated a +10% carry bonus for strong players paired with weaker teammates (gap > 150). Included anti-farming safeguards (session-scoped partner + opponent tracking Sets). Removed after user review to keep the system minimal and eliminate teammate farming vectors.
*   [x] **Underdog Modifier (Shipped)**: Surgically injected a +20% rating gain multiplier (ΔR × 1.2) for unexpected match victories where Glicko-calculated win probability is < 30%. Applied after base delta calculation and close-match dampening, before skill floor enforcement.
*   [x] **System Insulation**: Verified that the modifier does not touch confidence (RD), database schemas, or the attendance streak XP system.
*   [x] **Historical Replay Validation**: Confirmed 23 underdog triggers across all historical matches, with top-player rating shifts of only +19 to +24 (non-inflationary) and high-impact upset players like Yuzhi gaining +63 (correctly rewarded).
*   [x] **Production Build Verified**: Full `npm run build` passed cleanly (Exit code: 0).

## Phase 88 — System Consistency & Guide Synchronization (23 May 2026, Complete)
*   [x] **Audit Engine codebase**: Audited the live `rankingEngine.ts` to map exactly what social adjustments and scaling elements are mathematically functional (MMR, dynamic uncertainty $RD$, close-match deuce damping, Streak XP, and Underdog wins).
*   [x] **Align Documentation**: Overhauled the user guide page (`cockrating/page.tsx`) to match actual codebase behavior perfectly.
*   [x] **Terminology Simplification**: Refactored the copy to utilize simple "MMR" instead of complex "Glicko-Lite MMR" and dynamic "Certainty/Volatility" indicators rather than fixed linear K-factor tables.
*   [x] **Insulate Social Modifiers**: Documented the actual active modifiers (Underdog + Streak XP) while explicitly omitting carry modifiers, ensuring 100% security alignment.
*   [x] **Interactive Scenario Board**: Integrated a walk-through section containing 4 high-fidelity gaming scenarios (Balanced Battle, Nail-Biter deuce damping, Underdog Giant Slayer boost, and Attendance Streak XP cushions) to give players a concrete, realistic understanding of ELO shifts.
*   [x] **Production Build Verified**: Confirmed successful static compile of `/cockrating` route and entire site with `Exit code: 0`.

## Phase 89 — Robust Season System (22 Aug 2026, Complete)

*   [x] **Database Migration**: Created `public.seasons` (`id`, `season_number`, `name`, `status`, `start_date`, `end_date`, `config`) and `public.season_player_results` (immutable end-of-season snapshots with unique constraint `(season_id, player_id)`). Added `season_id` FK to `public.matches`. Migrations stored in `season_schema.sql` and `schema_v2.sql`.
*   [x] **Season Analytics Module** (`src/lib/analytics/season.ts`): Defined `Season`, `SeasonPlayerResult`, `SeasonConfig` interfaces. `DEFAULT_SEASON_CONFIG`: `BASE_MMR = 1200`, `RESET_FACTOR = 0.50`, `RD_INCREMENT = 75`, `MAX_RD = 350`, `MMR_FLOOR = 1000`. Pure `calculateSoftResetRatings` function (no side effects).
*   [x] **Ranking Engine Updates** (`rankingEngine.ts`, `core.ts`, `normalize.ts`, `types.ts`): Added `seasonId` to `NormalizedMatch`. `calculateGlickoHybridRatings` and `aggregatePlayerStats` accept optional `initialRatings` (seeded from previous season's soft reset).
*   [x] **Server Actions** (`src/lib/actions/seasons.ts`): `getActiveSeason()` (auto-seeds Season 1 fallback), `getAllSeasons()`, `getSeasonPlayerResults(seasonId)`, and atomic `endAndStartNewSeason()` (snapshots → completes season → creates Season N+1, zero financial touch). Updated `addMatch` in `matches.ts` to tag new matches with `season_id`.
*   [x] **Admin Season Modal** (`src/components/admin/SeasonAdminModal.tsx`): Double-confirmation workflow, active season stats, soft reset preview (1800→1500, 1600→1400 examples), financial isolation guarantee. "Season Settings" amber button in leaderboard header.
*   [x] **Desktop Dashboard** (`stitch-designs/desktop/Dashboard.tsx`): Season selector `<select>` dropdown with `(Current)` / `(Final Standings)` / `All-Time (Career)` options. "Season Settings" admin button (Trophy icon, amber styling). Added season props (`seasons`, `activeSeason`, `selectedSeasonId`, `onSelectSeason`, `onOpenSeasonModal`).
*   [x] **Mobile Dashboard** (`stitch-designs/mobile/Dashboard.tsx`): Same season props. Two-row leaderboard header: title + admin button on top row; compact season dropdown + mode pills on second row.
*   [x] **DashboardClient** (`src/components/DashboardClient.tsx`): Handles season selection state, seeds initial MMR from previous season's soft reset for Season > 1, filters active-season matches, mounts `SeasonAdminModal`.
*   [x] **Dashboard Page** (`src/app/[mode]/page.tsx`): Fetches `seasons` and `season_player_results` server-side and passes to `DashboardClient`.
*   [x] **PlayerCard** (`src/components/player/PlayerCard.tsx`): Added `seasonEdition?: string` prop (defaults to `"Season 1 Edition"`). Footer renders the prop dynamically.
*   [x] **Player Profile Page** (`app/[mode]/players/[id]/page.tsx`): Fetches active season from DB with graceful fallback. Passes `seasonEdition` to `PlayerCard`. "Season N Active" badge is now dynamic.
*   [x] **Soft Reset Formula**: `NEW_MMR = 1200 + (OLD_MMR − 1200) × 0.50`, `NEW_RD = min(OLD_RD + 75, 350)`. Base = 1200 per user specification.
*   [x] **Financial Isolation**: Money owed, payments, purchases, session costs — 100% untouched by season transitions.
*   [x] **Snapshot Immutability**: Historical seasons render frozen rows from `season_player_results` directly; ranks never shift after a season closes.
*   [x] **Production Build Verified**: Full `npm run build` passed cleanly (Exit code: 0, all 16 routes compiled).

## Phase 90 — Season UI Resiliency & Admin Access Enhancements (29 Aug 2026, Complete)

*   [x] **Unconditional Leaderboard Header Rendering**: Removed the outer `leaderboard && leaderboard.length > 0` condition from both desktop and mobile dashboards so the Leaderboard card and Season management tools always display, even when an active season has 0 recorded matches.
*   [x] **Empty State UI**: Added a dedicated, styled empty-state card (*"No matches recorded this season"*) with trophy icon and guidance text on both desktop and mobile views.
*   [x] **Fallback-Safe Season Selector**: Updated the `<select>` dropdown to always render fallback options (`[activeSeason]` + `All-Time (Career)`) even if the remote Supabase `seasons` table is unpopulated or returns an empty array.
*   [x] **Dual-Layer Admin Role Detection**: Integrated client-side `useRole()` (`roleIsAdmin`) alongside server-passed `isAdmin` prop (`isAdmin || roleIsAdmin`) on both desktop and mobile dashboards to guarantee the amber "Season Settings" button is immediately visible upon navigating to `/admin-92Kf8s`.
*   [x] **Production Build Verified**: Confirmed successful Next.js 16 build (`Exit code: 0`, all 16 routes statically optimized and verified).

## Current Project Status

The app now has a **full competitive Season System** with soft MMR resets, immutable historical snapshots, season-scoped leaderboards (Current / Final Standings / All-Time Career), and an Admin Season Management modal for atomic season transitions — all with complete financial isolation. Player Cards and profile badges update dynamically per active season. Combined with the existing **Floor-Protected Glicko-Lite + Attendance Streak XP** ranking engine, **Underdog Bonus**, **Match Rating Deltas**, **FIFA-Style Player Cards**, and the **Synchronized User Guide**, CockCount is now a feature-complete competitive badminton tracking platform. Production build verified.

## Known Issues / Backlog

*   **Environment Variables**: `.env.local` requires real Supabase keys for public distribution.
*   **Static Pre-rendering**: Some pages might benefit from partial pre-rendering (PPR) if Next.js version allows.


## Roadmap & Next Steps

1.  **Placement Match System**: (Complete) Dynamic K-factor and Unranked state implemented.
2.  **Live Updates**: (Complete) Real-time leaderboard and animations.
3.  **Ranking Architecture Overhaul**: (Complete) Floor-protected Glicko-Lite + Attendance Streak XP engine live.
4.  **Rating Deltas on Match Logs**: (Complete) Per-match `+/-` rating change badges on all session and profile pages.
5.  **Light Social Adjustments**: (Complete) Surgical underdog bonus live.
6.  **Auto-Grouping**: Smart team generation based on skill ratings and partner history.
7.  **Settle Tracking**: Auto-suggest who pays what based on complex debt chains.


## Agent Tips

- `lib/actions/payments.ts` includes `quickSettle` for zero-click resolution of balances.
- `src/components/AnalyticsClient.tsx` is the central component for all chart visualizations.
- FABs on mobile are standardized at `fixed bottom-32 right-8`.
- `basePath` is computed as `/${currentMode}` where `currentMode` is parsed from the first segment of the URL (either `admin-92Kf8s` or `view`).
