# Project Tasks: Shuttle Tracker

## Completed Features (Phases 1-11)
*   [x] Core Dashboard with player balances.
*   [x] Session logging with shuttlecock usage tracking.
*   [x] Secret Admin routing (`/admin-92Kf8s`) for safe management.
*   [x] Advanced Player Profiles: Win Rate, H2H, Best Partner.
*   [x] Skill Rating System: Admin-editable slider for balancing games.
*   [x] Auto-Grouping: Logic for generating balanced teams and rotating partners.
*   [x] Database Migration: Moved from V1 to V2 schema with match tracking support.

## Current Work in Progress
*   [ ] Refinement of the Match Logging UI (Recently fixed a schema mismatch error).
*   [ ] Ensuring auto-grouping scales well with larger player pools.

## Known Issues/Bugs
*   **Schema Mismatch**: Ensure the Supabase database has exactly matching columns for `skill_rating` and the `matches`/`match_players` tables as defined in `schema_v2.sql`.
*   **Environment Variables**: `.env.local` contains placeholder values by default; must be updated with real Supabase keys to function.

## Roadmap & Next Recommended Steps
1.  **Performance Optimization**: Move analytics calculations to SQL Views if the match history grows substantially (e.g., >1000 matches).
2.  **Visual Analytics**: Add charts (e.g., monthly spending, usage trends) using a library like Recharts.
3.  **Mobile Polish**: Enhance the touch-friendliness of the match generator UI.
4.  **Automatic Settle Tracking**: Automatically suggest who should pay what based on current debt.

## Future Agents Tip
When starting a new session, verify the `.env.local` keys and run a quick fetch on the `players` table to ensure database connectivity is live.
