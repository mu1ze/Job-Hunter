# Frontend Structure

## 🗺 Application Routing (`App.tsx`)

The app uses `react-router-dom` v6 with a mix of public and protected routes.

### Route Structure

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | `Landing` | No | Public landing page |
| `/auth` | `Auth` | No | Login/Register page |
| `/auth/callback` | `AuthCallback` | No | OAuth callback handler |
| `/docs` | `Docs` | No | App documentation |
| `/onboarding` | `Onboarding` | Yes | Initial user setup |
| `/dashboard` | `Dashboard` | Yes | User's main hub |
| `/jobs` | `JobSearch` | Yes | Job search interface |
| `/jobs/:id` | `JobDetails` | Yes | Job detail view |
| `/tracker` | `ApplicationTracker` | Yes | Kanban board |
| `/resume` | `ResumeManager` | Yes | Resume management |
| `/generate` | `DocumentGenerator` | Yes | AI document generation |
| `/analytics` | `Analytics` | Yes | Charts & insights |
| `/alerts` | `AlertsManager` | Yes | Job alert config |
| `/profile` | `Profile` | Yes | User settings |

### Route Protection

Two wrapper components handle route protection:

1.  **`ProtectedRoute`** (lines 22-52 in App.tsx)
    -   Checks authentication state
    -   Shows loading spinner during auth check
    -   Redirects to `/auth` if not authenticated

2.  **`OnboardingRoute`** (lines 54-84 in App.tsx)
    -   Similar to ProtectedRoute
    -   Ensures user has completed onboarding

### Layout Structure

-   **Public routes**: No layout wrapper
-   **Protected routes**: Wrapped in `MainLayout` which provides sidebar/bottom nav

## 🏗 Key Components

### 1. Layouts

-   **`MainLayout.tsx`**: Contains persistent navigation and main content area
    -   Sidebar on desktop (left side)
    -   BottomNav on mobile
    -   Responsive hamburger menu toggle

-   **`Navbar.tsx`**: Top navigation bar
    -   Logo
    -   Search toggle
    -   User avatar/menu

-   **`BottomNav.tsx`**: Mobile bottom navigation
    -   Fixed to bottom on small screens
    -   Icons: Home, Jobs, Tracker, Profile

### 2. UI Library (`src/components/ui`)

| Component | Usage |
|-----------|-------|
| `Button` | Primary action buttons with variants (primary, secondary, outline, ghost), sizes, loading states |
| `Input` | Form inputs with icon support |
| `Card` | Container with consistent border, background, padding |
| `EmptyState` | Empty list placeholder |
| `Skeleton` | Loading states |

### 3. Pages

#### `JobSearch.tsx`
-   Complex search interface with filters (Location, Remote, Salary, Job Type)
-   **"AI Deep Match"** toggle to enable AI-powered ranking
-   Displays `JobListing` cards in list view
-   Master-detail view (List on left, Detail panel on right on desktop)
-   Integrates `useJobsStore` for saving jobs
-   Debounced search input

#### `JobDetails.tsx`
-   Displays comprehensive job information
-   Notes section for user annotations
-   **Tailored Documents Card**: Lists generated resumes/cover letters
-   Actions: "Edit Details", "Delete Job", "+ Generate New"

#### `ApplicationTracker.tsx` (lines 50-679)
-   Uses `@dnd-kit/core` for drag-and-drop
-   **Three tabs**: Applications, Development, Analysis
-   **Kanban columns**: Saved → Applied → Interviewing → Offer → Rejected
-   **Career Development tab**: Track roles, certifications, skills
-   **Analysis tab**: View resume analyses
-   Drag handlers update `saved_jobs.status` in database
-   Optimistic UI updates

#### `DocumentGenerator.tsx`
-   Two-pane layout: Configuration (left), Preview (right)
-   **Context Awareness**: Handles `jobId` from routing state
-   Select resume, job, document type (resume/cover_letter)
-   **Persistence**: "Save to Job" functionality
-   Displays ATS score and keyword analysis
-   Uses `react-markdown` to render generated content

#### `ResumeManager.tsx`
-   Upload resumes (PDF)
-   Set primary resume for Deep Match
-   View parsed resume data
-   Delete resumes

#### `Dashboard.tsx`
-   Overview statistics
-   Recent activity
-   Quick actions
-   Recommended jobs

#### `Analytics.tsx`
-   Uses `recharts` for visualizations
-   Application funnel chart
-   Jobs by status pie chart
-   Application timeline

#### `AlertsManager.tsx`
-   Configure job search alerts
-   Set frequency (daily, weekly)
-   Manage active alerts

#### `Profile.tsx`
-   Edit user profile
-   Update preferences
-   Account settings

#### `Onboarding.tsx`
-   Multi-step form
-   Collects: name, location, target roles, industries, remote preference, salary range
-   Creates initial `user_profiles` and `job_preferences` records

## 🛠 Libraries & Tools

| Library | Purpose |
|---------|---------|
| `react-router-dom` | Routing and navigation |
| `zustand` | Global state management |
| `@supabase/supabase-js` | Supabase client |
| `@dnd-kit/core` | Drag-and-drop for Kanban |
| `lucide-react` | Icon set |
| `react-hot-toast` | Toast notifications |
| `react-markdown` | Render markdown content |
| `recharts` | Charts for analytics |
| `tailwindcss` | Styling |

## 📱 Responsive Behavior

-   **Desktop (≥1024px)**: Sidebar navigation, multi-column layouts
-   **Tablet (768px-1023px)**: Collapsible sidebar
-   **Mobile (<768px)**: Bottom navigation, single column layouts, stacked cards

## 🎯 State Flow

1.  **User logs in** → Auth state updated in store
2.  **Protected route accessed** → `fetchUserData` loads profile & preferences
3.  **Job search** → Calls Edge Function → Results stored in `useJobsStore`
4.  **Save job** → Optimistic update → DB insert → Toast notification
5.  **Drag job** → Optimistic update → DB update → Toast notification

## 🔄 Data Fetching Patterns

-   **On mount**: Fetch user data, saved jobs, resumes
-   **On search**: Call service → Update store → Render results
-   **Optimistic updates**: Update UI immediately, rollback on error
-   **Loading states**: Show skeletons during fetch
