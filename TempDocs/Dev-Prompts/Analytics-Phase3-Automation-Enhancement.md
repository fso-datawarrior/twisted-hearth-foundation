# Analytics Phase 3: Automation & Enhancement

## 🎯 Objective
Set up daily aggregation automation and address the three minor issues identified in the verification report. This phase makes the analytics system fully automated and optimized for production use.

---

## 📊 Current Status (From Verification Report)

### ✅ What's Working Perfectly
- 18 sessions tracked with 169 page views
- Performance: <1ms query times (A+ grade)
- Security: A+ (32 policies, properly enforced)
- 4 admin users with dashboard access
- Real-time tracking operational

### ⚠️ Three Minor Issues to Address
1. **No daily aggregates** - Need scheduled aggregation
2. **No content interactions** - Feature implemented but not yet triggered
3. **No system metrics** - Optional performance monitoring not enabled

---

## PART 1: Daily Aggregation Automation (Priority: HIGH)

### Option A: Supabase Edge Function with Cron (RECOMMENDED)

#### Step 1: Create Daily Aggregation Edge Function

Create a new file: `supabase/functions/daily-analytics-aggregation/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Get date to aggregate (default to yesterday)
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const targetDate = dateParam || new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    console.log(`Starting daily aggregation for ${targetDate}`);

    // Call the aggregate_daily_stats function
    const { data, error } = await supabase.rpc('aggregate_daily_stats', {
      p_date: targetDate
    });

    if (error) {
      console.error('Aggregation error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully aggregated data for ${targetDate}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: targetDate,
        message: 'Daily aggregation completed successfully'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Step 2: Add Edge Function to config.toml

Update `supabase/config.toml`:

```toml
[functions.daily-analytics-aggregation]
verify_jwt = false
```

#### Step 3: Set Up Cron Schedule

In Supabase Dashboard:
1. Go to **Database** → **Cron Jobs**
2. Click **Create a new cron job**
3. Configure:
   - **Name:** `daily-analytics-aggregation`
   - **Schedule:** `0 1 * * *` (runs at 1 AM UTC daily)
   - **Command:**
   ```sql
   SELECT net.http_post(
     url := 'https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/daily-analytics-aggregation',
     headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
   );
   ```

**Alternative using pg_cron:**
```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily aggregation at 1 AM UTC
SELECT cron.schedule(
  'daily-analytics-aggregation',
  '0 1 * * *',
  $$SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT)$$
);

-- Verify cron job was created
SELECT * FROM cron.job;
```

#### Step 4: Test the Aggregation Manually

Run this to test aggregation for today:

```sql
-- Test aggregation for today
SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT);

-- Verify the record was created
SELECT 
  date,
  total_page_views,
  unique_visitors,
  active_sessions,
  avg_session_duration,
  rsvps_submitted,
  photos_uploaded,
  guestbook_posts,
  updated_at
FROM public.analytics_daily_aggregates
WHERE date = CURRENT_DATE;
```

#### Step 5: Backfill Historical Data (Optional)

If you want to aggregate historical data:

```sql
-- Aggregate data for the last 30 days
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

-- Verify backfill results
SELECT 
  date,
  total_page_views,
  unique_visitors,
  active_sessions
FROM public.analytics_daily_aggregates
ORDER BY date DESC;
```

---

## PART 2: Content Interaction Tracking Enhancement (Priority: MEDIUM)

The content interaction tracking is already implemented in the frontend, but may need explicit calls for certain interactions.

### Step 1: Verify Existing Tracking Implementation

Check if these functions are being called in the frontend:

```typescript
// File: src/lib/analytics-api.ts
export const trackContentInteraction = async (
  contentType: string,
  contentId: string,
  interactionType: string,
  interactionValue?: string
): Promise<{ error: any }> => {
  // Implementation already exists
}
```

### Step 2: Add Explicit Tracking Calls (If Missing)

Add tracking to key user interactions:

#### Gallery Photo Views (`src/components/gallery/PhotoModal.tsx` or similar):
```typescript
import { trackContentInteraction } from '@/lib/analytics-api';

