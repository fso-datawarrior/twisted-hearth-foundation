-- Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  preview_text TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_list TEXT NOT NULL, -- 'all', 'rsvp_yes', 'rsvp_pending', 'custom'
  custom_recipients TEXT[], -- Array of email addresses for custom lists
  subject TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "bounced": 0, "failed": 0}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Recipients Tracking Table
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE(campaign_id, email)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage templates" 
  ON public.email_templates 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can manage campaigns" 
  ON public.email_campaigns 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for campaign_recipients
CREATE POLICY "Admins can view recipients" 
  ON public.campaign_recipients 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "System can insert recipients" 
  ON public.campaign_recipients 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update recipients" 
  ON public.campaign_recipients 
  FOR UPDATE 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_email_templates_created_by ON public.email_templates(created_by);
CREATE INDEX idx_email_templates_is_active ON public.email_templates(is_active);
CREATE INDEX idx_email_campaigns_created_by ON public.email_campaigns(created_by);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_status ON public.campaign_recipients(status);

-- Create updated_at trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();