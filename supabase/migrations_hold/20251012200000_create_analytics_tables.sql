 
 -- Analytics Database Infrastructure
-- Create all analytics tables that the frontend expects
-- This fixes the critical issue where analytics tracking code exists but tables don't exist

-- User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  browser TEXT,
  device_type TEXT,
  os TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  ip_address TEXT,
  country TEXT,
  region TEXT
);

-- Page Views
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  time_on_page INTEGER,
  exited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Activity Logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Interactions
CREATE TABLE IF NOT EXISTS public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Daily Aggregates
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Traffic Metrics
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  -- Performance Metrics
  avg_session_duration NUMERIC DEFAULT 0,
  avg_page_load_time NUMERIC DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  -- User Metrics
  new_users INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  -- Feature Metrics
  rsvps_submitted INTEGER DEFAULT 0,
  rsvps_confirmed INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  guestbook_posts INTEGER DEFAULT 0,
  -- Aggregated Data
  popular_photos JSONB DEFAULT '[]'::jsonb,
  top_pages JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only read access, system can insert)
CREATE POLICY "Admins can manage user_sessions" 
  ON public.user_sessions FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert user_sessions" 
  ON public.user_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update user_sessions" 
  ON public.user_sessions FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can view page_views" 
  ON public.page_views FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert page_views" 
  ON public.page_views FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update page_views" 
  ON public.page_views FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can view user_activity_logs" 
  ON public.user_activity_logs FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert user_activity_logs" 
  ON public.user_activity_logs FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view content_interactions" 
  ON public.content_interactions FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert content_interactions" 
  ON public.content_interactions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view system_metrics" 
  ON public.system_metrics FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert system_metrics" 
  ON public.system_metrics FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage analytics_daily_aggregates" 
  ON public.analytics_daily_aggregates FOR ALL 
  USING (is_admin());

-- Add helpful comments for documentation
COMMENT ON TABLE public.user_sessions IS 'Tracks user sessions with browser info and duration';
COMMENT ON TABLE public.page_views IS 'Records page views with referrer and viewport info';
COMMENT ON TABLE public.user_activity_logs IS 'Logs user actions and interactions';
COMMENT ON TABLE public.content_interactions IS 'Tracks interactions with specific content';
COMMENT ON TABLE public.system_metrics IS 'Stores system performance metrics';
COMMENT ON TABLE public.analytics_daily_aggregates IS 'Daily rollup of analytics data for performance';

-- Create indexes (these may already exist from previous migrations, using IF NOT EXISTS)
-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON public.user_sessions(ended_at) WHERE ended_at IS NOT NULL;

-- Page Views indexes  
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

-- User Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_id ON public.user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type ON public.user_activity_logs(action_type);

-- Content Interactions indexes
CREATE INDEX IF NOT EXISTS idx_content_interactions_session_id ON public.content_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_user_id ON public.content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content_id ON public.content_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_created_at ON public.content_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_interactions_composite ON public.content_interactions(content_type, content_id, interaction_type);

-- System Metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_type ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_composite ON public.system_metrics(metric_type, recorded_at DESC);

-- Analytics Daily Aggregates indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_aggregates_date ON public.analytics_daily_aggregates(date DESC);
