# Core Features & Logic

## 1. Deep Match Algorithm

The Deep Match feature uses AI to rank jobs against a user's resume based on multiple factors.

### Implementation (`src/services/adzuna.ts`)

```typescript
// deepSearchJobs function (lines 78-159)
async deepSearchJobs(filters, resumeText, preferences)
```

### How It Works

1.  **Resume Text Extraction**: System retrieves the user's primary resume content
2.  **Multiple Query Generation**: Generates variations of search queries based on:
    -   Target roles from preferences
    -   Skills extracted from resume
    -   Industries from preferences
3.  **Job Search**: Calls Adzuna API via Edge Function with multiple queries
4.  **AI Scoring**: Edge Function uses LLM to score each job:
    -   **Skill Alignment (50%)**: How well job requirements match resume skills
    -   **Experience Relevance (30%)**: Job level matches experience
    -   **Industry Context (20%)**: Industry alignment
5.  **Ranking**: Jobs sorted by match score descending
6.  **Results**: Returns jobs with `__match_score` and `__match_reason` attached

### Scoring Formula (Edge Function)

```
match_score = (skill_match * 0.5) + (experience_match * 0.3) + (industry_match * 0.2)
```

### Usage in UI

-   Toggle "AI Deep Match" switch on Job Search page
-   Jobs display match percentage badge (Green/Trophy for >85%, Blue for >60%)
-   Tooltip shows match reasoning

---

## 2. Document Generator

Generates AI-tailored resumes and cover letters based on a job description and user's resume.

### Implementation

**Frontend**: `DocumentGenerator.tsx`
**Edge Function**: `generate-document`

### Process

1.  **Input Selection**:
    -   Choose target job (from saved jobs or search)
    -   Select source resume (from uploaded resumes)
    -   Choose document type (resume or cover_letter)

2.  **Content Preparation**:
    -   Extract job requirements, description, company info
    -   Get resume parsed data (skills, experience, education)
    -   Build prompt with both inputs

3.  **AI Generation** (Edge Function):
    -   Send prompt to OpenAI (GPT-4)
    -   Include instructions for ATS-friendly formatting
    -   Request specific sections (summary, achievements, etc.)

4.  **ATS Scoring**:
    -   Extract keywords from job description
    -   Compare with generated content
    -   Calculate match percentage
    -   Identify missing keywords

5.  **Storage**:
    -   Save to `generated_documents` table
    -   Link to job_id and resume_id
    -   Store matched/missing keywords

### Usage Limits

-   Check user's generation count
-   Validate against plan limits
-   Show remaining generations

### Document Limits

-   **100 Saved Jobs**: Users limited to 100 jobs in tracker
-   **2 Tailored Resumes** per saved job
-   **2 Tailored Cover Letters** per saved job

---

## 3. Job Search

Search for jobs using the Adzuna API with filtering.

### Implementation (`src/services/adzuna.ts`)

```typescript
// searchJobs function (lines 5-76)
async searchJobs(filters: JobSearchFilters): Promise<{ results: JobListing[], count: number }>
```

### Filters Available

| Filter | Type | Description |
|--------|------|-------------|
| `query` | string | Job title/keywords |
| `location` | string | City or region |
| `radius` | number | Search radius in miles |
| `remote_only` | boolean | Remote jobs only |
| `salary_min` | number | Minimum salary |
| `salary_max` | number | Maximum salary |
| `job_type` | string | full-time, part-time, contract |
| `sort_by` | string | relevance, date, salary |
| `country` | string | us, gb, etc. (default: us) |

### Caching

-   Search results cached in `localStorage` (`job-search:{filters}`) for 5 minutes
-   Reduces API calls and improves speed

### Response Mapping

The service transforms Adzuna API response to internal `JobListing` type:

```typescript
{
  id: String(job.id),
  external_job_id: `adzuna-${job.id}`,
  title: stripHtml(job.title),
  company: job.company.display_name,
  location: job.location.display_name,
  salary_min/salary_max: job.salary_min/max,
  salary_range: formatted string,
  job_url: job.redirect_url,
  description: stripHtml(job.description),
  requirements: [],             // Extracted in Edge Function
  skills_required: [],          // Extracted in Edge Function
  posted_at: job.created,
  source: 'adzuna',
  remote: detected from location.area,
  job_type: mapped from contract_time
}
```

