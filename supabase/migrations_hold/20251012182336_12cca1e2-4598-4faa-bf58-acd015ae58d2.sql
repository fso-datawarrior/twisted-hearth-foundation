-- Analytics Performance Indexes
-- Add indexes to optimize analytics queries

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON public.user_sessions(ended_at);

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

-- Analytics Daily Aggregates indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_aggregates_date ON public.analytics_daily_aggregates(date DESC);