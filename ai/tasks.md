# Project Tasks: Shuttle Tracker

## Completed Features (Phases 1-23)
*   [x] Core Dashboard with player balances.
*   [x] Session logging with shuttlecock usage tracking.
*   [x] Secret Admin routing (`/admin-92Kf8s`) for safe management.
*   [x] Advanced Player Profiles: Win Rate, H2H, Best Partner.
*   [x] Skill Rating System: Admin-editable slider for balancing games.
*   [x] Auto-Grouping: Logic for generating balanced teams and rotating partners.
*   [x] Database Migration: Moved from V1 to V2 schema with match tracking support.
*   [x] **UI Modernization (Stitch AI)**: Converted 17+ desktop/mobile designs to functional React components.
*   [x] **Gap Analysis**: Verified UI compatibility with `schema_v2.sql`.
*   [x] **Phase 13: Core Backend Integration**: Hooked up all 18+ mobile/desktop views to Supabase services and server actions.

## Current Work in Progress
*   [x] **Vercel Deployment Fix**: Resolved build failures related to Turbopack and missing client directives.

## Known Issues/Bugs
*   **Asset Placeholders**: Since avatars and hero images were skipped, many components use mock visual data (placeholders).
*   **Environment Variables**: `.env.local` requires real Supabase keys to function.

## Roadmap & Next Recommended Steps
1.  **Backend Wiring**: Implementation of API services to fetch real data for the new Stitch-based views.
2.  **Performance Optimization**: Move analytics calculations to SQL Views if the match history grows substantially.
3.  **Visual Analytics**: Add charts (e.g., monthly spending, usage trends) using Recharts.
4.  **Automatic Settle Tracking**: Automatically suggest who should pay what based on current debt.

## Future Agents Tip
Verify the `.env.local` keys and ensure the `matches` table data aligns with the 4-player slot assumptions in the new UI components.
