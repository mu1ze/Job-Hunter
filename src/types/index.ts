// User profile extended from Supabase auth
export interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    created_at: string;
    updated_at: string;
}

// Job search preferences
export interface JobPreferences {
    id: string;
    user_id: string;
    target_roles: string[];
    target_industries: string[];
    location: string | null;
    remote_preference: "remote" | "hybrid" | "onsite" | "any";
    salary_min: number | null;
    salary_max: number | null;
    search_radius_miles: number;
    use_global_filters: boolean;
    created_at: string;
    updated_at: string;
}

// Job listing from external APIs
export interface JobListing {
    id: string;
    external_job_id: string;
    title: string;
    company: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_range?: string;
    job_url: string;
    description: string;
    requirements: string[];
    skills_required: string[];
    posted_at: string;
    source: "adzuna" | "indeed" | "theirstack" | "other";
    remote?: boolean;
    job_type?: "full-time" | "part-time" | "contract" | "internship";
    __match_score?: number;
    __match_reason?: string;
}

// Saved job with user-specific status
export interface SavedJob extends JobListing {
    user_id: string;
    status: "saved" | "applied" | "interviewing" | "rejected" | "offer";
    notes: string | null;
    created_at: string;
    applied_date?: string | null;
    interview_date?: string | null;
    offer_date?: string | null;
    rejected_date?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    company_url?: string | null;
    recruiter_phone?: string | null;
    recruiter_linkedin?: string | null;
}

export interface CareerItem {
    id: string;
    user_id: string;
    type: "role" | "certification" | "skill";
    title: string;
    description?: string;
    url?: string;
    status: "saved" | "in_progress" | "completed";
    created_at: string;
}

// Parsed resume data
export interface ParsedResume {
    id: string;
    user_id: string;
    original_filename: string;
    storage_path: string;
    parsed_data: Record<string, unknown>;
    extracted_skills: string[];
    work_experience: WorkExperience[];
    education: Education[];
    certifications: string[];
    summary: string | null;
    is_primary: boolean;
    created_at: string;
}

export interface WorkExperience {
    company: string;
    title: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description: string;
    achievements: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field_of_study: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
}

// Generated documents
export interface GeneratedDocument {
    id: string;
    user_id: string;
    resume_id: string;
    job_id: string;
    document_type: "resume" | "cover_letter";
    content: string;
    ats_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    storage_path: string | null;
    created_at: string;
}

// Job market analytics
export interface JobMarketAnalytics {
    id: string;
    search_query: string;
    location: string;
    total_jobs: number;
    avg_salary_min: number | null;
    avg_salary_max: number | null;
    top_skills: Record<string, number>;
    top_companies: Record<string, number>;
    remote_percentage: number;
    fetched_at: string;
}

// API response types
export interface AdzunaJob {
    id: string;
    title: string;
    company: {
        display_name: string;
    };
    location: {
        display_name: string;
        area: string[];
    };
    description: string;
    salary_min?: number;
    salary_max?: number;
    redirect_url: string;
    created: string;
    category: {
        label: string;
        tag: string;
    };
    contract_time?: string;
    contract_type?: string;
}

export interface AdzunaSearchResponse {
    count: number;
    results: AdzunaJob[];
    mean: number;
}

// Form types
export interface JobSearchFilters {
    query: string;
    location: string;
    radius: number;
    remote_only: boolean;
    salary_min?: number;
    salary_max?: number;
    job_type?: string;
    sort_by: "relevance" | "date" | "salary";
    country?: string;
}

export interface OnboardingData {
    full_name: string;
    location: string;
    target_roles: string[];
    target_industries: string[];
    remote_preference: "remote" | "hybrid" | "onsite" | "any";
    salary_min?: number;
    salary_max?: number;
}

export interface ResumeAnalysis {
    id: string;
    user_id: string;
    resume_id: string;
    analysis_data: {
        analysis: {
            readiness_score: number;
            recommended_roles: string[];
            skill_gaps: string[];
        };
        marketInsights: string;
    };
    created_at: string;
}
