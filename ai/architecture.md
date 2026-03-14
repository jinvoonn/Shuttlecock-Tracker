# Project Architecture: Shuttle Tracker

## Folder Structure
```text
shuttle-tracker/
├── ai/                 # AI Memory System (Documentation)
├── public/             # Static assets
├── scripts/            # Database migration and Excel extraction scripts
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   │   └── [mode]/     # Dynamic route for role management (admin vs view)
│   ├── components/     # Reusable React components (UI & Logic)
│   ├── context/        # React Context (AuthContext for role handling)
│   ├── lib/            # Utility functions and shared logic
│   │   ├── actions/    # Supabase Server Actions (Mutations)
│   │   ├── supabase.ts # Supabase client initialization
│   │   └── grouping.ts # Auto-match generation algorithm
│   └── styles/         # Global CSS
└── schema_v2.sql       # Current PostgreSQL database schema
```

## Major Components
*   **DashboardClient**: Manages balance display, sorting, and player settlement.
*   **SessionsList & SessionMatches**: Handles the complex nested display of session data and match logging.
*   **SkillRatingEditor**: An interactive admin component for updating player skill levels.
*   **SettleButton**: Quick-action component for settling player debts.

## Data Flow
1.  **Read**: Server components in `src/app` fetch data directly from Supabase via the shared `supabase.ts` client.
2.  **Write**: Mutations (adding matches, sessions, or updating skill) are handled via **Next.js Server Actions** located in `src/lib/actions`.
3.  **Analytics**: Logic for Win Rate, H2H, and "Best Partner" is calculated client-side or on-the-fly in server components to ensure the UI stays responsive without complex backend views.

## Database Schema (Summary)
The database structure is defined in `schema_v2.sql` and includes:
*   `players`: ID, name, and `skill_rating`.
*   `sessions`: Record of attendance dates.
*   `session_players`: Junction table for session attendance.
*   `purchases`: Records of shuttlecock purchases and prices.
*   `session_usage`: Links sessions to specific shuttlecock tubes and tracking usage quantity.
*   `matches` & `match_players`: Stores scores and team compositions for every game.
*   `payments`: Logs player payments against their costs.

## Key Libraries & Interactions
*   **Supabase SSR**: Efficiently handles database queries within Next.js Server Components.
*   **Grouping Algorithm (`src/lib/grouping.ts`)**: Uses a combinations-based approach to minimize skill gaps and rotate partners.
*   **Tailwind CSS v4**: Provides a premium "glassmorphism" aesthetic with dark-mode focus.
