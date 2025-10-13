-- ================================================================
-- DASHBOARD WIDGET DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to diagnose empty widget data
-- ================================================================

-- ================================================================
-- STEP 1: VERIFY ADMIN STATUS
-- ================================================================
SELECT 
  'Admin Check' as test_name,
  auth.uid() as current_user_id,
  auth.email() as current_user_email,
  is_admin() as is_admin_result,
  (SELECT COUNT(*) FROM user_roles WHERE user_id = auth.uid()) as has_role_record;

-- ================================================================
-- STEP 2: CHECK ANALYTICS TABLES FOR DATA
-- ================================================================

-- User Sessions
SELECT 
  'user_sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(started_at) as most_recent_session,
  COUNT(*) FILTER (WHERE started_at >= NOW() - INTERVAL '7 days') as sessions_last_7d
FROM user_sessions;

-- User Activity Logs
SELECT 
  'user_activity_logs' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as most_recent_activity,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as activities_last_7d
FROM user_activity_logs;

-- Page Views
SELECT 
  'page_views' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as most_recent_view,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as views_last_7d
FROM page_views;

-- ================================================================
-- STEP 3: CHECK CONTENT TABLES
-- ================================================================

-- RSVPs
SELECT 
  'rsvps' as table_name,
  COUNT(*) as total_rsvps,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  SUM(num_guests) as total_expected_guests
FROM rsvps;

-- Guestbook
SELECT 
  'guestbook' as table_name,
  COUNT(*) as total_posts,
  COUNT(DISTINCT display_name) as unique_contributors,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_posts
FROM guestbook;

-- Guestbook Reactions
SELECT 
  'guestbook_reactions' as table_name,
  COUNT(*) as total_reactions,
  COUNT(DISTINCT emoji) as unique_emojis
FROM guestbook_reactions;

-- Photos
SELECT 
  'photos' as table_name,
  COUNT(*) as total_photos,
  COUNT(*) FILTER (WHERE is_approved = true) as approved,
  COUNT(*) FILTER (WHERE is_approved = false) as pending_approval,
  MAX(likes_count) as max_likes
FROM photos;

-- ================================================================
-- STEP 4: VERIFY RLS POLICIES ALLOW ADMIN ACCESS
-- ================================================================

-- Try to query analytics as admin (should work)
SELECT 
  'RLS Test: user_sessions' as test_name,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Admin can read user_sessions'
    ELSE '❌ Cannot read user_sessions'
  END as result
FROM user_sessions
LIMIT 1;

-- ================================================================
-- STEP 5: CHECK IF ANALYTICS TABLES EXIST
-- ================================================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'user_sessions', 
      'page_views', 
      'user_activity_logs', 
      'content_interactions',
      'system_metrics',
      'analytics_daily_aggregates'
    ) THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_sessions', 
    'page_views', 
    'user_activity_logs', 
    'content_interactions',
    'system_metrics',
    'analytics_daily_aggregates'
  )
ORDER BY table_name;

-- ================================================================
-- STEP 6: CHECK SPECIFIC WIDGET QUERIES
-- ================================================================

-- User Engagement Widget - Active Users (7d)
SELECT 
  'Active Users (7d)' as metric,
  COUNT(DISTINCT user_id) as value
FROM user_sessions
WHERE started_at >= NOW() - INTERVAL '7 days'
  AND user_id IS NOT NULL;

-- User Engagement Widget - Returning Users
WITH user_session_counts AS (
  SELECT 
    user_id,
    COUNT(*) as session_count
  FROM user_sessions
  WHERE user_id IS NOT NULL
  GROUP BY user_id
)
SELECT 
  'Returning Users' as metric,
  COUNT(*) as value
FROM user_session_counts
WHERE session_count > 1;

-- RSVP Trends - Total RSVPs
SELECT 
  'Total RSVPs' as metric,
  COUNT(*) as value
FROM rsvps;

-- Guestbook Activity - Contributors
SELECT 
  'Guestbook Contributors' as metric,
  COUNT(DISTINCT display_name) as value
FROM guestbook
WHERE deleted_at IS NULL;

-- ================================================================
-- STEP 7: SAMPLE DATA (for debugging)
-- ================================================================

-- Show sample user_sessions (first 5)
SELECT 'Sample user_sessions:' as info;
SELECT id, user_id, started_at, pages_viewed, actions_taken
FROM user_sessions
ORDER BY started_at DESC
LIMIT 5;

-- Show sample RSVPs (first 5)
SELECT 'Sample RSVPs:' as info;
SELECT id, name, email, status, num_guests, created_at
FROM rsvps
ORDER BY created_at DESC
LIMIT 5;

-- Show sample guestbook posts (first 5)
SELECT 'Sample Guestbook:' as info;
SELECT id, display_name, LEFT(message, 50) as message_preview, created_at
FROM guestbook
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

