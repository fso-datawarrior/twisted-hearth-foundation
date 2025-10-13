# Analytics FINAL STEP: Cron Job Setup

## 🎯 Objective
Set up the daily aggregation cron job to run automatically every night at 1 AM UTC. This is the LAST piece to make the analytics system fully automated.

---

## ✅ What's Already Complete

### Phase 1: Database ✅
- 6 tables, 32 policies, 40+ indexes
- Live data: 18 sessions, 169 page views

### Phase 2: Verification ✅  
- All tests passed (A+ performance & security)
- Admin dashboard working

### Phase 3: Automation ✅
- Edge function created: `daily-analytics-aggregation`
- Content interaction tracking added (4 components)
- Documentation complete (`docs/ANALYTICS_RUNBOOK.md`)

---

## 🔄 FINAL STEP: Schedule Daily Aggregation

You have **TWO OPTIONS** - choose whichever is easiest in your Supabase setup:

---

### OPTION A: Supabase Edge Function Cron (RECOMMENDED - Easiest)

This uses Supabase's built-in cron job feature.

#### Step 1: Access Supabase Dashboard
Go to: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/functions

#### Step 2: Find Your Edge Function
Look for: `daily-analytics-aggregation`

#### Step 3: Set Up Cron Trigger
1. Click on the `daily-analytics-aggregation` function
2. Go to the **"Cron"** or **"Triggers"** tab
3. Click **"Add Cron Trigger"**
4. Configure:
   - **Schedule**: `0 1 * * *` (runs at 1 AM UTC daily)
   - **Timezone**: UTC
   - **Enabled**: Yes

#### Step 4: Test the Setup
**Manual Test:**
```bash
curl -X POST 'https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/daily-analytics-aggregation' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

**Expected Response:**
```json
{
  "success": true,
  "date": "2025-10-13",
  "message": "Daily aggregation completed successfully"
}
```

#### Step 5: Verify Cron is Active
Check the Cron Jobs section in Supabase Dashboard to confirm the schedule is active.

---

### OPTION B: PostgreSQL pg_cron Extension

This uses PostgreSQL's native cron functionality.

#### Step 1: Enable pg_cron Extension

Execute in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Verify it's enabled
SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';
```

#### Step 2: Schedule the Daily Aggregation

```sql
-- Schedule daily aggregation at 1 AM UTC
SELECT cron.schedule(
  'daily-analytics-aggregation',  -- Job name
  '0 1 * * *',                     -- Cron expression (1 AM UTC daily)
  $$SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT)$$  -- SQL to execute
);
```

#### Step 3: Verify Cron Job Created

```sql
-- Check if cron job exists
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'daily-analytics-aggregation';
```

**Expected Result:**
```
jobid | jobname                      | schedule   | command                                           | active
------|------------------------------|------------|---------------------------------------------------|-------
1     | daily-analytics-aggregation  | 0 1 * * *  | SELECT public.aggregate_daily_stats(CURRENT_DATE) | t
```

#### Step 4: Test Manual Execution

```sql
-- Run the aggregation manually to test
SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT);

-- Verify the aggregate record was created
SELECT * FROM public.analytics_daily_aggregates 
WHERE date = CURRENT_DATE;
```

#### Step 5: Monitor Cron Job History

```sql
-- Check recent cron job executions
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'daily-analytics-aggregation'
)
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🧪 Post-Setup Verification

After setting up the cron job (either option), verify it works:

### 1. Wait for First Run (or trigger manually)

**If using Edge Function cron:**
- Wait until 1 AM UTC next day, OR
- Trigger manually via curl command above

**If using pg_cron:**
- Wait until 1 AM UTC next day, OR
- Run manually: `SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT);`

### 2. Check for Aggregated Data

```sql
-- Should show records for each day
SELECT 
  date,
  total_page_views,
  unique_visitors,
  active_sessions,
  rsvps_submitted,
  photos_uploaded,
  guestbook_posts,
  updated_at
