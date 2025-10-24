# Analytics System Runbook

## System Overview

The analytics system tracks user engagement, page views, content interactions, and system performance. It consists of:
- **6 Database Tables**: user_sessions, page_views, user_activity_logs, content_interactions, system_metrics, analytics_daily_aggregates
- **Real-time Tracking**: Automatic session and page view tracking
- **Daily Aggregation**: Automated daily rollup of analytics data
- **Admin Dashboard**: Visual analytics widgets for administrators

---

## Daily Operations

### Check Daily Aggregation Status

Run this query in Supabase SQL Editor to verify daily aggregation is working:

```sql
SELECT 
  date, 
  total_page_views, 
  unique_visitors,
  active_sessions,
  photos_uploaded,
  guestbook_posts,
  rsvps_submitted
FROM analytics_daily_aggregates
ORDER BY date DESC 
LIMIT 7;
```

**Expected Result**: Should show records for the last 7 days with non-zero values.

### Manual Aggregation (If Cron Fails)

If daily aggregation didn't run automatically:

```sql
-- Aggregate data for a specific date
SELECT aggregate_daily_stats('2025-10-13'::DATE);

-- Or for yesterday
SELECT aggregate_daily_stats((CURRENT_DATE - 1)::TEXT);
```

### Backfill Historical Data

To aggregate historical data:

```sql
-- Aggregate last 30 days
DO $$
DECLARE
  target_date DATE;
BEGIN
  FOR target_date IN 
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE - INTERVAL '1 day',
      '1 day'::interval
    )::DATE
  LOOP
    PERFORM public.aggregate_daily_stats(target_date::TEXT);
    RAISE NOTICE 'Aggregated data for %', target_date;
  END LOOP;
END $$;
```

---

## Monitoring Queries

### Traffic Summary (Last 7 Days)

```sql
SELECT 
  COUNT(DISTINCT us.id) as total_sessions,
  COUNT(DISTINCT pv.id) as total_page_views,
  COUNT(DISTINCT us.user_id) FILTER (WHERE us.user_id IS NOT NULL) as authenticated_users,
  COUNT(DISTINCT pv.page_path) as unique_pages_visited,
  ROUND(AVG(us.duration_seconds)::numeric, 2) as avg_session_duration_sec
FROM user_sessions us
LEFT JOIN page_views pv ON pv.session_id = us.id
WHERE us.started_at >= CURRENT_DATE - 7;
```

### Top Pages (Last 30 Days)

```sql
SELECT 
  page_path,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  ROUND(AVG(duration_seconds)::numeric, 2) as avg_time_on_page_sec
FROM page_views
WHERE created_at >= CURRENT_DATE - 30
GROUP BY page_path
ORDER BY total_views DESC
LIMIT 10;
```

### User Engagement Metrics (Last 30 Days)

```sql
SELECT 
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as active_users,
  ROUND(AVG(pages_viewed)::numeric, 2) as avg_pages_per_session,
  ROUND(AVG(actions_taken)::numeric, 2) as avg_actions_per_session,
  ROUND(AVG(duration_seconds)::numeric, 2) as avg_session_duration_sec
FROM user_sessions
WHERE started_at >= CURRENT_DATE - 30;
```

### Content Interactions Summary

```sql
SELECT 
  content_type,
  interaction_type,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT content_id) as unique_content_items,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
FROM content_interactions
WHERE created_at >= CURRENT_DATE - 30
GROUP BY content_type, interaction_type
ORDER BY interaction_count DESC;
```

### Real-time Activity (Last Hour)

```sql
SELECT 
  COUNT(DISTINCT us.id) as active_sessions,
  COUNT(DISTINCT pv.id) as page_views,
  COUNT(DISTINCT ual.id) as user_actions
FROM user_sessions us
LEFT JOIN page_views pv ON pv.session_id = us.id AND pv.created_at >= NOW() - INTERVAL '1 hour'
LEFT JOIN user_activity_logs ual ON ual.session_id = us.id AND ual.created_at >= NOW() - INTERVAL '1 hour'
WHERE us.started_at >= NOW() - INTERVAL '1 hour'
   OR us.ended_at IS NULL;
```

---

## Edge Function Management

### Daily Aggregation Edge Function

**Function Name**: `daily-analytics-aggregation`

**Location**: `supabase/functions/daily-analytics-aggregation/index.ts`

**Manual Invocation**:
```bash
# Via Supabase Functions URL
curl -X POST 'https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/daily-analytics-aggregation' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# With specific date
curl -X POST 'https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/daily-analytics-aggregation?date=2025-10-13' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

**View Logs**:
Go to [Edge Function Logs](https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/functions/daily-analytics-aggregation/logs)

### Scheduled Execution

The edge function should be scheduled to run daily at 1 AM UTC via pg_cron or Supabase Cron Jobs.

**Check Cron Status** (if using pg_cron):
```sql
SELECT * FROM cron.job WHERE jobname = 'daily-analytics-aggregation';
```

**Check Cron History** (if using pg_cron):
```sql
SELECT * 
FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'daily-analytics-aggregation')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## Admin Dashboard Access

### Verify Admin Users

```sql
SELECT 
  p.id,
  p.email,
  p.display_name,
  ur.role,
  ur.created_at as role_assigned_at
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;
```

### Test Admin Dashboard Query

