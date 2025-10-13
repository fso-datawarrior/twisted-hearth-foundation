# Dashboard Widget Troubleshooting Guide
## Fixing Empty Data Issues

**Date:** October 13, 2025  
**Issues:** Empty data in User Engagement, RSVP Trends, and Guestbook Activity widgets

---

## 🎯 QUICK SUMMARY

### **Issues Identified:**
1. ✅ **FIXED:** Guestbook Contributors border styling - Added borders to both sections
2. ⚠️ **NEEDS VERIFICATION:** Analytics tracking may not be running
3. ⚠️ **NEEDS DATA:** Tables may be empty (no user activity yet)

### **Fixes Applied:**
- ✅ Added border styling to Contributors and Reactions sections
- ✅ Added "No data yet" messages when arrays are empty
- 📋 Created diagnostic SQL script to check database state

---

## 🔍 STEP 1: RUN DIAGNOSTIC SCRIPT

### **Run This in Supabase SQL Editor:**

Navigate to: **Supabase Dashboard → SQL Editor → New Query**

Copy and paste: `TempDocs/DASHBOARD_DIAGNOSTIC_SCRIPT.sql`

### **What It Checks:**
1. ✅ Your admin status (`is_admin()` function)
2. 📊 Data counts in all analytics tables
3. 📝 Content table counts (RSVPs, guestbook, photos)
4. 🔐 RLS policy access verification
5. 📋 Sample data from each table

### **Expected Results:**

**If Everything is Working:**
```sql
-- Admin Check
is_admin_result: true
has_role_record: 1

-- Analytics Tables
user_sessions: total_records > 0
user_activity_logs: total_records > 0

-- Content Tables
rsvps: total_rsvps > 0
guestbook: total_posts > 0
```

**If No Data:**
```sql
-- Analytics Tables
user_sessions: total_records = 0  ⚠️ PROBLEM
user_activity_logs: total_records = 0  ⚠️ PROBLEM

-- Content Tables
rsvps: total_rsvps = 0  ⚠️ PROBLEM
guestbook: total_posts = 0  ⚠️ PROBLEM
```

---

## 🛠️ STEP 2: DIAGNOSE THE ISSUE

### **Issue A: Admin Access Blocked**

**Symptom:** Diagnostic script fails or returns `is_admin_result: false`

**Solution:**
1. Verify your user email is in the admin list
2. Run admin seeding function:
```sql
SELECT ensure_admins_seeded();
```

3. Check your user has admin role:
```sql
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

4. If no role exists, manually add:
```sql
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

### **Issue B: Analytics Not Tracking**

**Symptom:** `user_sessions` table is empty (count = 0)

**Root Cause:** Analytics tracking system not initialized or not running

**Verification Steps:**

1. **Check if AnalyticsProvider is active:**
   - Open browser console (F12)
   - Navigate to any page
   - Look for logs like:
     ```
     Session started {sessionId: "..."}
     Page view tracked {path: "/", pageViewId: "..."}
     ```

2. **Check App.tsx has AnalyticsProvider:**
   - File: `src/App.tsx`
   - Should wrap the app:
   ```tsx
   <AnalyticsProvider>
     <Router>
       ...
     </Router>
   </AnalyticsProvider>
   ```

3. **Test session creation manually:**
   ```typescript
   // In browser console
   import { supabase } from '@/integrations/supabase/client';
   
   const { data, error } = await supabase
     .from('user_sessions')
     .insert({
       browser: 'Chrome',
       device_type: 'desktop',
       os: 'Windows',
       pages_viewed: 0,
       actions_taken: 0
     })
     .select();
   
   console.log('Test session:', data, error);
   ```

**Solutions:**

**If AnalyticsProvider is missing:**
1. Check `src/App.tsx`
2. Ensure AnalyticsProvider wraps your app
3. Import from `@/contexts/AnalyticsContext`

**If RLS blocks inserts:**
1. Verify "System can insert" policy exists:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'user_sessions' 
AND policyname = 'System can insert user_sessions';
```

2. If missing, run analytics migration:
```bash
# Check which migrations are applied
supabase db remote status

# If analytics tables missing, push migrations
supabase db push
```

---

### **Issue C: No RSVP Data**

**Symptom:** `rsvps` table is empty (count = 0)

**Root Causes:**
1. No users have submitted RSVPs yet
2. RSVP form not working
3. Data in different table structure

**Verification:**

1. **Check RSVP table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rsvps' 
ORDER BY ordinal_position;
```

