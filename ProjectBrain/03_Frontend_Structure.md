# Frontend Structure

## 🗺 Application Routing (`App.tsx`)

The app uses `react-router-dom` with a mix of public and protected routes.

1.  **Public Routes**:
    -   `/`: Landing page.
    -   `/auth`: Login/Register page.
    -   `/onboarding`: Initial user setup.

2.  **Protected Routes** (Wrapped in `MainLayout`):
    -   `/dashboard`: User's main hub.
    -   `/jobs`: Job Search & Deep Match interface.
    -   `/jobs/:id`: specific job details (though often handled via modal/panel in search).
    -   `/tracker`: Drag-and-drop application board.
    -   `/resume`: Resume upload and management.
    -   `/generate`: AI Document Generator.
    -   `/analytics`: Visualizations of application status.
    -   `/alerts`: Job alert configurations.

## 🏗 Key Components

### 1. Layouts
-   **`MainLayout`**: Contains the persistent Sidebar navigation and the main content area. Handles responsive mobile menu (hamburger toggle).

### 2. UI Library (`src/components/ui`)
-   **`Button`**: Supports variants (`primary`, `secondary`, `outline`, `ghost`), sizes, and loading states.
-   **`Input`**: Standard styled inputs with icon support.
-   **`Card`**: Container with consistent border, background, and padding.
-   **`Skeleton`**: Loading states.

### 3. Pages
-   **`JobSearch.tsx`**:
    -   Complex search interface with filters (Location, Remote, Salary).
    -   **"AI Deep Match"** trigger.
    -   Displays `JobListing` cards.
    -   Master-detail view (List on left, Detail panel on right).
    -   Integrates `useJobsStore` for saving jobs.
-   **`JobDetails.tsx`**:
    -   Displays comprehensive job information, notes, and skill matches.
    -   **Tailored Documents Card**: Dynamic list of saved resumes/cover letters. Supports viewing (modal) and deletion.
    -   **Actions**: "Edit Details", "Delete Job" (with associated data cleanup), and "+ Generate New" navigation.
-   **`DocumentGenerator.tsx`**:
    -   Two-pane layout: Configuration (left), Preview (right).
    -   **Context Awareness**: Handles `jobId` from routing state to pre-select jobs.
    -   **Persistence**: "Save to Job" functionality integrates with usage limit validation.
    -   Visualizes ATS score and keyword analysis.

### 4. Application Tracker (`ApplicationTracker.tsx`)
-   Uses `@dnd-kit/core` for drag-and-drop functionality.
-   Columns represent `saved_jobs.status` (Saved -> Applied -> Interviewing -> Offer).

## 🛠 Libraries & Tools

-   **`lucide-react`**: Primary icon set.
-   **`react-hot-toast`**: For notifications (Success, Error, Info).
-   **`react-markdown`**: Renders AI-generated content (resumes/cover letters) safely.
-   **`recharts`**: Used in Analytics page for graphs.
-   **`dnd-kit`**: Drag-and-drop interactions.