FROM public.analytics_daily_aggregates
ORDER BY date DESC
LIMIT 7;
```

### 3. Monitor for Errors

**Edge Function (Option A):**
- Go to: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/functions/daily-analytics-aggregation/logs
- Look for any error messages

**pg_cron (Option B):**
```sql
-- Check for failed runs
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
  AND jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'daily-analytics-aggregation')
ORDER BY start_time DESC;
```

---

## 📋 Cron Schedule Reference

Common cron expressions you might want:

| Expression | Description | Time (UTC) |
|------------|-------------|------------|
| `0 1 * * *` | Daily at 1 AM | 01:00 |
| `0 2 * * *` | Daily at 2 AM | 02:00 |
| `0 0 * * *` | Daily at midnight | 00:00 |
| `0 */6 * * *` | Every 6 hours | 00:00, 06:00, 12:00, 18:00 |
| `0 1 * * 0` | Weekly on Sunday at 1 AM | Sunday 01:00 |

**Recommended:** `0 1 * * *` (1 AM UTC daily)

---

## 🎯 Success Criteria

Cron setup is complete when:

- ✅ Cron job is scheduled (visible in dashboard or pg_cron)
- ✅ Manual test shows successful aggregation
- ✅ At least 1 daily aggregate record exists
- ✅ No errors in logs/history
- ✅ Cron job shows as "active"

---

## 🐛 Troubleshooting

### Issue: Cron Job Not Showing Up

**For Edge Function:**
- Verify edge function is deployed
- Check Dashboard → Functions → daily-analytics-aggregation
- Ensure you're in the correct project

**For pg_cron:**
- Verify extension is enabled: `SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';`
- Check if superuser access needed
- Try creating via Supabase Dashboard → Database → Cron Jobs

### Issue: Cron Runs But No Data

**Check:**
1. Verify function works manually first
2. Check edge function logs for errors
3. Verify database function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'aggregate_daily_stats';
   ```
4. Check RLS policies allow aggregation function to insert

### Issue: Permission Denied

**Solution:**
```sql
-- Grant necessary permissions (if using pg_cron)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
```

---

## 📊 Expected Daily Aggregate Output

After cron runs successfully, you should see records like:

```
date       | total_page_views | unique_visitors | active_sessions | avg_session_duration
-----------|------------------|-----------------|-----------------|--------------------
2025-10-13 | 169              | 8               | 18              | 3214.50
2025-10-12 | 145              | 7               | 15              | 2890.23
2025-10-11 | 132              | 6               | 14              | 2654.67
```

---

## 🎉 COMPLETION CHECKLIST

Mark each item as complete:

- [ ] Chose cron method (Edge Function or pg_cron)
- [ ] Cron job scheduled successfully
- [ ] Manual test executed successfully
- [ ] At least 1 daily aggregate record visible
- [ ] Cron job shows as "active"
- [ ] No errors in logs/history
- [ ] Documentation updated if needed

---

## 📝 Final Deliverable

Provide confirmation:

1. **Cron Method Used:** Edge Function / pg_cron
2. **Schedule Configured:** `0 1 * * *` (or different)
3. **Test Result:** Success / Failure (with details)
4. **Sample Aggregate Record:** (copy output from verification query)
5. **Status:** Active and monitoring

---

## 🚀 AFTER THIS STEP

**Your analytics system will be 100% COMPLETE:**

✅ Database infrastructure (6 tables, 32 policies, 40+ indexes)  
✅ Live data collection (sessions, page views, interactions)  
✅ Content tracking (photos, guestbook, vignettes)  
✅ Daily aggregation (AUTOMATED)  
✅ Admin dashboard (working)  
✅ Documentation (runbook complete)  
✅ Production ready (fully automated)

**No more manual intervention needed - system runs itself!** 🎊

---

**Estimated Time:** 15-30 minutes
**Difficulty:** Low (straightforward configuration)
**Impact:** HIGH (completes full automation)