```sql
SELECT get_analytics_summary(
  (CURRENT_DATE - 30)::DATE,
  CURRENT_DATE
);
```

---

## Performance Monitoring

### Check Index Usage

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_sessions', 'page_views', 'user_activity_logs', 'content_interactions')
ORDER BY idx_scan DESC;
```

### Table Size and Row Counts

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as data_size,
  n_live_tup as row_count,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_sessions', 'page_views', 'user_activity_logs', 'content_interactions', 'analytics_daily_aggregates', 'system_metrics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting

### Issue: Daily Aggregation Not Running

**Symptoms**: No new records in `analytics_daily_aggregates` table

**Solutions**:
1. Check cron job status: `SELECT * FROM cron.job;`
2. Check cron job history for errors: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
3. Run manually: `SELECT aggregate_daily_stats(CURRENT_DATE::TEXT);`
4. Check edge function logs in Supabase Dashboard
5. Verify edge function is deployed: Check Supabase Functions page

### Issue: No Data Collecting

**Symptoms**: Zero records in `user_sessions`, `page_views`, etc.

**Solutions**:
1. Verify AnalyticsProvider is wrapping the app in `src/App.tsx`
2. Check browser console for JavaScript errors
3. Verify RLS policies allow inserts: `SELECT * FROM pg_policies WHERE tablename = 'user_sessions';`
4. Test session creation manually:
   ```sql
   INSERT INTO user_sessions (browser, device_type, os) 
   VALUES ('Chrome', 'desktop', 'Windows');
   ```

### Issue: Admin Can't See Analytics Data

**Symptoms**: Admin dashboard shows no data or access denied

**Solutions**:
1. Verify user has admin role:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'USER_UUID_HERE';
   ```
2. Test is_admin() function:
   ```sql
   SELECT is_admin();
   ```
3. Check RLS policies on analytics tables:
   ```sql
   SELECT tablename, policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename LIKE '%analytics%' OR tablename IN ('user_sessions', 'page_views');
   ```

### Issue: Slow Analytics Queries

**Symptoms**: Dashboard takes too long to load

**Solutions**:
1. Verify indexes are being used (see Performance Monitoring section)
2. Check table sizes - if very large, consider data archival
3. Optimize queries to use date ranges:
   ```sql
   -- Always include date filters
   WHERE created_at >= CURRENT_DATE - 30
   ```
4. Consider adding more specific indexes if needed

### Issue: Content Interactions Not Recording

**Symptoms**: Zero records in `content_interactions` table

**Solutions**:
1. Verify tracking calls are in place in components:
   - `PhotoLightbox.tsx` - photo views
   - `UserPhotoActions.tsx` - favorites
   - `GuestbookPost.tsx` - guestbook views
   - `Vignettes.tsx` - vignette views
2. Check browser console for errors
3. Test manual insertion:
   ```sql
   INSERT INTO content_interactions (content_type, content_id, interaction_type, session_id)
   VALUES ('photo', gen_random_uuid(), 'view', gen_random_uuid());
   ```

---

## Data Retention

### Archive Old Data

To keep the database performant, consider archiving old analytics data:

```sql
-- Archive sessions older than 1 year to a backup table
CREATE TABLE IF NOT EXISTS user_sessions_archive (LIKE user_sessions INCLUDING ALL);

INSERT INTO user_sessions_archive 
SELECT * FROM user_sessions 
WHERE started_at < CURRENT_DATE - INTERVAL '1 year';

DELETE FROM user_sessions 
WHERE started_at < CURRENT_DATE - INTERVAL '1 year';
```

### Vacuum and Analyze

After large deletes, optimize tables:

```sql
VACUUM ANALYZE user_sessions;
VACUUM ANALYZE page_views;
VACUUM ANALYZE user_activity_logs;
VACUUM ANALYZE content_interactions;
```

---

## Emergency Contacts

- **Primary Admin**: Check `user_roles` table for admin users
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy
- **Edge Functions**: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/functions
- **Database Logs**: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/logs/postgres-logs

---

## Regular Maintenance Schedule

### Daily
- ✅ Verify daily aggregation ran successfully
- ✅ Check for any edge function errors

### Weekly
- ✅ Review top pages and user engagement metrics
- ✅ Check table sizes and row counts
- ✅ Review content interaction patterns

### Monthly
- ✅ Performance review: Query times, index usage
- ✅ Data retention: Archive old data if needed
- ✅ Security review: Verify RLS policies are working
- ✅ Capacity planning: Check database size trends

---

## Quick Reference: Key Metrics

| Metric | Query | Expected Value |
|--------|-------|----------------|
| Active Sessions (7d) | `SELECT COUNT(*) FROM user_sessions WHERE started_at >= CURRENT_DATE - 7` | > 0 |
| Page Views (7d) | `SELECT COUNT(*) FROM page_views WHERE created_at >= CURRENT_DATE - 7` | > 0 |
| Daily Aggregates | `SELECT COUNT(*) FROM analytics_daily_aggregates WHERE date >= CURRENT_DATE - 7` | 7 records |
| Admin Users | `SELECT COUNT(*) FROM user_roles WHERE role = 'admin'` | >= 1 |
| Avg Session Duration | `SELECT AVG(duration_seconds) FROM user_sessions WHERE started_at >= CURRENT_DATE - 7` | > 0 |

---

**Last Updated**: January 2025
**Version**: 3.5.0
**System Status**: ✅ Production Ready
