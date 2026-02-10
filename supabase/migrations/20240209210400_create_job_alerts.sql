-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create job_alerts table for email notifications
CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    keywords TEXT[], -- Array of keywords to match
    location VARCHAR(255),
    min_salary INTEGER,
    remote_only BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly'
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, title)
);

-- Enable RLS
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own alerts
CREATE POLICY "Users can manage their own job alerts"
ON job_alerts FOR ALL
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON job_alerts(is_active) WHERE is_active = true;

-- Add comment
COMMENT ON TABLE job_alerts IS 'User-configured job alerts for email notifications';
COMMENT ON COLUMN job_alerts.keywords IS 'Array of keywords to match in job titles/descriptions';
COMMENT ON COLUMN job_alerts.notification_frequency IS 'How often to send alerts: daily or weekly';
COMMENT ON COLUMN job_alerts.last_sent_at IS 'Timestamp of last email sent for this alert';
