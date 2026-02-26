-- Job Hunter - Consolidated Database Schema
-- Run this to create all tables and apply all migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users extended profile
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    use_global_filters BOOLEAN DEFAULT false,
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
    salary_min INTEGER,
    salary_max INTEGER,
    job_url TEXT,
    description TEXT,
    requirements TEXT[],
    skills_required TEXT[],
    posted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'offer')),
    notes TEXT,
    applied_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    offer_date TIMESTAMPTZ,
    rejected_date TIMESTAMPTZ,
    job_type TEXT,
    remote BOOLEAN DEFAULT false,
    contact_name TEXT,
    contact_email TEXT,
    company_url TEXT,
    recruiter_phone TEXT,
    recruiter_linkedin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Job alerts
CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    keywords TEXT[],
    location VARCHAR(255),
    min_salary INTEGER,
    remote_only BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, title)
);

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own job alerts" ON job_alerts;
CREATE POLICY "Users can manage their own job alerts" ON job_alerts FOR ALL USING (auth.uid() = user_id);

-- Career items
CREATE TABLE IF NOT EXISTS career_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('role', 'certification', 'skill')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE career_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own career items" ON career_items;
CREATE POLICY "Users can view their own career items" ON career_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own career items" ON career_items;
CREATE POLICY "Users can insert their own career items" ON career_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own career items" ON career_items;
CREATE POLICY "Users can update their own career items" ON career_items FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own career items" ON career_items;
CREATE POLICY "Users can delete their own career items" ON career_items FOR DELETE USING (auth.uid() = user_id);

-- Resume analyses
CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own resume analyses" ON resume_analyses;
CREATE POLICY "Users can view their own resume analyses" ON resume_analyses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own resume analyses" ON resume_analyses;
CREATE POLICY "Users can insert their own resume analyses" ON resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own resume analyses" ON resume_analyses;
CREATE POLICY "Users can delete their own resume analyses" ON resume_analyses FOR DELETE USING (auth.uid() = user_id);

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('job_alert', 'application_update', 'interview', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.job_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON job_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_career_items_user_id ON career_items(user_id);
CREATE INDEX IF NOT EXISTS idx_career_items_type ON career_items(type);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_status ON saved_jobs(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_applied_date ON saved_jobs(applied_date);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_status ON saved_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_resume_id ON resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Grant access to storage
GRANT ALL ON storage.objects TO service_role;
