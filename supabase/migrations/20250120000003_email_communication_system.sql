-- Create email_campaigns table to track bulk emails
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message_html TEXT NOT NULL,
  message_text TEXT NOT NULL,
  recipient_filter TEXT NOT NULL CHECK (recipient_filter IN ('all_rsvps', 'confirmed_rsvps', 'pending_rsvps', 'all_users')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email campaigns
CREATE POLICY "Admins can manage email campaigns"
  ON public.email_campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Track individual email sends
CREATE TABLE IF NOT EXISTS public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email sends"
  ON public.email_sends FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status, created_at DESC);
CREATE INDEX idx_email_sends_campaign ON public.email_sends(campaign_id, status);
CREATE INDEX idx_email_sends_status ON public.email_sends(status, sent_at);

-- Function to get email recipients based on filter
CREATE OR REPLACE FUNCTION public.get_email_recipients(p_filter TEXT)
RETURNS TABLE (email TEXT, name TEXT, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can get email recipients';
  END IF;

  RETURN QUERY
  CASE p_filter
    WHEN 'all_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'confirmed_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.status = 'confirmed' AND r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'pending_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.status = 'pending' AND r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'all_users' THEN
      SELECT DISTINCT au.email, 
             COALESCE(p.display_name, au.email) as name,
             au.id as user_id
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.id = au.id
      WHERE au.email IS NOT NULL
      ORDER BY name;
    
    ELSE
      RAISE EXCEPTION 'Invalid recipient filter: %', p_filter;
  END CASE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_recipients TO authenticated;

-- Trigger for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
