# 🔍 Admin Dashboard Widget Data Issues - Diagnostic & Fix Request

## 🎯 ISSUE SUMMARY

Three dashboard widgets are showing empty data (displaying "0" or no records) when they should have data:

1. **User Engagement Widget** - Active (7D) and Returning metrics showing 0
2. **RSVP Trends Widget** - Total RSVPs showing 0  
3. **Guestbook Activity Widget** - Contributors showing 0

**Note:** Border styling on Guestbook Contributors section has already been fixed ✅

---

## 📊 CURRENT STATE

### **What's Working:**
- ✅ User Engagement Widget displays "Total Users" correctly (8 users)
- ✅ Content Metrics Widget shows data
- ✅ System Health Widget shows data
- ✅ Photo Popularity Widget shows data
- ✅ All widgets load without errors
- ✅ Dashboard layout and styling are correct

### **What's Not Working:**
- ❌ User Engagement: Active (7D) = 0 (should show active users)
- ❌ User Engagement: Returning = 0 (should show returning users)
- ❌ RSVP Trends: Total RSVPs = 0 (should show RSVP count)
- ❌ Guestbook Activity: Contributors = 0 (should show contributor count)

---

## 🗄️ DATABASE ARCHITECTURE

### **Analytics Tables:**
```sql
-- User Sessions (tracks user activity)
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  browser TEXT,
  device_type TEXT,
  os TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0
);

-- User Activity Logs (tracks user actions)
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES user_sessions(id),
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page Views (tracks navigation)
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES user_sessions(id),
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### **Content Tables:**
```sql
-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  num_guests INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guestbook
CREATE TABLE public.guestbook (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Admin Access:**
All analytics tables use these RLS policies:

```sql
-- Admins can read analytics data
CREATE POLICY "Admins can manage user_sessions" 
  ON public.user_sessions FOR SELECT 
  USING (is_admin());

-- System can insert/update for tracking
CREATE POLICY "System can insert user_sessions" 
  ON public.user_sessions FOR INSERT 
  WITH CHECK (true);

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;
```

### **Admin Emails:**
- data.warrior2023@gmail.com
- kat_crouch@hotmail.com
- fso@data-warrior.com

---

## 📁 WIDGET FILES & QUERIES

### **1. User Engagement Widget**
**File:** `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`

**Queries:**
```typescript
// Active Users (7d) - SHOWING 0
const { data: activeSessions } = await supabase
  .from('user_sessions')
  .select('user_id')
  .gte('started_at', sevenDaysAgo.toISOString());

const activeUsers7d = new Set(activeSessions?.map(s => s.user_id).filter(Boolean)).size;

// Returning Users - SHOWING 0
const { data: allSessions } = await supabase
  .from('user_sessions')
  .select('user_id')
  .not('user_id', 'is', null);

const userSessionCounts = allSessions?.reduce((acc, s) => {
  if (s.user_id) {
    acc[s.user_id] = (acc[s.user_id] || 0) + 1;
  }
  return acc;
}, {} as Record<string, number>);

const returningUsers = Object.values(userSessionCounts || {}).filter(count => count > 1).length;
```

### **2. RSVP Trends Widget**
**File:** `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`

**Query:**
```typescript
// Total RSVPs - SHOWING 0
const { data: rsvps } = await supabase
  .from('rsvps')
  .select('status, num_guests, created_at');

const total = rsvps?.length || 0;
```

### **3. Guestbook Activity Widget**
**File:** `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`

**Query:**
```typescript
// Contributors - SHOWING 0
const { data: allPosts } = await supabase
  .from('guestbook')
  .select('display_name')
  .is('deleted_at', null);

const contributorMap: Record<string, number> = {};
allPosts?.forEach(post => {
  if (post.display_name) {
    contributorMap[post.display_name] = (contributorMap[post.display_name] || 0) + 1;
  }
});

const topContributors = Object.entries(contributorMap)
  .map(([display_name, post_count]) => ({ display_name, post_count }))
  .sort((a, b) => b.post_count - a.post_count);
```

---

## 🔍 DIAGNOSTIC QUESTIONS

### **1. Check Analytics Tracking System**

**Is the AnalyticsProvider active in App.tsx?**
- File: `src/App.tsx`
- Should wrap the application like this:
```tsx
<AnalyticsProvider>
  <Router>
    {/* app content */}
  </Router>
</AnalyticsProvider>
```

**Check these files:**
- `src/contexts/AnalyticsContext.tsx` - Context provider
- `src/hooks/use-session-tracking.ts` - Session lifecycle
- `src/hooks/use-analytics-tracking.ts` - Event tracking

### **2. Check Database Tables**

**Run these queries in Supabase SQL Editor:**

```sql
-- Check if analytics tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_sessions', 'page_views', 'user_activity_logs')
ORDER BY table_name;

-- Check if tables have data
SELECT 
  'user_sessions' as table_name, 
  COUNT(*) as record_count 
FROM user_sessions
UNION ALL
SELECT 'rsvps', COUNT(*) FROM rsvps
UNION ALL
SELECT 'guestbook', COUNT(*) FROM guestbook WHERE deleted_at IS NULL;

-- Check admin status
SELECT 
  is_admin() as is_admin_result,
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- Check if user has admin role
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### **3. Check Migration Status**

**Have these migrations been applied?**
- `20251012200000_create_analytics_tables.sql` - Creates analytics tables
- `20251013012446_*.sql` - Creates RLS policies
- `20250912012334_*.sql` - Admin functions

**Migration file location:** `supabase/migrations/`

### **4. Check Console Errors**

**In browser console (F12), look for:**
- Session creation logs: "Session started {sessionId: ...}"
- Page view tracking: "Page view tracked {path: ...}"
- Any Supabase errors related to RLS or permissions

---

## 🎯 POSSIBLE ROOT CAUSES

### **Scenario A: Analytics Not Initialized (Most Likely)**
**Symptoms:**
- `user_sessions` table is empty
- No console logs about session tracking
- AnalyticsProvider not wrapping app

**Solution:**
- Verify AnalyticsProvider is in App.tsx
- Check that useSessionTracking hook is being called
- Ensure analytics tracking is enabled

### **Scenario B: Tables Are Empty (Normal for New Events)**
**Symptoms:**
- Tables exist but have 0 records
- No users have submitted RSVPs yet
- No guestbook posts created yet

**Solution:**
- This is expected behavior - widgets correctly show "0"
- Wait for user activity or create test data

### **Scenario C: RLS Policies Blocking Access**
**Symptoms:**
- Queries return errors in browser console
- `is_admin()` returns false when it should be true
- "permission denied" errors

**Solution:**
- Ensure current user has admin role in `user_roles` table
- Run `ensure_admins_seeded()` function
- Verify RLS policies exist and are correct

### **Scenario D: Migration Not Applied**
**Symptoms:**
- "relation does not exist" errors
- Tables missing from database
- Functions like `is_admin()` don't exist

**Solution:**
- Apply analytics migrations
- Check migration status
- Run pending migrations

---

## ✅ WHAT I NEED YOU TO DO

### **Step 1: Diagnose**
1. Check if AnalyticsProvider is wrapping the app in `src/App.tsx`
2. Verify analytics tables exist in database
3. Check if tables have any data (run diagnostic queries above)
4. Verify admin status and RLS policies

### **Step 2: Identify Root Cause**
Based on diagnostic results, determine which scenario (A, B, C, or D) applies

### **Step 3: Implement Fix**

**If Analytics Not Tracking (Scenario A):**
- Ensure AnalyticsProvider is properly integrated
- Verify session tracking hooks are active
- Check for initialization errors

**If RLS Blocking (Scenario C):**
- Ensure current user email is in admin list
- Add user to `user_roles` table if needed
- Verify `is_admin()` function works

**If Migrations Missing (Scenario D):**
- Apply missing migrations
- Create analytics tables
- Set up RLS policies

**If Just No Data Yet (Scenario B):**
- Confirm this is expected behavior
- Optionally create test data for demonstration

### **Step 4: Verify Fix**
- Run the widget queries manually in SQL Editor
- Refresh dashboard and check if data appears
- Verify all three affected widgets show correct data

---

## 📋 EXPECTED RESULTS AFTER FIX

### **User Engagement Widget:**
- Active (7D): Should show count > 0 if users visited in last 7 days
- Returning: Should show count > 0 if any user has multiple sessions

### **RSVP Trends Widget:**
- Total RSVPs: Should show count of records in `rsvps` table
- Confirmed: Count where `status = 'confirmed'`
- Pending: Count where `status = 'pending'`

### **Guestbook Activity Widget:**
- Contributors: Count of unique `display_name` values
- Should show "No contributors yet" if table is empty (this is correct behavior)

---

## 🚀 TEST DATA (Optional)

If you want to create test data to verify widgets work:

```sql
-- Create test user session
INSERT INTO user_sessions (user_id, browser, device_type, os, started_at, pages_viewed)
VALUES (auth.uid(), 'Chrome', 'desktop', 'Windows', NOW() - INTERVAL '2 days', 5);

-- Create test RSVP
INSERT INTO rsvps (name, email, status, num_guests)
VALUES ('Test User', 'test@example.com', 'confirmed', 2);

-- Create test guestbook post
INSERT INTO guestbook (display_name, message)
VALUES ('Test User', 'Test message for diagnostics');

-- Verify test data was created
SELECT 
  (SELECT COUNT(*) FROM user_sessions) as sessions,
  (SELECT COUNT(*) FROM rsvps) as rsvps,
  (SELECT COUNT(*) FROM guestbook WHERE deleted_at IS NULL) as posts;
```

---

## 📚 REFERENCE FILES

### **Component Files:**
- `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`
- `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`
- `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`
- `src/pages/AdminDashboard.tsx`

### **Data/API Files:**
- `src/lib/analytics-api.ts` - Analytics API functions
- `src/hooks/use-session-tracking.ts` - Session management
- `src/hooks/use-analytics-tracking.ts` - Event tracking
- `src/contexts/AnalyticsContext.tsx` - Analytics provider

### **Database Files:**
- `supabase/migrations/20251012200000_create_analytics_tables.sql`
- `supabase/migrations/20251013012446_*.sql` (RLS policies)
- `supabase/migrations/20250912012334_*.sql` (Admin functions)

---

## 🎯 DELIVERABLES REQUESTED

1. **Root Cause Analysis:** Identify which scenario (A, B, C, or D) is causing the issue
2. **Diagnostic Results:** Output from running the diagnostic SQL queries
3. **Code Changes:** Any necessary changes to fix the issue
4. **Verification:** Confirmation that widgets now show correct data
5. **Explanation:** Brief explanation of what was wrong and how it was fixed

---

## 💡 IMPORTANT NOTES

- **Don't modify:** Files in `src/components/ui/` (shadcn components)
- **Don't modify:** Core config files (per LOVABLE_AI_RULES.md)
- **Can modify:** Widget components, hooks, contexts, API files
- **RLS is active:** All analytics queries require admin access
- **Session tracking:** Requires AnalyticsProvider to be active
- **Test thoroughly:** Verify each affected metric shows correct data

---

## 🎬 START HERE

**First, please run these diagnostic queries in Supabase SQL Editor and share the results:**

```sql
-- Quick diagnostic
SELECT 
  'Admin Status' as check_type,
  is_admin() as result,
  auth.email() as current_user
UNION ALL
SELECT 'user_sessions count', COUNT(*)::text, 'records' FROM user_sessions
UNION ALL
SELECT 'rsvps count', COUNT(*)::text, 'records' FROM rsvps
UNION ALL
SELECT 'guestbook count', COUNT(*)::text, 'posts' FROM guestbook WHERE deleted_at IS NULL;
```

Based on these results, we can determine the exact issue and implement the appropriate fix.

---

**Ready to start troubleshooting! Please run the diagnostic and let me know what you find.** 🚀

