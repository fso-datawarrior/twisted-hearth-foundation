-- =====================================================
-- Analytics Infrastructure Migration
-- Phase 2: Database Schema for User Activity Tracking
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- TABLE 1: User Activity Logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_session_id ON public.user_activity_logs(session_id);
CREATE INDEX idx_activity_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_category ON public.user_activity_logs(action_category);
CREATE INDEX idx_activity_type ON public.user_activity_logs(action_type);

-- =====================================================
-- TABLE 2: Page Views
-- =====================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  time_on_page INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ
);

CREATE INDEX idx_pageviews_user_id ON public.page_views(user_id);
CREATE INDEX idx_pageviews_session_id ON public.page_views(session_id);
CREATE INDEX idx_pageviews_path ON public.page_views(page_path);
CREATE INDEX idx_pageviews_created_at ON public.page_views(created_at DESC);

-- =====================================================
-- TABLE 3: User Sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  country TEXT,
  region TEXT
);

CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX idx_sessions_device ON public.user_sessions(device_type);

-- =====================================================
-- TABLE 4: Content Interactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_user_id ON public.content_interactions(user_id);
CREATE INDEX idx_interactions_content ON public.content_interactions(content_type, content_id);
CREATE INDEX idx_interactions_type ON public.content_interactions(interaction_type);
CREATE INDEX idx_interactions_created_at ON public.content_interactions(created_at DESC);

-- =====================================================
-- TABLE 5: System Metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX idx_metrics_recorded_at ON public.system_metrics(recorded_at DESC);

-- =====================================================
-- TABLE 6: Analytics Daily Aggregates
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  guestbook_posts INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  rsvps_submitted INTEGER DEFAULT 0,
  rsvps_confirmed INTEGER DEFAULT 0,
  top_pages JSONB DEFAULT '[]'::jsonb,
  popular_photos JSONB DEFAULT '[]'::jsonb,
  avg_page_load_time NUMERIC DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aggregates_date ON public.analytics_daily_aggregates(date DESC);

