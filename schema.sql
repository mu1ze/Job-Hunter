-- Job Hunter - Initial Database Schema

-- Users extended profile
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Job search preferences
CREATE TABLE IF NOT EXISTS job_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    target_roles TEXT[],
    target_industries TEXT[],
    location TEXT,
    remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'any')),
    salary_min INTEGER,
    salary_max INTEGER,
    search_radius_miles INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON job_preferences;
CREATE POLICY "Users can manage their own preferences" ON job_preferences FOR ALL USING (auth.uid() = user_id);

-- Saved job listings
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_job_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    job_url TEXT,
    description TEXT,
    requirements TEXT[],
    skills_required TEXT[],
    posted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'offer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own saved jobs" ON saved_jobs;
CREATE POLICY "Users can manage their own saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- User resumes (parsed data)
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT,
    storage_path TEXT,
    parsed_data JSONB,
    extracted_skills TEXT[],
    work_experience JSONB[],
    education JSONB[],
    certifications TEXT[],
    summary TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;
CREATE POLICY "Users can manage their own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);

-- Generated documents
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id),
    job_id UUID REFERENCES saved_jobs(id),
    document_type TEXT CHECK (document_type IN ('resume', 'cover_letter')),
    content TEXT,
    ats_score INTEGER,
    matched_keywords TEXT[],
    missing_keywords TEXT[],
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own generated documents" ON generated_documents;
CREATE POLICY "Users can manage their own generated documents" ON generated_documents FOR ALL USING (auth.uid() = user_id);

-- Job market analytics cache
CREATE TABLE IF NOT EXISTS job_market_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query TEXT,
    location TEXT,
    total_jobs INTEGER,
    avg_salary_min INTEGER,
    avg_salary_max INTEGER,
    top_skills JSONB,
    top_companies JSONB,
    remote_percentage FLOAT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_market_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view analytics" ON job_market_analytics;
CREATE POLICY "Everyone can view analytics" ON job_market_analytics FOR SELECT USING (true);
