## JobHunter App Walkthrough

This guide gives a **deeper, practical walkthrough** of every major page in JobHunter: what it’s for, how to use it step‑by‑step, and how pages connect to each other.

---

## Big picture: how the app fits together

- **Auth + Onboarding**: create your account, verify email with a code, and set preferences so the rest of the app can personalize results.
- **Resume Manager**: upload and parse resumes; select one primary resume that powers AI search and document generation.
- **Job Search + Deep Match**: discover roles from external sources and save promising jobs into your personal pipeline.
- **Application Tracker**: manage everything you’ve saved/applied in a Kanban board and track outcomes over time.
- **AI Document Generator**: generate ATS‑optimized resumes and cover letters for specific jobs.
- **Alerts + Analytics + Profile**: stay informed with alerts, learn from analytics, and keep your profile up to date.

---

## Landing (`/`)

### Purpose

- **High-level overview** of what JobHunter does and why you’d use it.
- Direct entry points into **signup / signin**.

### How to use

- **New users**:
  - Read the short overview and feature list to understand the value.
  - Click the primary **Get Started** / **Sign Up** call‑to‑action to go to `Auth`.
- **Returning users**:
  - Use the navigation to jump directly to `Auth` or other public pages (if surfaced).

---

## Auth (`/auth`)

### Purpose

- Create an account or sign in to access the dashboard and protected pages.

### Signup flow (email + password + OTP code)

- **Step 1 – Fill in details**
  - **Full Name** – used to personalize your profile and some docs.
  - **Email** – must be a valid inbox you can access immediately.
  - **Password** – standard password field with show/hide toggle.
- **Step 2 – Submit**
  - Click **Create Account**.
  - The app calls Supabase `auth.signUp` and triggers a **Confirm signup** email.
- **Step 3 – Verify email with code**
  - After signup, the screen switches into **Verify your email** mode.
  - Check your inbox for an email from your JobHunter project (via Supabase + Resend).
  - That email contains a **6‑digit OTP code** (not just a link).
  - Enter the code into the **Verification Code** input and click **Verify Email**.
  - The app calls `supabase.auth.verifyOtp({ email, token, type: 'signup' })` and, on success:
    - Creates/loads your profile.
    - Redirects you to `Onboarding` (first login) or `Dashboard`.
- **Resend code**
  - If the code expires or you can’t find the email:
    - Click **Resend code**.
    - The app calls `supabase.auth.resend({ type: 'signup', email })` and shows a toast.

### Signin flow

- Enter the email + password you used at signup.
- Click **Sign In**.
- On success:
  - You’re redirected based on your existing data (onboarding vs dashboard).
- On failure:
  - You’ll see a toast explaining the issue (invalid credentials, email not verified, etc.).

### Tips & edge cases

- **Code not arriving**:
  - Check spam/junk.
  - Use **Resend code**.
- **Wrong code**:
  - You’ll see a toast; request a new code and try again.

---

## Onboarding (`/onboarding`)

### Purpose

- Collect enough context about **who you are** and **what you’re looking for** so:
  - Job search filters can default intelligently.
  - Alerts target the right roles.
  - Deep Match has a better starting point.

### Step‑by‑step

1. **Basic Info**
   - **Your Full Name** – stored in `user_profiles.full_name`.
   - **Your Location** – stored in `user_profiles.location` and used as a default location filter.
2. **Job Preferences**
   - **Target Roles** – multi‑select from a curated list (e.g. Software Engineer, Product Manager).
   - **Preferred Industries** – optional tags like Technology, Finance, Healthcare.
   - **Work Preference** – remote, hybrid, onsite, or any.
3. **Salary Range**
   - **Minimum / Maximum** – optional fields used as default salary filters.
   - A **summary card** shows all preferences before you save.

### Completion behavior

- Clicking **Complete Setup**:
  - Updates `user_profiles` and `job_preferences`.
  - Redirects to **Dashboard**.

### Best practices

- Start with **1–3 target roles** for better signal.
- Set location and remote preference realistically; JobHunter will use them for global filters.

---

## Dashboard (`/dashboard`)

### Purpose

- Single place to **see how your search is going** and jump into key workflows.

### Typical usage

- Check:
  - **Total saved jobs** vs **applied/interviewing/offers**.
  - **Recent activity** (new alerts, new analyses, recent ATS documents).
- Use quick links to:
  - Go to `Job Search` to find new roles.
  - Jump into `Tracker` to update pipeline.
  - Open `Resume Manager` or `AI Document Generator` for content work.

### When to visit

- At the start of a session:
  - Decide whether to **hunt for new roles**, **follow up** on existing ones, or **improve your profile/docs**.

---

## Job Search (`/jobs`)

### Purpose

- Discover and evaluate live jobs from external APIs (e.g. Adzuna) with optional AI‑assisted matching.

### Filters & controls

