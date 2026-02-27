# Database Schema

The database is hosted on **Supabase (PostgreSQL)**. It relies on standard relational modeling with **Row Level Security (RLS)** to secure data per user.

## 📋 Tables Overview

### 1. `user_profiles`
Extended profile information linked to `auth.users`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users(id)` |
| `full_name` | TEXT | User's full name |
| `email` | TEXT | User's email |
| `phone` | TEXT | Phone number |
| `location` | TEXT | City/country |
| `linkedin_url` | TEXT | LinkedIn profile URL |
| `portfolio_url` | TEXT | Portfolio website |
| `avatar_url` | TEXT | Profile picture path |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### 2. `job_preferences`
Stores criteria for job searches and matching.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `target_roles` | TEXT[] | Array of desired job titles |
| `target_industries` | TEXT[] | Target industries |
| `location` | TEXT | Preferred location |
| `remote_preference` | TEXT | `remote`, `hybrid`, `onsite`, or `any` |
| `salary_min` | INTEGER | Minimum salary (annual) |
| `salary_max` | INTEGER | Maximum salary (annual) |
| `search_radius_miles` | INTEGER | Search radius in miles |
| `use_global_filters` | BOOLEAN | Apply filters to all searches |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### 3. `saved_jobs`
The core of the Application Tracker.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `external_job_id` | TEXT | ID from source (e.g., Adzuna) |
| `title` | TEXT | Job title |
| `company` | TEXT | Company name |
| `location` | TEXT | Job location |
| `salary_min` | INTEGER | Minimum salary |
| `salary_max` | INTEGER | Maximum salary |
| `salary_range` | TEXT | Formatted salary string |
| `job_url` | TEXT | Link to original job posting |
| `description` | TEXT | Job description (HTML/stripped) |
| `requirements` | TEXT[] | Job requirements |
| `skills_required` | TEXT[] | Required skills |
| `status` | TEXT | `saved`, `applied`, `interviewing`, `rejected`, `offer` |
| `notes` | TEXT | User's private notes |
| `applied_date` | DATE | Date marked as applied |
| `interview_date` | DATE | Interview date |
| `offer_date` | DATE | Offer received date |
| `rejected_date` | DATE | Rejection date |
| `contact_name` | TEXT | Contact person name |
| `contact_email` | TEXT | Contact email |
| `company_url` | TEXT | Company website |
| `recruiter_phone` | TEXT | Recruiter phone |
| `recruiter_linkedin` | TEXT | Recruiter LinkedIn |
| `created_at` | TIMESTAMPTZ | When job was saved |

### 4. `resumes`
Stores parsed resume data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `original_filename` | TEXT | Original file name |
| `storage_path` | TEXT | Path in Supabase Storage |
| `parsed_data` | JSONB | Full structural parse of resume |
| `extracted_skills` | TEXT[] | Skills extracted from resume |
| `work_experience` | JSONB | Work history array |
| `education` | JSONB | Education history array |
| `certifications` | TEXT[] | Certifications |
| `summary` | TEXT | Professional summary |
| `is_primary` | BOOLEAN | Marks resume for Deep Match |
| `created_at` | TIMESTAMPTZ | Upload timestamp |

### 5. `generated_documents`
Stores AI-generated tailored documents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `job_id` | UUID | Foreign key to `saved_jobs` |
| `resume_id` | UUID | Foreign key to `resumes` |
| `document_type` | TEXT | `resume` or `cover_letter` |
| `content` | TEXT | Generated text/markdown |
| `ats_score` | INTEGER | ATS compatibility score (0-100) |
| `matched_keywords` | TEXT[] | Keywords matched |
| `missing_keywords` | TEXT[] | Keywords missing |
| `storage_path` | TEXT | Optional storage path |
| `created_at` | TIMESTAMPTZ | Generation timestamp |

### 6. `job_market_analytics`
Caches market insights for analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `search_query` | TEXT | Search query |
| `location` | TEXT | Location filter |
| `total_jobs` | INTEGER | Total job count |
| `avg_salary_min` | INTEGER | Average min salary |
| `avg_salary_max` | INTEGER | Average max salary |
| `top_skills` | JSONB | Skills frequency map |
| `top_companies` | JSONB | Companies frequency map |
| `remote_percentage` | FLOAT | % of remote jobs |
| `fetched_at` | TIMESTAMPTZ | When data was fetched |

### 7. `career_items`
Tracks career development items.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `type` | TEXT | `role`, `certification`, or `skill` |
| `title` | TEXT | Item title |
| `description` | TEXT | Description |
| `url` | TEXT | Link to resource |
| `status` | TEXT | `saved`, `in_progress`, `completed` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### 8. `resume_analyses`
Stores resume analysis results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `resume_id` | UUID | Foreign key to `resumes` |
| `analysis_data` | JSONB | Analysis results |
| `created_at` | TIMESTAMPTZ | Analysis timestamp |

## 🔒 Security (RLS) Policies

All user-centric tables have RLS enabled:

### Policy Types
- **SELECT**: Users can only see their own rows (`auth.uid() = user_id`)
- **INSERT**: Users can only insert their own data
- **UPDATE**: Users can only update their own data
- **DELETE**: Users can only delete their own data

### Tables with RLS
- `user_profiles`
- `job_preferences`
- `saved_jobs`
- `resumes`
- `generated_documents`
- `career_items`
- `resume_analyses`

### Public Tables
- `job_market_analytics` - Readable by any authenticated user

## 🗄️ SQL Definition

See `schema.sql` in the project root for the exact DDL statements.

## 🔗 Relationships

```
auth.users (1) ─────< (N) user_profiles
auth.users (1) ─────< (N) job_preferences
auth.users (1) ─────< (N) saved_jobs
auth.users (1) ─────< (N) resumes
auth.users (1) ─────< (N) generated_documents
auth.users (1) ─────< (N) career_items
auth.users (1) ─────< (N) resume_analyses

saved_jobs (1) ─────< (N) generated_documents
resumes (1) ─────< (N) generated_documents
resumes (1) ─────< (N) resume_analyses
```
