-- Analytics Database Migration - Fixed
-- Ensures all analytics tables, indexes, and functions are properly configured

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_id ON public.user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type ON public.user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_content_interactions_session_id ON public.content_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content_type ON public.content_interactions(content_type);

-- Add missing column to page_views for duration tracking
ALTER TABLE public.page_views 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Update page_views trigger to calculate duration
CREATE OR REPLACE FUNCTION public.update_page_view_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.exited_at IS NOT NULL AND NEW.created_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.exited_at - NEW.created_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_page_view_duration ON public.page_views;
CREATE TRIGGER set_page_view_duration
  BEFORE UPDATE OF exited_at ON public.page_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_page_view_duration();

-- Ensure system can update page_views for duration tracking
DROP POLICY IF EXISTS "System can update page views" ON public.page_views;
CREATE POLICY "System can update page views"
  ON public.page_views
  FOR UPDATE
  USING (true);

-- Add helper function to get analytics date range
CREATE OR REPLACE FUNCTION public.get_analytics_date_range()
RETURNS TABLE(
  start_date DATE,
  end_date DATE,
  days_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(MIN(started_at::DATE), CURRENT_DATE - INTERVAL '30 days')::DATE as start_date,
    CURRENT_DATE as end_date,
    COALESCE(CURRENT_DATE - MIN(started_at::DATE), 30) as days_count
  FROM public.user_sessions;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.analytics_daily_aggregates TO authenticated;
GRANT SELECT ON public.user_sessions TO authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT SELECT ON public.user_activity_logs TO authenticated;
GRANT SELECT ON public.content_interactions TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.analytics_daily_aggregates IS 'Stores daily aggregated analytics metrics for dashboard display';
COMMENT ON FUNCTION public.track_activity IS 'Tracks user activities and events throughout the application';
COMMENT ON FUNCTION public.track_page_view IS 'Records page views with session and viewport information';
COMMENT ON FUNCTION public.get_analytics_summary IS 'Returns analytics summary for admin dashboard';
COMMENT ON FUNCTION public.aggregate_daily_stats IS 'Aggregates daily statistics for analytics reporting';