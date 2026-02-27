# Architecture Overview

## 🏗 High-Level Stack

The Job Hunter application follows a modern **Jamstack** architecture:

-   **Frontend**: React 18, fueled by Vite for fast development and building.
-   **Language**: TypeScript throughout for type safety.
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions).
-   **Styling**: Tailwind CSS with a mobile-first, utility-first approach.

## 🔄 State Management

The application uses **Zustand** for global state management. Stores are modular and often persist to `localStorage` for a better user experience across sessions.

### Core Stores (`src/stores/index.ts`)

1.  **`useUserStore`** (lines 24-102):
    -   Manages user profile (`user_profiles` table) and preferences (`job_preferences` table).
    -   Handles authentication state (`isAuthenticated`).
    -   Actions: `fetchUserData`, `updateProfile`, `updatePreferences`, `logout`.
    -   Persisted to `localStorage` under key `job-hunter-user`.

2.  **`useJobsStore`** (lines 120-149):
    -   Manages saved jobs (kanban board) and search results.
    -   Handles optimistic updates for saving/unsaving jobs.
    -   Persisted under key `job-hunter-jobs`.

3.  **`useResumeStore`** (lines 164-190):
    -   Manages uploaded resumes and parsed data.
    -   Tracks the "Primary Resume" used for Deep Match.
    -   Persisted under key `job-hunter-resumes`.

### Career Store (`src/stores/career.ts`)

4.  **`useCareerStore`**:
    -   Manages career development items (roles, certifications, skills).
    -   Handles resume analyses results.
    -   Actions: `fetchItems`, `addItem`, `updateItemStatus`, `deleteItem`.
    -   Actions: `fetchAnalyses`, `addAnalysis`.

## 🎨 Styling & Design System

-   **Framework**: Tailwind CSS.
-   **Icons**: `lucide-react` for consistent iconography.
-   **Theme**: Dark-themed by default (slate/zinc palette), favoring high contrast (white text on dark backgrounds) with accent colors (Emerald green for success, Blue for information).
-   **Typography**: "General Sans" font family (loaded via CSS).
-   **Animations**: Minimal CSS transitions and keyframe animations (`animate-fade-in`, loading spinners).

## 🔌 API & Services

The frontend interacts with the backend primarily through the **Supabase Client** (`@supabase/supabase-js`).

### Service Files

1.  **`src/services/adzuna.ts`**:
    -   `searchJobs(filters)` - Calls `search-jobs` Edge Function
    -   `deepSearchJobs(filters, resumeText, preferences)` - Calls `deep-job-search` Edge Function
    -   Handles response mapping from Adzuna API format to internal `JobListing` type

2.  **`src/services/perplexity.ts`**:
    -   `researchCompany(companyName, context)` - Calls `research-company` Edge Function
    -   Returns company research content

3.  **`src/services/analysis.ts`**:
    -   Resume analysis and ATS scoring logic

### Edge Functions

Complex logic is offloaded to Supabase Edge Functions:

| Function | Purpose | Key Logic |
|----------|---------|-----------|
| `search-jobs` | Proxies job search to Adzuna API | Adds authentication, transforms response |
| `deep-job-search` | AI matching logic | Uses LLM to score jobs against resume |
| `generate-document` | AI resume/cover letter generation | Uses OpenAI to tailor content |
| `calculate-ats-score` | Resume-job matching analysis | Keyword extraction, scoring |
| `research-company` | Company research via Perplexity | Generates insights about companies |

## 🧩 Component Architecture

-   **`/src/components/ui`**: Atomic, reusable UI components (Button, Input, Card, EmptyState, Skeleton).
-   **`/src/components/layout`**: Layout wrappers (MainLayout, Navbar, BottomNav).
-   **`/src/pages`**: Top-level route components.
-   **`/src/hooks`**: Custom hooks (e.g., `useKeyboardShortcuts`).
-   **`/src/utils`**: Helper functions (toast notifications).

## 📦 Directory Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   └── Skeleton.tsx
│   └── layout/                # Layout wrappers
│       ├── MainLayout.tsx     # Main app layout with sidebar
│       ├── Navbar.tsx         # Top navigation
│       └── BottomNav.tsx      # Mobile bottom navigation
├── pages/                     # Route components
│   ├── Landing.tsx            # Public landing page
│   ├── Auth.tsx               # Login/Register
│   ├── Onboarding.tsx         # Initial user setup
│   ├── Dashboard.tsx          # User dashboard
│   ├── JobSearch.tsx          # Job search & Deep Match
│   ├── JobDetails.tsx         # Job detail view
│   ├── ApplicationTracker.tsx # Kanban board
│   ├── ResumeManager.tsx      # Resume upload & management
│   ├── DocumentGenerator.tsx  # AI document generation
│   ├── Analytics.tsx          # Charts & insights
│   ├── AlertsManager.tsx      # Job alert configuration
│   ├── Profile.tsx           # User profile settings
│   └── Docs.tsx               # App documentation
├── stores/
│   ├── index.ts               # Main stores (user, jobs, resumes)
│   └── career.ts              # Career items & analyses
├── services/                  # API service wrappers
│   ├── adzuna.ts              # Job search API
│   ├── perplexity.ts          # Company research API
│   └── analysis.ts            # Resume analysis
├── hooks/
│   └── useKeyboardShortcuts.ts # Keyboard shortcuts
├── lib/
│   ├── supabase.ts            # Supabase client config
│   └── docs/                  # Markdown documentation
├── types/
│   └── index.ts               # TypeScript interfaces
├── utils/
│   └── toast.ts               # Toast notification helpers
├── App.tsx                    # Router & app entry
└── main.tsx                   # React DOM render
```

## 🔐 Authentication Flow

The authentication flow in `App.tsx`:

1.  **Initial Load**: Checks for existing session via `supabase.auth.getSession()`
2.  **Auth State Listener**: `supabase.auth.onAuthStateChange` listens for auth events
3.  **Protected Routes**: `ProtectedRoute` component checks `isAuthenticated` and `profile`
4.  **Onboarding Check**: `OnboardingRoute` ensures user has completed setup
5.  **Redirect Logic**: Unauthenticated users redirected to `/auth`

## 📱 Responsive Design

-   **Desktop**: Sidebar navigation (left)
-   **Mobile**: Bottom navigation bar
-   **Breakpoints**: Tailwind's default breakpoints (sm: 640px, md: 768px, lg: 1024px)
-   **MainLayout**: Conditionally renders Sidebar or BottomNav based on screen size