Expected columns: `id`, `user_id`, `name`, `email`, `status`, `num_guests`, etc.

2. **Try manual RSVP insert (as admin):**
```sql
INSERT INTO rsvps (name, email, status, num_guests)
VALUES ('Test User', 'test@example.com', 'confirmed', 2)
RETURNING *;
```

3. **Check if old RSVPs exist with different column names:**
```sql
-- Check for old structure with rsvp_id
SELECT * FROM rsvps LIMIT 5;
```

**Solutions:**

**If table is truly empty:**
- This is expected if event just started
- Widget will show "0" which is correct
- Users need to submit RSVPs

**If RSVP form broken:**
1. Test RSVP page: Navigate to `/rsvp`
2. Check browser console for errors
3. Verify RLS policies allow inserts

---

### **Issue D: No Guestbook Data**

**Symptom:** `guestbook` table is empty or `topContributors` array is empty

**Root Causes:**
1. No users have posted to guestbook yet
2. All posts are deleted (`deleted_at IS NOT NULL`)
3. Guestbook form not working

**Verification:**

1. **Check guestbook posts:**
```sql
SELECT 
  id, 
  display_name, 
  LEFT(message, 50) as message_preview,
  deleted_at,
  created_at
FROM guestbook
ORDER BY created_at DESC
LIMIT 10;
```

2. **Check deleted posts:**
```sql
SELECT COUNT(*) as total, 
       COUNT(*) FILTER (WHERE deleted_at IS NULL) as active,
       COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
FROM guestbook;
```

3. **Test manual post insert:**
```sql
INSERT INTO guestbook (display_name, message)
VALUES ('Test User', 'Test message from diagnostic')
RETURNING *;
```

**Solutions:**

**If truly empty:**
- ✅ **Now Fixed:** Widget shows "No contributors yet"
- ✅ **Border added:** Contributors section now has visible border
- Users need to post to guestbook

**If all deleted:**
- Posts exist but marked deleted
- Check moderation policies
- Restore posts if needed:
```sql
UPDATE guestbook 
SET deleted_at = NULL 
WHERE id = 'some-post-id';
```

---

## 📊 STEP 3: CREATE TEST DATA (Optional)

If you want to test widgets with sample data:

### **Create Test User Sessions:**
```sql
INSERT INTO user_sessions (user_id, browser, device_type, os, started_at, pages_viewed, actions_taken)
SELECT 
  auth.uid(),
  'Chrome',
  'desktop',
  'Windows',
  NOW() - (random() * INTERVAL '7 days'),
  floor(random() * 10 + 1)::int,
  floor(random() * 20 + 1)::int
FROM generate_series(1, 20);
```

### **Create Test RSVPs:**
```sql
INSERT INTO rsvps (name, email, status, num_guests, created_at)
VALUES 
  ('Alice Johnson', 'alice@example.com', 'confirmed', 2, NOW() - INTERVAL '5 days'),
  ('Bob Smith', 'bob@example.com', 'confirmed', 1, NOW() - INTERVAL '4 days'),
  ('Carol Williams', 'carol@example.com', 'pending', 3, NOW() - INTERVAL '2 days'),
  ('David Brown', 'david@example.com', 'confirmed', 2, NOW() - INTERVAL '1 day');
```

### **Create Test Guestbook Posts:**
```sql
INSERT INTO guestbook (display_name, message, created_at)
VALUES 
  ('Alice', 'So excited for this event!', NOW() - INTERVAL '3 days'),
  ('Bob', 'Can''t wait to see everyone there!', NOW() - INTERVAL '2 days'),
  ('Carol', 'This is going to be amazing!', NOW() - INTERVAL '1 day'),
  ('Alice', 'Thanks for organizing this!', NOW() - INTERVAL '12 hours');
```

### **Create Test Guestbook Reactions:**
```sql
INSERT INTO guestbook_reactions (post_id, user_id, emoji)
SELECT 
  g.id,
  auth.uid(),
  (ARRAY['❤️', '🎉', '👍', '😊', '🔥'])[floor(random() * 5 + 1)]
FROM guestbook g
WHERE deleted_at IS NULL
LIMIT 10;
```

### **After Creating Test Data:**
```sql
-- Verify counts
SELECT 'user_sessions' as table_name, COUNT(*) FROM user_sessions
UNION ALL
SELECT 'rsvps', COUNT(*) FROM rsvps
UNION ALL
SELECT 'guestbook', COUNT(*) FROM guestbook
UNION ALL
SELECT 'guestbook_reactions', COUNT(*) FROM guestbook_reactions;
```