-- =====================================================
-- FUNCTION 1: Track Activity
-- =====================================================
CREATE OR REPLACE FUNCTION public.track_activity(
  p_action_type TEXT,
  p_action_category TEXT,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
  v_session_id UUID;
BEGIN
  v_session_id := COALESCE(p_session_id, gen_random_uuid());
  
  INSERT INTO public.user_activity_logs (
    user_id, session_id, action_type, action_category, action_details
  )
  VALUES (
    auth.uid(), v_session_id, p_action_type, p_action_category, p_action_details
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- =====================================================
-- FUNCTION 2: Track Page View
-- =====================================================
CREATE OR REPLACE FUNCTION public.track_page_view(
  p_page_path TEXT,
  p_page_title TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_viewport_width INTEGER DEFAULT NULL,
  p_viewport_height INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_page_view_id UUID;
  v_session_id UUID;
BEGIN
  v_session_id := COALESCE(p_session_id, gen_random_uuid());
  
  INSERT INTO public.page_views (
    user_id, session_id, page_path, page_title, referrer, 
    viewport_width, viewport_height
  )
  VALUES (
    auth.uid(), v_session_id, p_page_path, p_page_title, p_referrer,
    p_viewport_width, p_viewport_height
  )
  RETURNING id INTO v_page_view_id;
  
  RETURN v_page_view_id;
END;
$$;

-- =====================================================
-- FUNCTION 3: Get Analytics Dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_analytics_dashboard(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view analytics';
  END IF;
  
  SELECT jsonb_build_object(
    'user_engagement', (
      SELECT jsonb_build_object(
        'total_users', COUNT(DISTINCT user_id),
        'active_sessions', COUNT(DISTINCT id),
        'avg_session_duration', COALESCE(AVG(duration_seconds), 0)
      )
      FROM public.user_sessions
      WHERE started_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'content_metrics', (
      SELECT jsonb_build_object(
        'photos_uploaded', COUNT(*) FILTER (WHERE action_type = 'photo_upload'),
        'guestbook_posts', COUNT(*) FILTER (WHERE action_type = 'guestbook_post'),
        'hunt_completions', COUNT(*) FILTER (WHERE action_type = 'hunt_completed')
      )
      FROM public.user_activity_logs
      WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'page_views', (
      SELECT jsonb_build_object(
        'total_views', COUNT(*),
        'unique_visitors', COUNT(DISTINCT user_id)
      )
      FROM public.page_views
      WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'rsvp_metrics', (
      SELECT jsonb_build_object(
        'total_rsvps', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending')
      )
      FROM public.rsvps
      WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- FUNCTION 4: Aggregate Daily Stats
-- =====================================================
CREATE OR REPLACE FUNCTION public.aggregate_daily_stats(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analytics_daily_aggregates (
    date,
    total_users,
    new_users,
    active_sessions,
    avg_session_duration,
    photos_uploaded,
    guestbook_posts,
    total_page_views,
    unique_visitors,
    rsvps_submitted,
    rsvps_confirmed
  )
  SELECT
    p_date,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_sessions WHERE started_at::DATE = p_date),
    (SELECT COUNT(DISTINCT id) FROM public.profiles WHERE created_at::DATE = p_date),
    (SELECT COUNT(DISTINCT id) FROM public.user_sessions WHERE started_at::DATE = p_date),
    (SELECT COALESCE(AVG(duration_seconds), 0) FROM public.user_sessions WHERE started_at::DATE = p_date),
    (SELECT COUNT(*) FROM public.user_activity_logs WHERE action_type = 'photo_upload' AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM public.user_activity_logs WHERE action_type = 'guestbook_post' AND created_at::DATE = p_date),
    (SELECT COUNT(*) FROM public.page_views WHERE created_at::DATE = p_date),
    (SELECT COUNT(DISTINCT user_id) FROM public.page_views WHERE created_at::DATE = p_date),
    (SELECT COUNT(*) FROM public.rsvps WHERE created_at::DATE = p_date),
    (SELECT COUNT(*) FROM public.rsvps WHERE status = 'confirmed' AND created_at::DATE = p_date)
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_sessions = EXCLUDED.active_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration,
    photos_uploaded = EXCLUDED.photos_uploaded,
    guestbook_posts = EXCLUDED.guestbook_posts,
    total_page_views = EXCLUDED.total_page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    rsvps_submitted = EXCLUDED.rsvps_submitted,
    rsvps_confirmed = EXCLUDED.rsvps_confirmed,
    updated_at = now();
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY: User Activity Logs
-- =====================================================
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON public.user_activity_logs FOR SELECT
  USING (is_admin());

-- =====================================================
-- ROW LEVEL SECURITY: Page Views
-- =====================================================
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own page views"
  ON public.page_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT
  USING (is_admin());

-- =====================================================
-- ROW LEVEL SECURITY: User Sessions
-- =====================================================
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (is_admin());

-- =====================================================
-- ROW LEVEL SECURITY: Content Interactions
-- =====================================================
ALTER TABLE public.content_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON public.content_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert interactions"
  ON public.content_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all interactions"
  ON public.content_interactions FOR SELECT
  USING (is_admin());

-- =====================================================
-- ROW LEVEL SECURITY: System Metrics
-- =====================================================
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view system metrics"
  ON public.system_metrics FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert metrics"
  ON public.system_metrics FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ROW LEVEL SECURITY: Analytics Daily Aggregates
-- =====================================================
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view aggregates"
  ON public.analytics_daily_aggregates FOR SELECT
  USING (is_admin());

CREATE POLICY "System can manage aggregates"
  ON public.analytics_daily_aggregates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update aggregates"
  ON public.analytics_daily_aggregates FOR UPDATE
  USING (true);

-- =====================================================
-- CRON JOB: Daily Aggregation
-- =====================================================
SELECT cron.schedule(
  'aggregate-daily-stats',
  '0 1 * * *',
  $$SELECT public.aggregate_daily_stats(CURRENT_DATE - INTERVAL '1 day');$$
);