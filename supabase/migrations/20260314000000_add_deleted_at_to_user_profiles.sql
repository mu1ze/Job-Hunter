-- Migration to add deleted_at for soft deletion strategy
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add a table for tracking deletion logs (no PII stored)
CREATE TABLE IF NOT EXISTS deletion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deleted_user_id UUID NOT NULL, -- Keep ID but no PII
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    ip_address TEXT,
    success BOOLEAN DEFAULT true
);