---

## 🔄 STEP 4: REFRESH DASHBOARD

After running diagnostic or creating test data:

1. **Clear React Query Cache:**
   - Open browser DevTools (F12)
   - Go to Console
   - Run:
   ```javascript
   window.location.reload();
   ```

2. **Force Widget Refresh:**
   - Click refresh button on each widget (🔄 icon)
   - Widgets auto-refresh every 5 minutes

3. **Check for Errors:**
   - Open Console (F12)
   - Look for red errors
   - Check Network tab for failed queries

---

## 🐛 COMMON ERROR MESSAGES

### **Error: "Failed to load..."**

**Possible Causes:**
1. RLS policy blocking access
2. is_admin() returns false
3. Table doesn't exist
4. Network/connection issue

**Debug Steps:**
```sql
-- Check admin status
SELECT is_admin();

-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_sessions'
);

-- Try direct query
SELECT COUNT(*) FROM user_sessions;
```

---

### **Error: "relation does not exist"**

**Cause:** Analytics tables not created

**Solution:**
```bash
# Apply migrations
cd supabase/migrations
supabase db push

# Or run specific migration
supabase db push --file 20251012200000_create_analytics_tables.sql
```

---

### **Error: "permission denied for table"**

**Cause:** RLS policy blocking read access

**Solution:**
```sql
-- Verify admin role
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- If no role, add it
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT DO NOTHING;

-- Test admin function
SELECT is_admin();  -- Should return true
```

---

## ✅ VERIFICATION CHECKLIST

After troubleshooting, verify each widget:

### **User Engagement Widget**
- [ ] Total Users shows count from profiles
- [ ] Active (7d) shows users with sessions in last 7 days
- [ ] Avg Session shows reasonable time (e.g., "5m")
- [ ] Pages/Session shows decimal number (e.g., "2.8")
- [ ] New (7d) shows recent signups
- [ ] Returning shows users with multiple sessions

### **RSVP Trends Widget**
- [ ] Confirmed shows count of confirmed RSVPs
- [ ] Pending shows count of pending RSVPs
- [ ] Total RSVPs shows total count
- [ ] Expected Guests shows sum of num_guests
- [ ] 7-Day Trend chart displays line graph

### **Guestbook Activity Widget**
- [ ] Total Posts shows count
- [ ] Contributors shows unique users
- [ ] Reactions shows total emoji reactions
- [ ] Recent Posts scrolls with latest posts
- [ ] ✅ Top Contributors has border and shows "No contributors yet" if empty
- [ ] ✅ Popular Reactions has border and shows "No reactions yet" if empty

---

## 📞 GETTING HELP

### **If Still Having Issues:**

1. **Collect Debug Info:**
   - Run diagnostic script
   - Copy all results
   - Check browser console for errors
   - Note which widgets show data vs empty

2. **Check Common Issues:**
   - Is user definitely admin? (email in admin list)
   - Are migrations applied? (`supabase db remote status`)
   - Is AnalyticsProvider wrapping app?
   - Do tables exist? (diagnostic script checks this)

3. **Review Recent Changes:**
   - Check git status
   - Look for recent migration changes
   - Review `.env` configuration

---

## 📚 RELATED FILES

### **Widget Files:**
- `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`
- `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`
- `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`

### **Data Layer:**
- `src/lib/analytics-api.ts` - Analytics API functions
- `src/hooks/use-session-tracking.ts` - Session management
- `src/hooks/use-analytics-tracking.ts` - Event tracking

### **Database:**
- `supabase/migrations/20251012200000_create_analytics_tables.sql`
- `supabase/migrations/20251013012446_*.sql` - RLS policies

### **Diagnostic Tools:**
- `TempDocs/DASHBOARD_DIAGNOSTIC_SCRIPT.sql` - Database diagnostic queries
- `DASHBOARD_WIDGETS_COMPREHENSIVE_ANALYSIS.md` - Full system documentation

---

## 🎯 NEXT STEPS

1. ✅ **Run Diagnostic Script** - Identify exact issue
2. ✅ **Apply Fixes** - Based on diagnostic results
3. ✅ **Test Widgets** - Verify data appears
4. ✅ **Monitor** - Check widgets refresh properly

**Remember:** If tables are empty because users haven't interacted yet, that's normal! The widgets correctly show "0" or empty states.

---

**Last Updated:** October 13, 2025  
**Status:** Styling Fixed ✅ | Data Issues Diagnosed ⚠️

