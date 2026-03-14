# Project Context: CockCount

## Purpose
CockCount is a minimal but premium web application designed to track badminton group costs, specifically shuttlecock usage, session attendance, and player payments. It aims to replace complex Excel sheets with a streamlined digital interface that calculates balances in real-time.

## Main Features
*   **Balance Dashboard**: View real-time debt/credit status for all players.
*   **Session Management**: Log badminton sessions, specifically which shuttlecocks were used from which purchase.
*   **Match Logging**: Record match results (Team A vs Team B) within sessions.
*   **Auto-Grouping System**: Smartly generate balanced teams based on player skill ratings and partner history to avoid repetitive pairings.
*   **Player Profiles**: Detailed statistics including win rates, Head-to-Head (H2H) records, "Best Partner" analytics, and recent form.
*   **Admin Access**: Role management via a secret path (`/admin-92Kf8s`) allowing data modification, while the public route (`/view`) is read-only.

## Tech Stack
*   **Framework**: [Next.js](https://nextjs.org/) (App Router, Version 16+)
*   **Language**: TypeScript
*   **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Data Handling**: `xlsx` (for Excel data integration), `date-fns` (for time manipulation), `clsx` (for dynamic class naming).

## Environment Variables
The project requires the following keys in `.env.local`:
*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.

## Database & Services
*   **Supabase**: Used for all persistent data.
*   **RLS (Row Level Security)**: Enabled on all tables to control access, though mostly set to open for the admin routing model.

## Current Project Status
The project has successfully transitioned from UI modernization to a fully functional mobile-first application. **Phase 35: Log Match Restoration** is complete. Key recent improvements include a standardized mobile navigation system, inline editing for all tracking types (Stock, Payments, Sessions), and a verified production build status. The application is now stable, with functional CRUD operations and refined responsive layouts across all core modules.

"Because Shuttlecocks Aren’t Free."
