# Core Features & Logic

## 1. AI Deep Match

Deep Match is a proprietary compatibility scoring system. Instead of simple keyword matching, it performs a semantic analysis of the user's profile against job opportunities.

### Logic Flow:
1.  **Trigger**: User clicks "AI Deep Match" on the `/jobs` page.
2.  **Prerequisite**: A "Primary Resume" must be uploaded and parsed.
3.  **Process**:
    -   The system fetches the user's primary resume (text, skills, experience).
    -   It calls the `deep-job-search` Edge Function.
    -   The function generates a complex search query based on the user's profile combined with user preference filters.
    -   Results are scored on three axes:
        -   **Skill Alignment (50%)**: Direct skill overlap.
        -   **Experience Relevance (30%)**: Job title/history fit.
        -   **Industry Context (20%)**: Domain-specific terminology match.
4.  **Display**:
    -   Jobs are badged (Green/Trophy for >85%, Blue for >60%).
    -   Scores are stored in local component state `matchScores`.

## 2. Document Generator

The Document Generator creates tailored application materials optimized for Applicant Tracking Systems (ATS).

### Logic Flow:
1.  **Input**: User selects a `saved_job` or pastes a custom job description.
2.  **Context**: System retrieves parsed data from the Primary Resume.
3.  **Generation**:
    -   Calls `generate-document` Edge Function.
    -   Edge Function uses an LLM to rewrite the resume or draft a cover letter, strictly mapping experience to the job description keywords.
4.  **Analysis**:
    -   Calls `calculate-ats-score` Edge Function on the *generated* content.
    -   Returns a score (0-100), keyword gaps ("Missing Keywords"), and an improvement plan.
5.  **Iteration**: User can "Re-improve with Keywords" to regenerate the document specifically focusing on missing terms.

## 3. Job Search & Aggregation

The app aggregates jobs from multiple sources (primarily via Adzuna API proxy).

-   **Service**: `src/services/adzuna.ts` provides the abstraction.
-   **Caching**: Search results are cached in `localStorage` (`job-search:{filters}`) for 5 minutes (`5 * 60 * 1000`) to reduce API calls and improve speed.
-   **Optimistic UI**: When saving a job, it's added to the local store immediately ("Optimistic Save") before the backend request completes. If the backend fails, the change is rolled back with a toast notification.

## 4. Career Improvement Plan

During document generation or analytics reviews, the system suggests career growth items:

-   **Certifications**: Specific certs found in job descriptions that the user lacks.
-   **Stepping Stone Roles**: Intermediate job titles that bridge the gap between fresh experience and target roles.
-   **Logic**: Parses "Requirements" sections of job postings to find frequent proper nouns (certs) or job titles that appear in "Preferred Qualifications".
