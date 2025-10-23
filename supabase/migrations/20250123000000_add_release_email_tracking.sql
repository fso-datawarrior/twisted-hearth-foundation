-- Add email tracking fields to system_releases table
-- File: supabase/migrations/20250123000000_add_release_email_tracking.sql

-- Add email type and recipient count tracking fields
ALTER TABLE public.system_releases 
ADD COLUMN IF NOT EXISTS email_type_sent TEXT CHECK (email_type_sent IN ('admin', 'user', 'both')),
ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;

-- Add index for email tracking queries
CREATE INDEX IF NOT EXISTS idx_system_releases_email_sent ON public.system_releases(email_sent, email_sent_at);

-- Update comment for better documentation
COMMENT ON COLUMN public.system_releases.email_type_sent IS 'Type of email sent: admin (technical), user (friendly), or both';
COMMENT ON COLUMN public.system_releases.recipient_count IS 'Number of recipients the email was sent to';
COMMENT ON COLUMN public.system_releases.email_sent IS 'Whether an email announcement has been sent for this release';
COMMENT ON COLUMN public.system_releases.email_sent_at IS 'Timestamp when the email was sent';
