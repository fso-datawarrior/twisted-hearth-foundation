# Analytics System Verification & Testing - Lovable AI Prompt

## Objective
After completing the analytics database migration, verify that the entire analytics system is operational, collecting data correctly, and displaying information in the admin dashboard.

## Prerequisites
✅ Analytics tables migration completed successfully (see Analytics-Migration-Prompt.md)
✅ All 6 analytics tables exist in database
✅ RLS policies and indexes are in place

## Critical Files to Review
- `src/contexts/AnalyticsContext.tsx` - Analytics provider
- `src/lib/analytics-api.ts` - Analytics tracking functions
- `src/hooks/use-session-tracking.ts` - Session management
- `src/hooks/use-analytics-tracking.ts` - Page view and activity tracking
- `src/components/admin/AnalyticsWidgets.tsx` - Admin dashboard widgets
- `src/pages/AdminDashboard.tsx` - Admin dashboard integration

---

## PART 1: Database Data Verification

### Step 1: Check for Existing Analytics Data

Run these queries in Supabase SQL Editor to check current data state:

#### Count existing records:
```sql
-- Check all analytics tables for existing data
SELECT 
  'user_sessions' as table_name, 
  COUNT(*) as record_count 
FROM public.user_sessions
UNION ALL
SELECT 
  'page_views', 
  COUNT(*) 
FROM public.page_views
UNION ALL
SELECT 
  'user_activity_logs', 
  COUNT(*) 
FROM public.user_activity_logs
UNION ALL
SELECT 
  'content_interactions', 
  COUNT(*) 
FROM public.content_interactions
UNION ALL
SELECT 
  'system_metrics', 
  COUNT(*) 
FROM public.system_metrics
UNION ALL
SELECT 
  'analytics_daily_aggregates', 
  COUNT(*) 
FROM public.analytics_daily_aggregates
ORDER BY table_name;
```

#### View recent sessions (last 10):
```sql
SELECT 
  id,
  user_id,
  browser,
  device_type,
  os,
  started_at,
  ended_at,
  duration_seconds,
  pages_viewed,
  actions_taken,
  country,
  region
FROM public.user_sessions
ORDER BY started_at DESC
LIMIT 10;
```

#### View recent page views (last 20):
```sql
SELECT 
  id,
  session_id,
  page_path,
  page_title,
  referrer,
  viewport_width,
  viewport_height,
  time_on_page,
  created_at
FROM public.page_views
ORDER BY created_at DESC
LIMIT 20;
```

#### View recent user activities (last 20):
```sql
SELECT 
  id,
  session_id,
  action_type,
  action_category,
  action_details,
  created_at
FROM public.user_activity_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Step 2: Test Data Collection Manually

If no data exists or data is minimal, test the tracking system:

#### Create a test session:
```sql
-- Manual test: Insert a test session
INSERT INTO public.user_sessions (
  browser,
  device_type,
  os,
  started_at,
  pages_viewed,
  actions_taken
) VALUES (
  'Chrome',
  'desktop',
  'Windows',
  NOW(),
  0,
  0
) RETURNING id;

-- Note the returned session ID for next tests
```

#### Create test page views:
```sql
-- Replace <SESSION_ID> with the ID from previous query
INSERT INTO public.page_views (
  session_id,
  page_path,
  page_title,
  viewport_width,
  viewport_height,
  created_at
) VALUES (
  '<SESSION_ID>',
  '/',
  'Home',
  1920,
  1080,
  NOW()
);
```

#### Create test activity logs:
```sql
INSERT INTO public.user_activity_logs (
  session_id,
  action_type,
  action_category,
  action_details,
  created_at
) VALUES (
  '<SESSION_ID>',
  'navigation',
  'user_interaction',
  '{"page": "home", "event": "test"}',
  NOW()
);
```

---

## PART 2: Frontend Analytics Integration Testing

### Step 3: Verify AnalyticsProvider Integration

#### Check App.tsx structure:
Confirm that the app has the correct provider hierarchy:
```tsx
<QueryClientProvider>
  <BrowserRouter>
    <AnalyticsProvider>  {/* ← Must be here */}
      <AuthProvider>
        <AdminProvider>
          {/* Rest of app */}
        </AdminProvider>
      </AuthProvider>
    </AnalyticsProvider>
  </BrowserRouter>
