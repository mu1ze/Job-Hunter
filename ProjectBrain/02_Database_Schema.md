# Database Schema

The database is hosted on **Supabase (PostgreSQL)**. It relies on standard relational modeling with **Row Level Security (RLS)** to secure data per user.

## 📋 Tables Overview

### 1. `user_profiles`
Extended profile information linked to `auth.users`.
-   **`id`** (UUID, PK): References `auth.users(id)`.
-   **`full_name`, `email`, `phone`, `location`**: basic contact info.
-   **`linkedin_url`, `portfolio_url`**: social/professional links.


### 2. `job_preferences`
Stores criteria for job searches and matching.
-   **`user_id`** (UUID, FK): References `auth.users`.
-   **`target_roles`** (Array): List of desired job titles.
-   **`target_industries`**, **`location`**, **`remote_preference`**.
-   **`salary_min`**, **`salary_max`**, **`search_radius_miles`**.

### 3. `saved_jobs`
The core of the Application Tracker.
-   **`id`** (UUID, PK).
-   **`user_id`** (UUID, FK).
-   **`status`** (Enum): `saved`, `applied`, `interviewing`, `rejected`, `offer`.
-   **`external_job_id`**: specific ID from the source (e.g., Adzuna ID).
-   **`title`, `company`, `location`, `salary_range`, `job_url`, `description`**.
-   **`requirements`, `skills_required`** (Arrays).
-   **`notes`**: User's private notes.

### 4. `resumes`
Stores parsed resume data.
-   **`id`** (UUID, PK).
-   **`user_id`** (UUID, FK).
-   **`storage_path`**: Path in Supabase Storage.
-   **`parsed_data`** (JSONB): Full structural parse of the resume.
-   **`extracted_skills`** (Array): Key skills for matching.
-   **`is_primary`** (Boolean): Marks the resume used for Deep Match.

### 5. `generated_documents`
Stores AI-generated tailored documents linked to specific job applications.
-   **`id`** (UUID, PK).
-   **`user_id`** (UUID, FK): References `auth.users(id)`.
-   **`job_id`** (UUID, FK): References `saved_jobs(id)`.
-   **`resume_id`** (UUID, FK): The resume version used for generation.
-   **`document_type`**: `resume` or `cover_letter`.
-   **`content`** (Text): The raw generated text/markdown.
-   **`ats_score`** (Integer).
-   **`matched_keywords`**, **`missing_keywords`** (Arrays).
-   **`created_at`** (TIMESTAMPTZ).

### 6. `job_market_analytics`
(Likely used for caching market insights).
-   **`search_query`, `location`**.
-   **`avg_salary_min`, `avg_salary_max`**.
-   **`top_skills`, `top_companies`** (JSONB).

## 🔒 Security (RLS) policies

All user-centric tables (`user_profiles`, `job_preferences`, `saved_jobs`, `resumes`, `generated_documents`) have RLS enabled.
-   **SELECT**: Users can only see their own rows (`auth.uid() = user_id`).
-   **INSERT/UPDATE/DELETE**: Users can only modify their own rows.

`job_market_analytics` is typically publicly readable or readable by any authenticated user for shared insights.

## 🗄️ SQL Definition
(See `schema.sql` in the project root for the exact DDL statements.)
