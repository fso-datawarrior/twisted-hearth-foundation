-- Create support_reports table
CREATE TABLE IF NOT EXISTS public.support_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  user_agent TEXT,
  browser_logs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.support_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can create reports (including anonymous users)
CREATE POLICY "Anyone can create reports"
  ON public.support_reports FOR INSERT
  WITH CHECK (true);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.support_reports FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.support_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Add indexes for performance
CREATE INDEX idx_support_reports_created_at ON public.support_reports(created_at DESC);
CREATE INDEX idx_support_reports_status ON public.support_reports(status);
CREATE INDEX idx_support_reports_email ON public.support_reports(email);

-- Create support-screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-screenshots', 'support-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload support screenshots
CREATE POLICY "Anyone can upload support screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'support-screenshots');

-- Allow anyone to view support screenshots (public bucket)
CREATE POLICY "Anyone can view support screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'support-screenshots');