</QueryClientProvider>
```

**Action Items:**
1. Open `src/App.tsx`
2. Verify `AnalyticsProvider` wraps the entire application
3. Verify it's imported from `@/contexts/AnalyticsContext`
4. Verify no TypeScript errors

### Step 4: Test Browser Console Logging

Open the application in a browser with DevTools console open:

#### What to look for:
1. **Session Creation Log** (on first page load):
   ```
   [Analytics] Session created: <session-id>
   ```

2. **Page View Tracking** (on each navigation):
   ```
   [Analytics] Page view tracked: /about
   ```

3. **Activity Tracking** (on user interactions):
   ```
   [Analytics] Activity tracked: click, navigation
   ```

4. **Session Timeout Log** (after 30 minutes of inactivity):
   ```
   [Analytics] Session ended: <session-id>
   ```

#### Enable Debug Mode:
If logs aren't visible, check the logger configuration in `src/lib/logger.ts`:
```typescript
// Ensure logger is not suppressing analytics logs
export const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.log
};
```

### Step 5: Test Live Data Collection

Perform these user actions in the browser and verify they create database records:

#### Test Scenario 1: Page Navigation
1. Load the homepage (/)
2. Navigate to /about
3. Navigate to /rsvp
4. Navigate to /gallery

**Verify in Database:**
```sql
-- Should show 4+ page_views records with correct paths
SELECT page_path, page_title, created_at
FROM public.page_views
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

#### Test Scenario 2: User Interactions
1. Click navigation links
2. Submit a form (e.g., RSVP form)
3. Upload a photo
4. Like a photo
5. Post to guestbook

**Verify in Database:**
```sql
-- Should show activity logs for interactions
SELECT action_type, action_category, action_details, created_at
FROM public.user_activity_logs
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

#### Test Scenario 3: Content Interactions
1. View a photo in gallery
2. React to a guestbook post
3. View vignettes

**Verify in Database:**
```sql
-- Should show content interaction records
SELECT content_type, content_id, interaction_type, created_at
FROM public.content_interactions
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

---

## PART 3: Admin Dashboard Analytics Widgets Testing

### Step 6: Verify AnalyticsWidgets Component

#### Check AdminDashboard.tsx integration:
Open `src/pages/AdminDashboard.tsx` and verify:

1. **Import Statement:**
```tsx
const LazyAnalyticsWidgets = lazy(() => import('@/components/admin/AnalyticsWidgets'));
```

2. **Render in Overview Tab:**
```tsx
{activeTab === 'overview' && (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAnalyticsWidgets />
  </Suspense>
)}
```

### Step 7: Test Analytics Dashboard Display

#### Access Admin Dashboard:
1. Navigate to `/admin`
2. Ensure you're logged in as an admin user
3. Select the "Overview" tab

#### What Should Be Visible:
1. **Analytics Summary Cards:**
   - Total Sessions
   - Total Page Views
   - Total User Actions
   - Average Session Duration

2. **Time Range Selector:**
   - Toggle between "7d" and "30d" views
   - Verify data updates when switching

3. **Trend Chart:**
   - Area chart showing sessions, page views, and actions over time
   - X-axis: Dates
   - Y-axis: Counts
   - Legend showing all three metrics

4. **Loading States:**
   - Initial skeleton loading
   - Proper data display after load
   - Error handling if query fails

### Step 8: Verify Analytics API Function

Test the `getAnalyticsSummary` function manually:

#### Open Browser Console and Run:
```javascript
// Import the function (if not already in scope)
import { getAnalyticsSummary } from '@/lib/analytics-api';

// Test analytics summary
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);
const endDate = new Date();

const result = await getAnalyticsSummary(startDate, endDate);
console.log('Analytics Summary:', result);
```

**Expected Response Structure:**
```javascript
{
  data: {
    totals: {
      sessions: <number>,
      page_views: <number>,
      actions: <number>,
      avg_duration: <number>
    },
    series: [
      {
        date: "2025-10-01",
        sessions: <number>,
        page_views: <number>,
        actions: <number>
      },
      // ... more days
    ]
  },
  error: null
}
```

---

## PART 4: Analytics Database Functions Testing

### Step 9: Test get_analytics_summary Function

Verify the database function works correctly:

