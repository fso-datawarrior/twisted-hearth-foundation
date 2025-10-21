-- Add category and text_content columns to email_templates table
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS text_content TEXT;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_category 
ON email_templates(category);

-- Update existing templates with default category
UPDATE email_templates 
SET category = 'general'
WHERE category IS NULL;

COMMENT ON COLUMN email_templates.category IS 'Template category for filtering and organization (e.g., system-admin, system-user, general)';
COMMENT ON COLUMN email_templates.text_content IS 'Plain text version of email content for email clients that do not support HTML';