- **Country** – where to search (US, CA, GB, etc.).
- **Query** – job title / keywords / company.
- **Location** – city, state, or remote pattern.
- **Radius** – distance around the chosen location.
- **Salary Min** – minimum acceptable salary.
- **Sort by** – relevance, date, or salary.
- **Remote Only** – restrict to remote roles where possible.
- When **global filters** are enabled in preferences:
  - Default location and salary min may be prefilled.

### Two main search modes

- **Standard Search**
  - Click **Search**.
  - Results are fetched from the Adzuna‑backed Edge Function and cached in localStorage for a few minutes.
- **AI Deep Match**
  - Requires a **primary resume** in `Resume Manager`.
  - Click **AI Deep Match**:
    - The app summarizes your resume and preferences.
    - A Supabase Edge Function uses Groq to generate smart queries and fetch multiple result sets.
    - Jobs are deduplicated and **ranked by semantic fit** (`__match_score`).
  - The UI shows a **Match % badge** on cards where scores exist.

### Job cards

- Show:
  - Title, company, location, salary range, posted date, key skills, optional remote flag.
  - An optional **Match %** (for Deep Match).
- **Saving jobs**:
  - Click the bookmark icon to save or unsave.
  - There is a **limit of 100 saved jobs**; hitting it shows a global toast with guidance to prune older roles.
  - Saved jobs flow into:
    - `Application Tracker` (as items in the Kanban board).
    - `Document Generator` (as target jobs for ATS‑optimized docs).

### Detail panel (right side)

- When you select a job:
  - The panel shows:
    - All metadata (location, salary, skills).
    - Full description.
    - Quick badges (e.g. Remote).
  - Buttons:
    - **Save / Saved** – toggles saved state.
    - **Apply** – opens the job’s URL in a new tab.
    - **Research Company with AI** – opens a modal with a Perplexity‑powered report (culture, news, interview process, red flags).

### Best practices

- Use **Deep Match** for signal; use **standard search** to widen the funnel.
- Keep only jobs you’d realistically apply to; the 100‑job limit prevents overwhelming the tracker.

---

## Job Details (`/jobs/:id`)

### Purpose

- Manage everything about a **single saved job** in more depth.

### What you can do

- View:
  - Full description, requirements, and metadata from the save event.
  - Any **generated documents** (tailored resumes, cover letters) linked to this job.
- Manage:
  - Notes and custom fields (if configured).
  - Delete documents that are outdated or redundant.
  - Remove the job entirely (which also affects the tracker and generator references).

### When to use

- After generating docs or progressing deeply in a specific process and you need a job‑centric view instead of the broader tracker.

---

## Application Tracker (`/tracker`)

### Purpose

- Give you a **visual pipeline** for your search, similar to a sales CRM, across all saved roles.

### Columns & statuses

- **Saved** – interesting but not yet applied.
- **Applied** – you’ve submitted an application.
- **Interviewing** – you’ve booked or completed interviews.
- **Offer** – you have an offer on the table.
- **Rejected** – the opportunity is closed.

### Using the Kanban board

- Drag cards between columns to update status.
- When certain statuses are set, the app:
  - Automatically updates date fields (e.g. `applied_date`, `interview_date`, `offer_date`, `rejected_date`).
  - Keeps historical data available for analytics.

### Stats bar

- Shows:
  - Total saved jobs.
  - Count per status (Saved, Applied, Interviewing, Offers, Rejected).
  - An approximate **response rate**: (interviewing + offers) / total.

### Additional tabs

- **Career Development**
  - Manage:
    - Target roles you’d like to grow into.
    - Certifications or learning resources you’ve saved.
  - Items here often come from:
    - The **Document Generator’s** improvement plan.
    - Manual additions.
- **Analysis History**
  - List of past **career analyses** generated from your resumes.
  - Each entry includes:
    - Readiness score.
    - Recommended roles.
    - Skill gaps.
    - Market insights plus links to external resources.

### Best practices

- Update statuses **as soon as something changes** (applied, interview scheduled, offer, rejection).
- Use **Career Development** to track medium‑term goals, not just immediate applications.

---

## Resume Manager (`/resume`)

### Purpose

- Central hub for **resume ingestion, parsing, and AI understanding** of your profile.

### Uploading resumes

- Drag & drop or click to upload **PDF or DOCX**.
- Behind the scenes:
  - Files are stored in Supabase Storage (`resumes` bucket).
  - PDF text is extracted in the browser (via pdf.js) or plain text is parsed directly.
  - The raw text is sent to a Supabase Edge Function (`parse-resume`) for AI parsing.
  - Parsed output (summary, skills, experience, education, certifications) is saved to the `resumes` table.

### Managing multiple resumes

- The left panel lists all uploaded resumes with:
  - Original filename.
  - Upload date.
  - A primary badge (for the one currently in use).
- Actions:
  - Click a resume to make it **primary** (used for Deep Match + document generation).
  - Delete a resume (removes Storage object + DB record).

### Detailed view

