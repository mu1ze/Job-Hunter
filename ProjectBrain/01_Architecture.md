# Architecture Overview

## 🏗 High-Level Stack

The Job Hunter application follows a modern **Jamstack** architecture:

-   **Frontend**: React 18, fueled by Vite for fast development and building.
-   **Language**: TypeScript throughout for type safety.
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions).
-   **Styling**: Tailwind CSS with a mobile-first, utility-first approach.

## 🔄 State Management

The application uses **Zustand** for global state management. Stores are modular and often persist to `localStorage` for a better user experience across sessions.

### Core Stores (`src/stores/`)

1.  **`useUserStore`**:
    -   Manages user profile (`user_profiles` table) and preferences (`job_preferences` table).
    -   Handles authentication state (`isAuthenticated`).
    -   Persisted to `localStorage`.

2.  **`useJobsStore`**:
    -   Manages saved jobs (kanban board) and search results.
    -   Handles optimistic updates for saving/unsaving jobs.

3.  **`useResumeStore`**:
    -   Manages uploaded resumes and parsed data.
    -   Tracks the "Primary Resume" used for Deep Match.

4.  **`useCareerStore`**: (Implied from code)
    -   Tracks career goals, saved certifications, and stepping stone roles.

## 🎨 Styling & Design System

-   **Framework**: Tailwind CSS.
-   **Icons**: `lucide-react` for consistent iconography.
-   **Theme**: Dark-themed by default (slate/zinc palette), favoring high contrast (white text on dark backgrounds) with accent colors (Emerald green for success, Blue for information).
-   **Typography**: "General Sans" font family.
-   **Animations**: Minimal CSS transitions and keyframe animations (`animate-fade-in`, loading spinners).

## 🔌 API & Services

The frontend interacts with the backend primarily through the **Supabase Client** (`@supabase/supabase-js`).

-   **Data Fetching**: Direct database queries for CRUD operations on user data, saved jobs, etc.
-   **Edge Functions**: Complex logic (AI generation, scraping, 3rd party API proxies) is offloaded to Supabase Edge Functions:
    -   `search-jobs`: Proxies requests to job search APIs (e.g., Adzuna).
    -   `deep-job-search`: Performs AI matching logic.
    -   `generate-document`: Uses LLMs to write resumes/cover letters.
    -   `calculate-ats-score`: Analyzes resume content.

## 🧩 Component Architecture

-   **`/src/components/ui`**: Atomic, reusable UI components (Button, Input, Card).
-   **`/src/components/layout`**: Layout wrappers (MainLayout) handling navigation and responsiveness.
-   **`/src/pages`**: Top-level route components.
-   **`/src/hooks`**: Custom hooks for reusable logic (e.g., keyboard shortcuts).

## 📦 Directory Structure

```
src/
├── components/     # UI and Layout components
├── hooks/          # Custom React hooks
├── lib/            # Supabase client configuration
├── pages/          # Route views
├── services/       # API wrapper services
├── stores/         # Zustand state stores
├── types/          # TypeScript interfaces
├── utils/          # Helper functions (date formatting, etc.)
└── App.tsx         # Main router and app entry
```