// When photo is viewed
useEffect(() => {
  if (photoId && sessionId) {
    trackContentInteraction('photo', photoId, 'view');
  }
}, [photoId, sessionId]);
```

#### Photo Likes/Reactions:
```typescript
// When user likes a photo
const handleLike = async () => {
  await togglePhotoLike(photoId);
  await trackContentInteraction('photo', photoId, 'like');
};
```

#### Guestbook Post Views:
```typescript
// When guestbook post is viewed
const handlePostView = (postId: string) => {
  trackContentInteraction('guestbook', postId, 'view');
};
```

#### Vignette Interactions:
```typescript
// When vignette is opened/viewed
const handleVignetteView = (vignetteId: string) => {
  trackContentInteraction('vignette', vignetteId, 'view');
};
```

### Step 3: Test Content Interaction Tracking

After adding tracking calls, verify with:

```sql
-- Check for new content interactions
SELECT 
  content_type,
  content_id,
  interaction_type,
  COUNT(*) as interaction_count,
  MAX(created_at) as latest_interaction
FROM public.content_interactions
GROUP BY content_type, content_id, interaction_type
ORDER BY latest_interaction DESC;
```

---

## PART 3: System Metrics Collection (Priority: LOW - Optional)

System metrics can be used for performance monitoring. This is optional but recommended for production.

### Step 1: Add Performance Metric Tracking

Create utility function: `src/lib/performance-metrics.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export const trackPerformanceMetric = async (
  metricType: string,
  metricValue: number,
  metricUnit: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('system_metrics')
      .insert({
        metric_type: metricType,
        metric_value: metricValue,
        metric_unit: metricUnit,
        details: details || {}
      });

    if (error) {
      logger.error('Failed to track performance metric', error);
    }
  } catch (error) {
    logger.error('Performance metric tracking error', error as Error);
  }
};

// Track page load time
export const trackPageLoadTime = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    if (pageLoadTime > 0) {
      trackPerformanceMetric(
        'page_load_time',
        pageLoadTime,
        'milliseconds',
        {
          url: window.location.pathname,
          userAgent: navigator.userAgent
        }
      );
    }
  }
};

// Track API response time
export const trackAPIResponseTime = async (
  endpoint: string,
  startTime: number
): Promise<void> => {
  const responseTime = Date.now() - startTime;
  await trackPerformanceMetric(
    'api_response_time',
    responseTime,
    'milliseconds',
    { endpoint }
  );
};
```

### Step 2: Integrate Performance Tracking

Add to `src/App.tsx` or `src/main.tsx`:

```typescript
import { trackPageLoadTime } from '@/lib/performance-metrics';

// Track page load on app initialization
useEffect(() => {
  // Wait for page to fully load
  if (document.readyState === 'complete') {
    trackPageLoadTime();
  } else {
    window.addEventListener('load', trackPageLoadTime);
    return () => window.removeEventListener('load', trackPageLoadTime);
  }
}, []);
```

### Step 3: Verify System Metrics Collection

```sql
-- Check system metrics
SELECT 
  metric_type,
  AVG(metric_value) as avg_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  metric_unit,
  COUNT(*) as sample_count
FROM public.system_metrics
GROUP BY metric_type, metric_unit
ORDER BY metric_type;
```

---

## PART 4: Documentation Updates

### Step 1: Update PATCHES_AND_UPDATES_TRACKER_V2.md

Add to the tracker:

```markdown
#### ✅ BATCH 5 Phase 2: Analytics Database Infrastructure - COMPLETE

**Status**: ✅ **PRODUCTION READY**
**Date Completed**: October 13, 2025

**Database Tables:**
- ✅ user_sessions (18 sessions, tracking active)
- ✅ page_views (169 views, tracking active)
- ✅ user_activity_logs (4 actions, tracking active)
- ✅ content_interactions (tracking implemented)
- ✅ system_metrics (tracking implemented)
- ✅ analytics_daily_aggregates (ready for automation)

**Performance Metrics:**
- Query times: <1ms (A+ grade)
- 32 RLS policies (exceeds requirements)
- 40+ indexes (all optimized)
- Security grade: A+

**Automation:**
- ✅ Daily aggregation edge function created
- ✅ Cron job scheduled (1 AM UTC daily)
- ✅ Backfill script available

**Verification Results:**
- ✅ Live data collection working
- ✅ 4 admin users with dashboard access
- ✅ All security tests passed
- ✅ Performance tests passed
```

### Step 2: Create Analytics Runbook

Create: `docs/ANALYTICS_RUNBOOK.md`

```markdown
# Analytics System Runbook

