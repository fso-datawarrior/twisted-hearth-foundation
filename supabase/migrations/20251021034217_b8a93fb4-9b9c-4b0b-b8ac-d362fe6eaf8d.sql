-- Add template_variables column to email_campaigns table
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN email_campaigns.template_variables IS 'Dynamic variables to populate in the email template (e.g., VERSION, FEATURES_ADDED, etc.)';