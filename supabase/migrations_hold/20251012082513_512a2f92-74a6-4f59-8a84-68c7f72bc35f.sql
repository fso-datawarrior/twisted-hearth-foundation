-- Add performance indexes for analytics tables
-- These indexes optimize common query patterns for the admin analytics dashboard

-- User Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id 
  ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at 
  ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type 
  ON public.user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_id 
  ON public.user_activity_logs(session_id);

-- Page Views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user_id 
  ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at 
  ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path 
  ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id 
  ON public.page_views(session_id);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
  ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at 
  ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at 
  ON public.user_sessions(ended_at DESC) WHERE ended_at IS NOT NULL;

-- Content Interactions indexes
CREATE INDEX IF NOT EXISTS idx_content_interactions_user_id 
  ON public.content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_created_at 
  ON public.content_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content_type 
  ON public.content_interactions(content_type);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content_id 
  ON public.content_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_composite 
  ON public.content_interactions(content_type, content_id, interaction_type);

-- System Metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at 
  ON public.system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_type 
  ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_composite 
  ON public.system_metrics(metric_type, recorded_at DESC);

-- Analytics Daily Aggregates indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_aggregates_date 
  ON public.analytics_daily_aggregates(date DESC);

-- Add helpful database function for analytics queries
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
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
  -- Only admins can access analytics
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view analytics';
  END IF;

  SELECT jsonb_build_object(
    'total_page_views', COALESCE(SUM(total_page_views), 0),
    'unique_visitors', COALESCE(SUM(unique_visitors), 0),
    'avg_session_duration', COALESCE(AVG(avg_session_duration), 0),
    'total_rsvps', COALESCE(SUM(rsvps_submitted), 0),
    'total_photos', COALESCE(SUM(photos_uploaded), 0),
    'total_guestbook_posts', COALESCE(SUM(guestbook_posts), 0),
    'date_range', jsonb_build_object(
      'start', p_start_date,
      'end', p_end_date
    )
  )
  INTO v_result
  FROM public.analytics_daily_aggregates
  WHERE date BETWEEN p_start_date AND p_end_date;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;