- The right side shows:
  - **AI Insight Summary** – a natural language summary of your profile.
  - **Core Skills** – extracted skills rendered as chips.
  - **Work Experience** – timeline with roles, companies, dates, descriptions, achievements.
  - **Education** – institutions, degrees, and date ranges.

### Career analysis

- Button: **Analyze Career Path**.
- Uses the current resume and your profile to:
  - Call an analysis Edge Function.
  - Generate:
    - Recommended roles.
    - Skill gaps.
    - Readiness score.
    - Market / certification suggestions (with help from Perplexity).
  - Save the analysis and redirect to `Tracker` → Analysis tab.

### Best practices

- Keep 1–2 **high‑quality, up‑to‑date** resumes.
- Set the version that best represents your current direction as **primary**.

---

## AI Document Generator (`/generate`)

### Purpose

- Turn your resume + job description into **tailored, ATS‑optimized documents** (resumes and cover letters).

### Inputs you need ready

- A **primary resume** (from `Resume Manager`).
- Either:
  - A **saved job** (from `Job Search` / `Tracker`).
  - Or a **custom job description** (pasted text, optionally with URL).

### Core workflow

1. **Choose Document Type**
   - `Resume` – a tailored resume for this specific job.
   - `Cover Letter` – a full letter referencing your background and the role.
2. **Choose Target Job**
   - **Saved Job** mode:
     - Pick a job from the dropdown; skills, company, and description are pulled automatically.
   - **Custom / URL** mode:
     - Provide title, company (optional), job URL (optional), and the full pasted job description.
3. **Generate**
   - Click **Generate**.
   - The Edge Function:
     - Combines `resumeData`, `jobDescription`, and `documentType`.
     - Generates the document via Groq.
     - Calculates an **ATS score** and a detailed breakdown + improvement plan.
4. **Review & iterate**
   - Inspect:
     - ATS score, breakdown, matched/missing keywords.
     - Improvement plan (certificates + stepping‑stone roles).
   - Optionally click **Re‑improve with Keywords** to regenerate using missing terms.
5. **Save / export**
   - **Copy** to clipboard.
   - **Download** as a `.txt` file.
   - **Save to Job** (saved‑job mode only):
     - Attaches the doc to the job in `generated_documents`.
     - Limit: **2 documents per type per job** to avoid clutter.

### Best practices

- Always **skim the generated text** and make light edits before sending to employers.
- Use the improvement plan to:
  - Add certificates and roles to `Tracker` → Career Development.
  - Inform what you study or practice between applications.

---

## Alerts Manager (`/alerts`)

### Purpose

- Let the system **watch the market for you** and notify you of new opportunities that match your criteria.

### How alerts work

- Each alert stores:
  - Keywords, location, filters.
  - Frequency / schedule (e.g. daily).
  - Active vs paused state.
- A Supabase scheduled Edge Function uses these definitions to:
  - Run searches on a schedule.
  - Trigger outbound notifications (e.g. email) when new matches are found.

### Using the UI

- **Create an alert**:
  - Choose query, location, frequency, and any additional filters.
  - Save the alert; it appears in the list.
- **Manage alerts**:
  - Toggle active/paused to control delivery.
  - Edit an existing alert’s configuration.
  - Delete alerts you no longer need.

### Best practices

- Start with **1–3 focused alerts** aligned to your top target roles.
- Use alerts as a **safety net**, not your only discovery mechanism.

---

## Analytics (`/analytics`)

### Purpose

- Turn your job search activity into **insights and feedback loops**.

### Typical insights (implementation‑dependent)

- Applications per stage over time.
- Conversion rates:
  - Saved → Applied.
  - Applied → Interview.
  - Interview → Offer.
- Top roles, locations, and sources yielding interviews/offers.

### How to use

- Identify:
  - Which **roles** or **locations** convert best.
  - Whether you should:
    - Apply more broadly.
    - Improve documents.
    - Focus on specific niches.

---

## Profile (`/profile`)

### Purpose

- Keep your **core user information** consistent and up to date.

### Fields (may vary by implementation)

- Name, email.
- Location.
- Phone.
- Links: LinkedIn, personal site / portfolio.

### How it’s used elsewhere

- Profile data can:
  - Pre‑fill sections in generated documents.
  - Feed into analytics and personalization.
  - Be used for future features (e.g. referrals, network insights).

---

## Suggested first‑time flow for users

1. **Create account + verify email** on `Auth`.
2. Complete **Onboarding** with honest preferences.
3. Upload at least one resume and set a **primary** in `Resume Manager`.
4. Use **Job Search** + **Deep Match** to find ~10–20 strong roles and **save** them.
5. Move through **Application Tracker** as you apply and hear back.
6. For top roles, use **AI Document Generator** to produce tailored resumes/cover letters.
7. Turn on a couple of **Alerts** to catch new postings.
8. Revisit **Analytics** weekly to adjust your strategy.