```sql
-- Test the analytics summary function
SELECT public.get_analytics_summary(
  (CURRENT_DATE - INTERVAL '30 days')::DATE,
  CURRENT_DATE::DATE
);
```

**Expected Output:**
JSONB object containing:
- total_page_views
- unique_visitors
- avg_session_duration
- total_rsvps
- total_photos
- total_guestbook_posts
- date_range (start and end)

### Step 10: Test aggregate_daily_stats Function

Test the daily aggregation:

```sql
-- Run daily aggregation for today
SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT);

-- Verify the aggregate was created
SELECT 
  date,
  total_page_views,
  unique_visitors,
  avg_session_duration,
  rsvps_submitted,
  photos_uploaded,
  guestbook_posts,
  updated_at
FROM public.analytics_daily_aggregates
WHERE date = CURRENT_DATE
ORDER BY date DESC;
```

---

## PART 5: Performance & Security Testing

### Step 11: Verify RLS Policies Work

#### Test as Non-Admin User:
```sql
-- Switch to anon role (simulating non-admin user)
SET ROLE anon;

-- These should return 0 rows or error (access denied)
SELECT COUNT(*) FROM public.user_sessions;
SELECT COUNT(*) FROM public.page_views;

-- Reset to default role
RESET ROLE;
```

#### Test as Admin User:
```sql
-- Verify admin can access all tables
SELECT COUNT(*) FROM public.user_sessions;
SELECT COUNT(*) FROM public.page_views;
SELECT COUNT(*) FROM public.user_activity_logs;
-- All should return actual counts
```

### Step 12: Test Index Performance

Run EXPLAIN ANALYZE on common queries to verify indexes are being used:

```sql
-- Should use idx_page_views_created_at index
EXPLAIN ANALYZE
SELECT * FROM public.page_views
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;

-- Should use idx_user_sessions_user_id index
EXPLAIN ANALYZE
SELECT * FROM public.user_sessions
WHERE user_id = 'some-user-uuid'
ORDER BY started_at DESC;

-- Should use idx_content_interactions_composite index
EXPLAIN ANALYZE
SELECT * FROM public.content_interactions
WHERE content_type = 'photo'
  AND content_id = 'some-photo-id'
  AND interaction_type = 'view';
```

**Look for:** `Index Scan` or `Index Only Scan` in the output (not `Seq Scan`)

---

## PART 6: Session Tracking Edge Cases

### Step 13: Test Session Timeout Logic

#### Verify 30-Minute Timeout:
1. Open application in browser
2. Note the session ID from console logs
3. Wait 30+ minutes without any interaction
4. Interact with the page (click, navigate, etc.)

**Expected Behavior:**
- Old session should be ended (ended_at timestamp set)
- New session should be created automatically
- Console should log: "Session ended" and "Session created"

#### Verify Session Persistence:
1. Load application
2. Note session ID
3. Refresh the page (F5)
4. Check session ID again

**Expected Behavior:**
- Session ID should remain the same (persisted in localStorage)
- Session should not create duplicate records
- `pages_viewed` count should increment

### Step 14: Test Multi-Tab Behavior

#### Open Multiple Tabs:
1. Open application in Tab 1
2. Note session ID from console
3. Open same application in Tab 2
4. Note session ID from console

**Expected Behavior:**
- Both tabs should share the same session ID
- Page views from both tabs count toward same session
- Session timeout applies across all tabs

---

## SUCCESS CRITERIA CHECKLIST

### Database Infrastructure
- [ ] All 6 analytics tables exist with correct schemas
- [ ] All tables have RLS enabled
- [ ] All RLS policies function correctly (admin access, system insert)
- [ ] All performance indexes are created and being used
- [ ] Foreign key relationships are working

### Data Collection
- [ ] Sessions are created on first page load
- [ ] Page views are tracked on every navigation
- [ ] User activities are logged on interactions
- [ ] Content interactions are tracked
- [ ] Session timeout (30 min) works correctly
- [ ] Session data persists across page refreshes

### Frontend Integration
- [ ] AnalyticsProvider is properly integrated in App.tsx
- [ ] No TypeScript errors in analytics-related files
- [ ] Browser console shows analytics tracking logs
- [ ] Analytics widgets render in admin dashboard
- [ ] Time range selector works (7d / 30d toggle)
- [ ] Charts display data correctly

