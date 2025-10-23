-- Create release management system for The Ruths' Bash

-- System Releases Table
CREATE TABLE IF NOT EXISTS public.system_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  major_version INTEGER NOT NULL,
  minor_version INTEGER NOT NULL,
  patch_version INTEGER NOT NULL,
  pre_release TEXT,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development')),
  deployment_status TEXT NOT NULL DEFAULT 'draft' CHECK (deployment_status IN ('draft', 'scheduled', 'deployed', 'failed')),
  summary TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.release_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  benefit TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.release_api_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('added', 'modified', 'deprecated', 'removed')),
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.release_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('ui_update', 'bug_fix', 'improvement', 'database_change', 'breaking_change', 'known_issue')),
  description TEXT NOT NULL,
  component TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('technical', 'additional')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_releases_version ON public.system_releases(version);
CREATE INDEX idx_system_releases_status ON public.system_releases(deployment_status);
CREATE INDEX idx_system_releases_archived ON public.system_releases(is_archived);

ALTER TABLE public.system_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_api_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage releases" ON public.system_releases FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage release features" ON public.release_features FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage release API changes" ON public.release_api_changes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage release changes" ON public.release_changes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage release notes" ON public.release_notes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public can view deployed releases" ON public.system_releases FOR SELECT USING (deployment_status = 'deployed' AND is_archived = FALSE);