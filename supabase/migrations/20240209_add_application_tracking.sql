-- Add application tracking fields to saved_jobs table
-- This enables tracking job applications through their lifecycle

-- Add date tracking columns
ALTER TABLE saved_jobs
ADD COLUMN IF NOT EXISTS applied_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS offer_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_date TIMESTAMPTZ;

-- Add notes and contact tracking
ALTER TABLE saved_jobs
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_status 
ON saved_jobs(user_id, status);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_applied_date 
ON saved_jobs(user_id, applied_date DESC) 
WHERE applied_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN saved_jobs.applied_date IS 'Timestamp when user applied to this job';
COMMENT ON COLUMN saved_jobs.interview_date IS 'Timestamp when user had/scheduled interview';
COMMENT ON COLUMN saved_jobs.offer_date IS 'Timestamp when offer was received';
COMMENT ON COLUMN saved_jobs.rejected_date IS 'Timestamp when application was rejected';
COMMENT ON COLUMN saved_jobs.notes IS 'User notes about this application';
COMMENT ON COLUMN saved_jobs.contact_name IS 'Recruiter/hiring manager name';
COMMENT ON COLUMN saved_jobs.contact_email IS 'Contact email for follow-ups';