## Daily Operations

### Check Daily Aggregation Status
```sql
SELECT date, total_page_views, unique_visitors
FROM analytics_daily_aggregates
ORDER BY date DESC LIMIT 7;
```

### Manual Aggregation (if cron fails)
```sql
SELECT aggregate_daily_stats(CURRENT_DATE::TEXT);
```

## Monitoring Queries

### Traffic Summary (Last 7 Days)
```sql
SELECT 
  COUNT(DISTINCT us.id) as sessions,
  COUNT(DISTINCT pv.id) as page_views,
  COUNT(DISTINCT pv.page_path) as unique_pages
FROM user_sessions us
LEFT JOIN page_views pv ON pv.session_id = us.id
WHERE us.started_at >= CURRENT_DATE - 7;
```

### Top Pages (Last 30 Days)
```sql
SELECT 
  page_path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions
FROM page_views
WHERE created_at >= CURRENT_DATE - 30
GROUP BY page_path
ORDER BY views DESC
LIMIT 10;
```

### User Engagement Metrics
```sql
SELECT 
  AVG(pages_viewed) as avg_pages_per_session,
  AVG(actions_taken) as avg_actions_per_session,
  AVG(duration_seconds) as avg_session_duration
FROM user_sessions
WHERE started_at >= CURRENT_DATE - 30;
```

## Troubleshooting

### Issue: Daily Aggregation Not Running
1. Check cron job status: `SELECT * FROM cron.job;`
2. Check cron job history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
3. Run manually: `SELECT aggregate_daily_stats(CURRENT_DATE::TEXT);`

### Issue: No Data Collecting
1. Check AnalyticsProvider in App.tsx
2. Check browser console for errors
3. Verify RLS policies allow inserts

### Issue: Admin Can't See Data
1. Verify admin role: `SELECT * FROM user_roles WHERE user_id = 'uuid';`
2. Test is_admin() function: `SELECT is_admin();`
3. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'user_sessions';`
```

---

## TESTING CHECKLIST

### ✅ Daily Aggregation
- [ ] Edge function created and deployed
- [ ] Cron job scheduled in Supabase
- [ ] Manual aggregation tested successfully
- [ ] Daily aggregate record visible in database
- [ ] Backfill completed (if applicable)

### ✅ Content Interactions
- [ ] Tracking functions verified in code
- [ ] Explicit calls added to key interactions
- [ ] Test interactions recorded in database
- [ ] Content interaction queries return data

### ✅ System Metrics (Optional)
- [ ] Performance tracking utility created
- [ ] Page load tracking integrated
- [ ] API response tracking implemented
- [ ] Metrics visible in database

### ✅ Documentation
- [ ] PATCHES tracker updated
- [ ] Analytics runbook created
- [ ] Cron job documented
- [ ] Troubleshooting guide complete

---

## DELIVERABLES

After completing this phase, provide:

1. **Daily Aggregation Confirmation:**
   - Screenshot or output of cron job configuration
   - Query result showing aggregated data
   - Backfill results (if run)

2. **Content Interaction Enhancement:**
   - List of tracking calls added
   - Query showing content interactions recorded
   - Summary of interaction types tracked

3. **System Metrics Status:**
   - Confirmation of implementation (or decision to skip)
   - Query showing metrics collected (if implemented)

4. **Documentation:**
   - Confirmation that PATCHES tracker is updated
   - Link to analytics runbook
   - Summary of operational procedures documented

---

## SUCCESS CRITERIA

### Phase 3 Complete When:
- ✅ Daily aggregation running automatically
- ✅ At least 1 daily aggregate record exists
- ✅ Content interactions tracking (even if few records)
- ✅ Documentation updated and complete
- ✅ System is fully automated for production

---

## ESTIMATED TIME

- **Daily Aggregation Setup:** 45-60 minutes
- **Content Interaction Enhancement:** 30-45 minutes
- **System Metrics (Optional):** 30-60 minutes
- **Documentation:** 30 minutes
- **Testing & Verification:** 30 minutes

**Total:** 2.5-4 hours (depending on optional features)

---

**This is the final phase to make the analytics system fully automated and production-grade!**

