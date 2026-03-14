# AI Instructions: Development Guidelines

As an AI agent working on Shuttle Tracker, follow these conventions to maintain the quality and architectural integrity of the project.

## Coding Style & Conventions
*   **React Components**: Prefer Functional Components with Tailwind CSS for layout.
*   **State Management**: Use Local State (`useState`) for UI toggles and Server Actions for data mutations. Avoid global state libraries unless strictly necessary.
*   **Role Management**: Role-based UI is handled via the URL `/[mode]`. Use the `useRole` hook from `@/context/AuthContext` to conditionally render admin elements.
*   **Naming**: Use PascalCase for components and camelCase for variables/functions.

## Framework Best Practices (Next.js 16+)
*   **Fetching**: Fetch data in Server Components (`page.tsx`) and pass it down as props to Client Components.
*   **Mutations**: Always use `use server` actions for database writes. Handle errors gracefully with user-facing alerts (see `SessionMatches.tsx`).
*   **Revalidation**: Use `revalidatePath` in server actions to ensure the UI updates immediately after data changes.

## Architectural Rules
1.  **Schema Source of Truth**: `schema_v2.sql` is the definitive guide for the database. Avoid modifying the DB directly in the Supabase UI without updating this file.
2.  **Styles**: Follow the "Premium Dark" aesthetic. Use `slate-900` backgrounds, `slate-800` borders, and high-contrast accents like `sky-400` or `emerald-400`.
3.  **Icons**: Exclusively use `lucide-react`.

## Dependencies
*   **Do Add**: Utilities for math or charting (e.g., `recharts`) if needed for future tasks.
*   **Do NOT Add**: Heavy UI frameworks like MUI or Bootstrap; keep the design custom with Tailwind.

## Best Practices
*   **Performance**: Calculations like H2H are done on the client for now. Be mindful of array iteration efficiency in profiles.
*   **Error Handling**: Wrap server action calls in try/catch blocks in the client to provide meaningful error messages to users.
*   **Accessibility**: Ensure all buttons have descriptive icons or labels for screen readers.