---

## 4. Application Tracker (Kanban)

Drag-and-drop board for managing job applications.

### Implementation (`ApplicationTracker.tsx`)

Uses `@dnd-kit/core` library for drag-and-drop functionality.

### Kanban Columns

| Column | ID | Color | Description |
|--------|-----|-------|-------------|
| Saved | `saved` | Blue | Jobs you're interested in |
| Applied | `applied` | Purple | Applications submitted |
| Interviewing | `interviewing` | Yellow | In interview process |
| Offer | `offer` | Green | Received offer |
| Rejected | `rejected` | Red | Not moving forward |

### Drag Logic

1.  **Drag Start**: Store active item
2.  **Drag Over**: Highlight valid drop targets
3.  **Drag End**:
    -   Get new status from drop target
    -   Optimistic update in UI
    -   Update database
    -   Show toast notification
    -   Set date fields (applied_date, interview_date, etc.)

### Tabs

1.  **Applications Tab**: Kanban board for job applications
2.  **Development Tab**: Track career growth items
   -   `role`: Target job roles
   -   `certification`: Certifications to obtain
   -   `skill`: Skills to develop
3.  **Analysis Tab**: View resume analyses

---

## 5. Resume Management

Upload, parse, and manage resumes.

### Implementation (`ResumeManager.tsx`)

### Features

1.  **Upload**: PDF upload to Supabase Storage
2.  **Parsing**: Edge Function extracts:
    -   Contact info
    -   Work experience (company, title, dates, description)
    -   Education (institution, degree, field)
    -   Skills
    -   Certifications
    -   Summary
3.  **Primary Resume**: Mark one resume as primary for Deep Match
4.  **Delete**: Remove resume and associated data

### Storage Structure

```
storage/
└── resumes/
    └── {user_id}/
        └── {resume_id}.pdf
```

---

## 6. Analytics

Visual insights into job search progress.

### Implementation (`Analytics.tsx`)

Uses `recharts` library for visualizations.

### Charts

1.  **Application Funnel** (Bar/Area chart)
    -   Saved → Applied → Interviewing → Offers
    -   Shows conversion rates between stages

2.  **Status Distribution** (Pie chart)
    -   Breakdown by status
    -   Percentages for each category

3.  **Application Timeline** (Line chart)
    -   Applications over time
    -   Weekly/monthly grouping

4.  **Salary Distribution** (Histogram)
    -   Salary ranges of saved jobs

---

## 7. Alerts Manager

Configure automated job alerts.

### Implementation (`AlertsManager.tsx`)

### Features

1.  **Create Alert**:
    -   Search criteria (keywords, location)
    -   Frequency (daily, weekly)
    -   Notification method (email, in-app)

2.  **Manage Alerts**:
    -   Enable/disable alerts
    -   Edit criteria
    -   Delete alerts

3.  **Alert Execution**:
    -   Edge Function runs on schedule
    -   Matches new jobs against criteria
    -   Sends notifications

---

## 8. Company Research

Research companies using Perplexity AI.

### Implementation (`src/services/perplexity.ts`)

```typescript
async researchCompany(companyName: string, context?: string)
```

### Usage

-   In Job Details, "Research Company" button
-   Calls `research-company` Edge Function
-   Returns company insights:
    -   Company culture
    -   Recent news
    -   Size and growth
    -   Interview process info

---

## 9. Authentication Flow

### Sign Up / Sign In

1.  User enters email
2.  OTP sent to email
3.  User enters OTP
4.  Session created
5.  Redirect to onboarding or dashboard

### Session Management

-   JWT tokens stored by Supabase
-   Refresh token handled automatically
-   Local storage persistence via Zustand

### Protected Routes

-   Check `isAuthenticated` state
-   Verify `profile` exists
-   Redirect to `/auth` if invalid

---

## 10. Optimistic Updates

The app uses optimistic UI updates for better UX:

### Job Saving
-   Add to local store immediately
-   Show loading state
-   If API fails, rollback and show error toast

### Status Changes
-   Update UI immediately on drag end
-   Send API request in background
-   Rollback on failure

### Resume Upload
-   Show uploading state
-   On success, add to store
-   On failure, show error toast