### Admin Dashboard
- [ ] Analytics widgets load without errors
- [ ] Summary cards show correct totals
- [ ] Trend charts display historical data
- [ ] Loading states work properly
- [ ] Error boundaries catch and display errors

### Database Functions
- [ ] get_analytics_summary() returns correct data
- [ ] aggregate_daily_stats() creates daily aggregates
- [ ] Analytics queries are performant (<100ms for typical queries)

### Security & Performance
- [ ] Non-admin users cannot read analytics data
- [ ] System can insert data without authentication
- [ ] Indexes are being used in query plans
- [ ] No N+1 query problems
- [ ] RLS policies don't block legitimate access

---

## TROUBLESHOOTING GUIDE

### Issue: No Data Being Collected
**Possible Causes:**
1. AnalyticsProvider not wrapping app correctly
2. Session creation failing due to RLS policies
3. JavaScript errors preventing tracking code execution

**Solutions:**
- Check browser console for errors
- Verify AnalyticsProvider is in App.tsx
- Test RLS policies with manual INSERT queries
- Check that is_admin() function exists

### Issue: Admin Dashboard Shows No Data
**Possible Causes:**
1. Admin user doesn't have admin role in user_roles table
2. get_analytics_summary() function errors
3. API query failing due to permissions

**Solutions:**
```sql
-- Verify admin role exists
SELECT * FROM public.user_roles WHERE role = 'admin';

-- Grant admin role to your user
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-uuid', 'admin');

-- Test function manually
SELECT public.get_analytics_summary(
  (CURRENT_DATE - 30)::DATE,
  CURRENT_DATE::DATE
);
```

### Issue: Session Timeout Not Working
**Possible Causes:**
1. localStorage not persisting sessionId
2. Timeout logic not executing
3. Browser tab sleeping/throttling

**Solutions:**
- Check localStorage in DevTools (Application tab)
- Verify useSessionTracking hook is active
- Test in active browser window (not background tab)

### Issue: Indexes Not Being Used
**Possible Causes:**
1. Statistics out of date
2. Table too small for PostgreSQL to use index
3. Query not structured to use available indexes

**Solutions:**
```sql
-- Update table statistics
ANALYZE public.user_sessions;
ANALYZE public.page_views;
ANALYZE public.user_activity_logs;

-- Reindex if needed
REINDEX TABLE public.user_sessions;
```

---

## REPORTING RESULTS

After completing all verification steps, provide a summary report including:

### 1. Database Status
- [ ] Record counts for all 6 tables
- [ ] Sample data from each table (latest 5 records)
- [ ] RLS policy test results
- [ ] Index usage confirmation

### 2. Frontend Status
- [ ] AnalyticsProvider integration confirmed
- [ ] Browser console logs showing tracking
- [ ] Admin dashboard screenshots
- [ ] Any TypeScript or runtime errors

### 3. Functionality Tests
- [ ] Session creation and tracking working
- [ ] Page view tracking working
- [ ] Activity logging working
- [ ] Session timeout tested
- [ ] Multi-tab behavior verified

### 4. Performance Metrics
- [ ] Average query execution time
- [ ] Index scan confirmations
- [ ] RLS policy overhead (if measurable)

### 5. Issues Found
- List any problems encountered
- Provide error messages or logs
- Note any workarounds applied

---

## NEXT STEPS AFTER VERIFICATION

Once all tests pass:

1. **Monitor Production Data:**
   - Set up daily aggregate job (cron/scheduled task)
   - Monitor table sizes and growth
   - Watch for performance degradation

2. **Dashboard Enhancements:**
   - Add more analytics widgets (user engagement, content metrics)
   - Create real-time activity feed
   - Add data export functionality

3. **Analytics Features:**
   - Implement custom date range selection
   - Add comparison views (this week vs last week)
   - Create user cohort analysis
   - Add geographic analytics visualizations

4. **Optimization:**
   - Set up partitioning for large tables
   - Implement data archiving strategy
   - Add caching for expensive queries
   - Create materialized views for complex analytics

5. **Documentation:**
   - Document analytics schema for team
   - Create runbook for common analytics queries
   - Add analytics API documentation
   - Write user guide for admin dashboard

---

**Estimated Total Time:** 2-3 hours for complete verification
**Priority:** HIGH - Analytics is core feature for admin insights
**Dependencies:** None after migration complete

