# Analytics Database Migration - Lovable AI Prompt

## Objective
Execute the analytics tables migration in Supabase to ensure all required fields exist in the database schema. This migration creates or updates 6 analytics tables with proper RLS policies, indexes, and relationships.

## Critical Information
- **Project Ref**: `dgdeiybuxlqbdfofzxpy`
- **Migration File**: `supabase/migrations/20251012200000_create_analytics_tables.sql`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy
- **SQL Editor**: https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/sql

## Step-by-Step Instructions

### Step 1: Read the Migration File
First, read and understand the complete migration file located at:
```
supabase/migrations/20251012200000_create_analytics_tables.sql
```

This file contains:
- 6 analytics table definitions (user_sessions, page_views, user_activity_logs, content_interactions, system_metrics, analytics_daily_aggregates)
- Row Level Security (RLS) policies for admin-only read access
- Performance indexes for all tables
- Foreign key relationships
- Table documentation comments

### Step 2: Access Supabase SQL Editor
Navigate to the Supabase SQL Editor at:
https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy/sql/new

### Step 3: Execute the Migration

#### 3a. Copy the Migration SQL
Copy the ENTIRE contents of `supabase/migrations/20251012200000_create_analytics_tables.sql` (200 lines)

#### 3b. Paste into SQL Editor
Paste the complete SQL into the Supabase SQL Editor query window

#### 3c. Execute the Query
Click the "Run" button to execute the migration

#### 3d. Verify Success
After execution, you should see:
- Success message indicating all statements executed
- No error messages
- Confirmation that tables, indexes, and policies were created

### Step 4: Verify Table Structure

Run the following verification queries ONE AT A TIME to confirm all tables exist with correct schemas:

#### Verify user_sessions table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid, NOT NULL)
- user_id (uuid, nullable)
- browser (text, nullable)
- device_type (text, nullable)
- os (text, nullable)
- started_at (timestamp with time zone, NOT NULL)
- ended_at (timestamp with time zone, nullable)
- duration_seconds (integer, nullable)
- pages_viewed (integer, nullable)
- actions_taken (integer, nullable)
- ip_address (text, nullable)
- country (text, nullable)
- region (text, nullable)

#### Verify page_views table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'page_views'
ORDER BY ordinal_position;
```

**Expected columns:**
- id, user_id, session_id, page_path, page_title, referrer, viewport_width, viewport_height, time_on_page, exited_at, created_at

#### Verify user_activity_logs table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_activity_logs'
ORDER BY ordinal_position;
```

**Expected columns:**
- id, user_id, session_id, action_type, action_category, action_details, metadata, created_at

#### Verify content_interactions table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'content_interactions'
ORDER BY ordinal_position;
```

#### Verify system_metrics table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'system_metrics'
ORDER BY ordinal_position;
```

**Expected columns:**
- id, metric_type, metric_value, metric_unit, details, recorded_at

#### Verify analytics_daily_aggregates table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'analytics_daily_aggregates'
ORDER BY ordinal_position;
```

**Expected columns (19 total):**
- id, date, created_at, updated_at
- total_page_views, unique_visitors, active_sessions
- avg_session_duration, avg_page_load_time, error_count
- new_users, total_users
- rsvps_submitted, rsvps_confirmed, photos_uploaded, guestbook_posts
- popular_photos, top_pages

### Step 5: Verify RLS Policies

Check that Row Level Security policies are enabled:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_sessions', 'page_views', 'user_activity_logs', 
                     'content_interactions', 'system_metrics', 'analytics_daily_aggregates')
ORDER BY tablename, policyname;
```

**Expected policies for each table:**
- Admin can view/manage (SELECT policy using is_admin())
- System can insert (INSERT policy with CHECK true)
- System can update (UPDATE policy where applicable)

### Step 6: Verify Indexes

Check that performance indexes exist:

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_sessions', 'page_views', 'user_activity_logs', 
                     'content_interactions', 'system_metrics', 'analytics_daily_aggregates')
ORDER BY tablename, indexname;
```

**Expected indexes (20+ total):**
- idx_user_sessions_user_id
- idx_user_sessions_started_at
- idx_user_sessions_ended_at
- idx_page_views_session_id
- idx_page_views_user_id
- idx_page_views_created_at
- idx_page_views_page_path
- idx_user_activity_logs_session_id
- idx_user_activity_logs_user_id
- idx_user_activity_logs_created_at
- idx_user_activity_logs_action_type
- idx_content_interactions_session_id
- idx_content_interactions_user_id
- idx_content_interactions_content_id
- idx_content_interactions_created_at
- idx_content_interactions_composite
- idx_system_metrics_recorded_at
- idx_system_metrics_metric_type
- idx_system_metrics_composite
- idx_analytics_daily_aggregates_date

## Expected Results

After successful migration:
1. ✅ All 6 analytics tables exist with correct schemas
2. ✅ All tables have RLS enabled
3. ✅ Admin and system RLS policies are in place
4. ✅ All performance indexes are created
5. ✅ Foreign key relationships are established
6. ✅ Table comments are added for documentation

## Troubleshooting

### If tables already exist:
The migration uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`, so it's safe to run even if tables exist. It will skip existing tables and add missing columns if needed.

### If foreign key errors occur:
Ensure the `is_admin()` function exists in your database. If not, you may need to create it first:
```sql
-- Check if is_admin() function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'is_admin';
```

### If RLS policy errors occur:
If policies with the same name already exist, you may need to drop them first:
```sql
-- Example: Drop existing policy if needed
DROP POLICY IF EXISTS "Admins can manage user_sessions" ON public.user_sessions;
```

## Success Confirmation

Report back with:
1. ✅ Migration execution status (success/errors)
2. ✅ Count of tables created/verified (should be 6)
3. ✅ Count of indexes created (should be 19+)
4. ✅ Count of RLS policies created (should be 13+)
5. ✅ Any warnings or errors encountered

## Post-Migration Actions

After successful migration:
1. Update TypeScript types if needed (run `npx supabase gen types typescript`)
2. Test frontend analytics tracking
3. Verify admin dashboard can query analytics data
4. Check that analytics context is collecting data

---

**IMPORTANT NOTES:**
- This migration is **IDEMPOTENT** (safe to run multiple times)
- All operations use `IF NOT EXISTS` to prevent conflicts
- Existing data will NOT be deleted or modified
- The migration only CREATES or ADDS, never DROPS or REMOVES
- Estimated execution time: 30-60 seconds

**Database Credentials Location:**
- Stored in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Service role key available in Supabase Dashboard → Settings → API
- Never commit credentials to version control

