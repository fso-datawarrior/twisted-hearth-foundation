# Database Implementation Guide - Twisted Hearth Foundation Admin System

## Overview

This document details the complete database implementation for the Twisted Hearth Foundation admin system, including authentication fixes, gallery management enhancements, and bulk email communication features. This guide serves as a reference for future development and troubleshooting.

## Database Architecture

### Core Tables

#### 1. User Roles & Authentication
- **`user_roles`** - Stores user roles (admin, user, etc.)
- **`profiles`** - User profile information
- **`auth.users`** - Supabase authentication users

#### 2. Gallery Management
- **`photos`** - Enhanced with preview categories and soft delete
- **`photo_reactions`** - User reactions to photos

#### 3. Email Communication
- **`email_campaigns`** - Bulk email campaign tracking
- **`email_sends`** - Individual email delivery tracking

#### 4. Event Management
- **`rsvps`** - Event RSVP management
- **`tournament_registrations`** - Tournament signups
- **`hunt_progress`** - Scavenger hunt tracking
- **`guestbook_entries`** - Guestbook messages

## Implementation Phases

### Phase 1: Admin Authentication Fix

#### Problem
The `ensure_admins_seeded()` function was empty, preventing admin users from accessing admin features.

#### Solution
**File:** `supabase/migrations/20250120000001_fix_admin_seeding.sql`

```sql
-- Fix the ensure_admins_seeded function to actually seed admin users
CREATE OR REPLACE FUNCTION public.ensure_admins_seeded()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails text[] := ARRAY['data.warrior2023@gmail.com', 'kat_crouch@hotmail.com', 'fso@data-warrior.com'];
  email_addr text;
  user_id_found uuid;
BEGIN
  -- Loop through admin emails and ensure they have admin roles
  FOREACH email_addr IN ARRAY admin_emails
  LOOP
    -- Check if user exists in auth.users and get their ID
    SELECT id INTO user_id_found 
    FROM auth.users 
    WHERE lower(email) = lower(email_addr);
    
    IF user_id_found IS NOT NULL THEN
      -- Insert admin role using the app_role enum type
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_id_found, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE LOG 'Ensured admin role for user: % (ID: %)', email_addr, user_id_found;
    ELSE
      RAISE LOG 'User not found in auth.users: %', email_addr;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_admins_seeded() TO authenticated;

-- Run the seeding function immediately
SELECT public.ensure_admins_seeded();
```

#### Key Features
- Automatically assigns admin roles to specified email addresses
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate entries
- Logs success/failure for each email address
- Runs immediately after function creation

### Phase 2: Gallery Management Enhancement

#### Database Schema Changes
**File:** `supabase/migrations/20250120000002_enhance_gallery_management.sql`

##### New Columns Added to `photos` Table
```sql
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

##### Preview Categories
- **`vignettes`** - Past Vignettes (Twisted tales from previous gatherings)
- **`activities`** - Event Activities (Games, competitions, and twisted fun)
- **`costumes`** - Costume Inspiration (Twisted fairytale character ideas)
- **`thumbnails`** - Event Memories (Quick glimpses of past celebrations)

##### Database Functions

**Soft Delete Function:**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_photo(p_photo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete photos';
  END IF;
  
  UPDATE public.photos
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo soft deleted: % by user: %', p_photo_id, auth.uid();
END;
$$;
```

**Restore Function:**
```sql
CREATE OR REPLACE FUNCTION public.restore_photo(p_photo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can restore photos';
  END IF;
  
  UPDATE public.photos
  SET deleted_at = NULL,
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo restored: % by user: %', p_photo_id, auth.uid();
END;
$$;
```

**Enhanced Moderate Photo Function:**
```sql
CREATE OR REPLACE FUNCTION public.moderate_photo(
  p_photo_id UUID,
  p_approved BOOLEAN,
  p_featured BOOLEAN DEFAULT false,
  p_is_preview BOOLEAN DEFAULT NULL,
  p_preview_category TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can moderate photos';
  END IF;
  
  -- Validate preview_category if provided
  IF p_preview_category IS NOT NULL AND 
     p_preview_category NOT IN ('vignettes', 'activities', 'costumes', 'thumbnails') THEN
    RAISE EXCEPTION 'Invalid preview category: %', p_preview_category;
  END IF;
  
  UPDATE public.photos
  SET is_approved = p_approved,
      is_featured = p_featured,
      is_preview = COALESCE(p_is_preview, is_preview),
      preview_category = COALESCE(p_preview_category, preview_category),
      sort_order = COALESCE(p_sort_order, sort_order),
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo moderated: % approved: % featured: % by user: %', 
    p_photo_id, p_approved, p_featured, auth.uid();
END;
$$;
```

##### Row Level Security (RLS) Policies

**Updated Photo Viewing Policy:**
```sql
CREATE POLICY "Anyone can view approved non-deleted photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND 
    (is_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );
```

**Admin Deleted Photos Policy:**
```sql
CREATE POLICY "Admins can view deleted photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NOT NULL AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );
```

**Admin Soft Delete Policy:**
```sql
CREATE POLICY "Admins can soft delete photos"
  ON public.photos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

#### API Functions Added
**File:** `src/lib/photo-api.ts`

```typescript
// Soft delete photo (admin only)
export const softDeletePhoto = async (photoId: string): Promise<{ error: any }> => {
  const { error } = await supabase.rpc('soft_delete_photo', { p_photo_id: photoId });
  return { error };
};

// Restore soft-deleted photo (admin only)
export const restorePhoto = async (photoId: string): Promise<{ error: any }> => {
  const { error } = await supabase.rpc('restore_photo', { p_photo_id: photoId });
  return { error };
};

// Get preview photos by category
export const getPreviewPhotosByCategory = async (category: string): Promise<{ data: Photo[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_preview', true)
    .eq('preview_category', category)
    .eq('is_approved', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  
  return { data: data as Photo[] | null, error };
};

// Get all preview photos
export const getAllPreviewPhotos = async (): Promise<{ data: Photo[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_preview', true)
    .eq('is_approved', true)
    .is('deleted_at', null)
    .order('preview_category', { ascending: true })
    .order('sort_order', { ascending: true });
  
  return { data: data as Photo[] | null, error };
};

// Admin: upload preview photo
export const uploadPreviewPhoto = async (
  filePath: string,
  filename: string,
  previewCategory: string,
  caption?: string,
  sortOrder?: number
): Promise<{ data: Photo | null; error: any }> => {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      storage_path: filePath,
      filename,
      caption,
      is_preview: true,
      preview_category: previewCategory,
      is_approved: true,
      sort_order: sortOrder || 0
    })
    .select()
    .single();
  
  return { data: data as Photo | null, error };
};

// Enhanced moderate photo with category management (admin only)
export const moderatePhotoEnhanced = async (
  photoId: string,
  approve: boolean,
  featured: boolean = false,
  isPreview?: boolean,
  previewCategory?: string,
  sortOrder?: number
): Promise<{ data: Photo | null; error: any }> => {
  const { data, error } = await supabase.rpc('moderate_photo', {
    p_photo_id: photoId,
    p_approved: approve,
    p_featured: featured,
    p_is_preview: isPreview,
    p_preview_category: previewCategory,
    p_sort_order: sortOrder
  });

  return { data: data as Photo | null, error };
};
```

### Phase 3: Email Communication System

#### Database Schema
**File:** `supabase/migrations/20250120000003_email_communication_system.sql`

##### Email Campaigns Table
```sql
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message_html TEXT NOT NULL,
  message_text TEXT NOT NULL,
  recipient_filter TEXT NOT NULL CHECK (recipient_filter IN ('all_rsvps', 'confirmed_rsvps', 'pending_rsvps', 'all_users')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

##### Email Sends Table
```sql
CREATE TABLE IF NOT EXISTS public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

##### Recipient Filter Function
```sql
CREATE OR REPLACE FUNCTION public.get_email_recipients(p_filter TEXT)
RETURNS TABLE (email TEXT, name TEXT, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can get email recipients';
  END IF;

  RETURN QUERY
  CASE p_filter
    WHEN 'all_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'confirmed_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.status = 'confirmed' AND r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'pending_rsvps' THEN
      SELECT DISTINCT r.email, r.name, r.user_id
      FROM public.rsvps r
      WHERE r.status = 'pending' AND r.email IS NOT NULL
      ORDER BY r.name;
    
    WHEN 'all_users' THEN
      SELECT DISTINCT au.email, 
             COALESCE(p.display_name, au.email) as name,
             au.id as user_id
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.id = au.id
      WHERE au.email IS NOT NULL
      ORDER BY name;
    
    ELSE
      RAISE EXCEPTION 'Invalid recipient filter: %', p_filter;
  END CASE;
END;
$$;
```

#### Edge Function for Bulk Email
**File:** `supabase/functions/send-bulk-email/index.ts`

Key features:
- Uses Mailjet API for email delivery
- Processes emails in batches of 50 (Mailjet limit)
- Tracks delivery status for each email
- Handles errors gracefully
- Updates campaign status in real-time

## Frontend Integration

### Admin Context
**File:** `src/contexts/AdminContext.tsx`

The admin context manages global admin state and calls the seeding function on initialization:

```typescript
const checkAdminStatus = async () => {
  try {
    if (user) {
      await supabase.rpc('ensure_admins_seeded'); // Calls the seeding function
      const { data: isAdminResult, error: adminError } = await supabase.rpc('check_admin_status');
      if (!adminError && isAdminResult === true) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
      setIsAdminView(false);
    }
  } catch (error) {
    setIsAdmin(false);
  } finally {
    setLoading(false);
  }
};
```

### Gallery Management Component
**File:** `src/components/admin/GalleryManagement.tsx`

Features implemented:
- 4 tabs: User Uploads, Preview Gallery, Upload Preview, Deleted Photos
- Search and filtering capabilities
- Bulk operations support
- Preview photo upload with category selection
- Soft delete/restore functionality
- Sort order management

### Email Communication Component
**File:** `src/components/admin/EmailCommunication.tsx`

Features implemented:
- 4 tabs: Compose, Templates, History, Preview
- Email templates (Event Reminder, Event Update, Thank You)
- Recipient filtering (All RSVPs, Confirmed, Pending, All Users)
- Campaign history with delivery status
- Preview recipient lists before sending

## Database Connection Details

### Supabase Configuration
**File:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_api_secret
MAILJET_FROM_EMAIL=your_from_email
MAILJET_FROM_NAME=your_from_name
```

### Service Role Key (Edge Functions)
The edge functions use the service role key for elevated permissions:

```typescript
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

## Security Implementation

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

1. **Admin-only functions** - Use `public.is_admin()` check
2. **User data access** - Users can only see their own data
3. **Public data** - Approved photos visible to all authenticated users
4. **Admin data** - Deleted photos and email campaigns only visible to admins

### Function Security
All database functions use `SECURITY DEFINER` to run with elevated privileges while maintaining security through admin checks.

### API Security
- All admin functions check for admin role before execution
- Soft delete prevents data loss
- Email functions validate recipient filters
- File uploads go through proper validation

## Migration Strategy

### Safe Migrations
All migrations use `ADD COLUMN IF NOT EXISTS` to prevent conflicts:

```sql
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

### RSVP Admin Connection Fix

**File:** `supabase/migrations/20250120000004_fix_rsvp_admin_connections.sql`

This migration fixes RSVP admin functionality by adding missing fields and correcting field references:

```sql
-- Fix RSVP admin connections by adding missing fields and fixing queries
-- This migration adds the missing fields that the admin dashboard expects

-- Add missing fields to rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS costume_idea TEXT,
ADD COLUMN IF NOT EXISTS contributions TEXT;

-- Create index for performance on new fields
CREATE INDEX IF NOT EXISTS idx_rsvps_costume ON public.rsvps(costume_idea) WHERE costume_idea IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rsvps_contributions ON public.rsvps(contributions) WHERE contributions IS NOT NULL;

-- Update the admin_update_rsvp_status function to use correct field name
CREATE OR REPLACE FUNCTION public.admin_update_rsvp_status(
  p_rsvp_id UUID,
  p_status TEXT,
  p_is_approved BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update RSVP status';
  END IF;
  
  UPDATE public.rsvps
  SET status = p_status,
      is_approved = COALESCE(p_is_approved, is_approved),
      updated_at = now()
  WHERE id = p_rsvp_id;  -- Use 'id' not 'rsvp_id'
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_update_rsvp_status TO authenticated;
```

**Why this migration is needed:**
- The admin dashboard expects `costume_idea` and `contributions` fields that were missing
- The `admin_update_rsvp_status` function was using `rsvp_id` instead of `id` as the primary key
- This causes RSVP management to fail in the admin dashboard

### Rollback Plan
1. Database migrations are additive and safe
2. Static preview images remain as fallback
3. Existing functionality unchanged
4. Each phase can be rolled back independently

## Testing Checklist

### Admin Authentication
- [ ] Admin users can see admin toggle in navigation
- [ ] Non-admin users cannot access admin features
- [ ] Admin seeding function works correctly
- [ ] Role assignments persist across sessions

### Gallery Management
- [ ] Admin can upload preview photos to each category
- [ ] Soft delete hides photos from public view
- [ ] Restore brings back deleted photos
- [ ] Category filters work correctly
- [ ] Sort order is respected in preview gallery
- [ ] User uploads still work as before

### Email Communication
- [ ] Email composer works with all recipient filters
- [ ] Preview recipient list shows correct count
- [ ] Test email sends successfully
- [ ] Bulk emails send to all recipients
- [ ] Failed emails are tracked and can be resent
- [ ] Email history shows delivery status

## Troubleshooting

### Common Issues

1. **Admin toggle not visible**
   - Check if `ensure_admins_seeded()` function is working
   - Verify user email is in admin list
   - Check browser console for errors

2. **Photos not showing in preview gallery**
   - Verify `is_preview = true` and `preview_category` is set
   - Check if photos are approved and not deleted
   - Verify RLS policies are correct

3. **Email sending fails**
   - Check Mailjet API credentials
   - Verify recipient filter is valid
   - Check edge function logs

4. **Database connection issues**
   - Verify environment variables
   - Check Supabase project status
   - Verify RLS policies

### Debug Queries

```sql
-- Check admin roles
SELECT u.email, ur.role 
FROM auth.users u 
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;

-- Check preview photos
SELECT id, filename, is_preview, preview_category, deleted_at 
FROM public.photos 
WHERE is_preview = true;

-- Check email campaigns
SELECT id, subject, status, recipient_count, sent_count, failed_count 
FROM public.email_campaigns 
ORDER BY created_at DESC;
```

## Future Enhancements

### Performance Optimizations
- Add database indexes for frequently queried columns
- Implement caching for preview photos
- Add pagination for large datasets

### Security Enhancements
- Add rate limiting for uploads and emails
- Implement audit logging for admin actions
- Add file validation and scanning

### User Experience
- Add drag-and-drop file upload
- Implement batch operations
- Add progress indicators for long operations

## Troubleshooting LLM Database Access in Cursor

When working with LLMs in environments like Cursor, connecting to and interacting with databases can sometimes present unique challenges. This section outlines common issues and their solutions, particularly focusing on why one chat might succeed where another fails, drawing insights from typical LLM operational constraints.

### Common Problems and Solutions

#### 1. Missing or Inaccessible Tools/Environment Setup
*   **Problem**: The LLM's execution environment (e.g., a specific Cursor chat instance or agent) might not have the necessary database client tools (like `supabase-cli`, `psql`, `pg_dump`) installed, configured, or available in its PATH. The image shows "Tool `mcp_supabase_list_projects` not found," which is a direct example of this.
*   **Why it happens**: Different Cursor chat instances or agent configurations might have varying access to system-level tools or environment variables. A fresh chat might not inherit the setup from a previous one.
*   **Solution**:
    *   **Verify Tool Installation**: Ensure `supabase-cli` (or other relevant database clients) is installed in the environment where the LLM's code is executed.
    *   **Check PATH**: Confirm that the tool's executable directory is included in the system's PATH environment variable.
    *   **Explicit Tool Calls**: If possible, use absolute paths to tools or ensure the LLM is instructed to install/configure them if it has the capability.
    *   **Agent Mode**: As suggested in the image, "Try enabling the MCP server or switching to Agent mode." Different modes might have different tool access or permissions.

#### 2. Authentication Issues (Interactive vs. Programmatic)
*   **Problem**: Supabase (and many other services) often uses interactive, browser-based authentication flows. LLMs, operating in headless or non-interactive environments, cannot perform these actions. The image states, "The Supabase login process is interactive and requires browser authentication."
*   **Why it happens**: An LLM cannot open a browser window, click buttons, or enter credentials in a web form.
*   **Solution**:
    *   **Service Role Keys**: For server-side operations or LLM agents, use Supabase Service Role Keys. These bypass Row Level Security (RLS) and provide full access, so use them with extreme caution and only in secure, controlled environments.
    *   **API Keys (Anon/Public)**: For client-side or read-only operations, use the `anon` (public) key. Ensure RLS policies are correctly configured to restrict access.
    *   **Environment Variables**: Store API keys and service role keys as environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) that the LLM's process can access.
    *   **Manual Authentication**: If programmatic authentication is impossible, the LLM might need to provide SQL commands or instructions for a human user to execute directly in the Supabase dashboard or a local client.

#### 3. Incorrect Credentials or Environment Variables
*   **Problem**: The LLM might be using outdated, incorrect, or missing database credentials (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
*   **Why it happens**: Environment variables might not be consistently set across different chat sessions, or they might have been changed.
*   **Solution**:
    *   **Verify Environment Variables**: Always confirm that the necessary environment variables are correctly set and accessible to the LLM's process.
    *   **Supabase Dashboard**: Double-check the API keys and project URL in your Supabase project settings.
    *   **Cursor's Environment**: Understand how Cursor manages environment variables for its LLM agents. You might need to explicitly set them for each session or project.

#### 4. Row Level Security (RLS) Policies
*   **Problem**: Even if connected, the LLM's user (or the API key it's using) might not have the necessary permissions due to RLS policies.
*   **Why it happens**: RLS is designed to restrict data access based on user roles. If the LLM is operating with a `public` or `anon` key, it will be subject to these policies.
*   **Solution**:
    *   **Review RLS Policies**: Carefully examine your Supabase RLS policies for the tables the LLM needs to access.
    *   **Use Service Role Key (Carefully)**: For admin-level tasks, the `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Use this only when absolutely necessary and ensure the LLM's access to this key is highly restricted.
    *   **Specific Policies**: Create RLS policies that explicitly grant the necessary `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions to the roles associated with the LLM's access method.

#### 5. Network or Firewall Restrictions
*   **Problem**: The LLM's environment might be blocked from accessing Supabase's servers due to network or firewall rules.
*   **Why it happens**: Corporate networks, VPNs, or local firewall settings can sometimes restrict outbound connections.
*   **Solution**:
    *   **Check Connectivity**: Try to ping `supabase.com` or your Supabase project URL from the LLM's execution environment (if possible).
    *   **Firewall Rules**: Ensure that outbound connections on standard HTTPS ports (443) are allowed.
    *   **Proxy Settings**: If operating behind a proxy, ensure the LLM's environment is configured to use it.

#### 6. Database State or Schema Mismatches
*   **Problem**: The LLM might be attempting to interact with a database schema or data that doesn't match its expectations, especially after migrations.
*   **Why it happens**: If migrations haven't been applied correctly, or if the LLM's internal model of the database is out of sync.
*   **Solution**:
    *   **Run Migrations**: Ensure all necessary database migrations have been successfully applied to the target Supabase instance.
    *   **Refresh Schema**: If the LLM has a cached schema, instruct it to refresh its understanding of the database structure.

### Why One Chat Succeeds While Another Fails

#### 1. **Session State Persistence**
- **Success**: A chat that has already authenticated or established a connection might maintain that state.
- **Failure**: A new chat session starts fresh without any previous authentication or connection state.
- **Solution**: Always verify authentication and connection status at the start of each new chat session.

#### 2. **Environment Variable Inheritance**
- **Success**: A chat might inherit environment variables from a previous session or system configuration.
- **Failure**: A new chat might not have access to the same environment variables.
- **Solution**: Explicitly set and verify all required environment variables in each chat session.

#### 3. **Tool Availability and Configuration**
- **Success**: A chat might have access to specific tools or configurations that were set up previously.
- **Failure**: A new chat might not have the same tool access or configuration.
- **Solution**: Verify tool availability and configuration at the start of each session.

#### 4. **Database Connection Pooling**
- **Success**: A chat might be using an existing database connection from a pool.
- **Failure**: A new chat might need to establish a new connection, which could fail due to various reasons.
- **Solution**: Implement proper connection handling and retry logic.

#### 5. **Caching and State Management**
- **Success**: A chat might have cached data or state that allows it to work with the database.
- **Failure**: A new chat might not have the same cached data or state.
- **Solution**: Implement proper caching strategies and state management.

### Debugging Steps for LLM Database Access

#### Step 1: Verify Environment Setup
```bash
# Check if Supabase CLI is installed
supabase --version

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### Step 2: Test Database Connection
```typescript
// Test basic connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection
const { data, error } = await supabase.from('profiles').select('count').limit(1)
if (error) {
  console.error('Connection failed:', error)
} else {
  console.log('Connection successful')
}
```

#### Step 3: Check RLS Policies
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### Step 4: Verify Admin Functions
```sql
-- Test admin seeding function
SELECT public.ensure_admins_seeded();

-- Check admin roles
SELECT u.email, ur.role 
FROM auth.users u 
LEFT JOIN public.user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'admin';
```

### Common Error Messages and Solutions

#### "Tool not found" Errors
- **Cause**: Missing CLI tools or incorrect PATH
- **Solution**: Install required tools and verify PATH configuration

#### "Authentication failed" Errors
- **Cause**: Invalid credentials or expired tokens
- **Solution**: Verify API keys and refresh if necessary

#### "Permission denied" Errors
- **Cause**: RLS policies blocking access
- **Solution**: Review and update RLS policies or use service role key

#### "Connection timeout" Errors
- **Cause**: Network issues or firewall restrictions
- **Solution**: Check network connectivity and firewall settings

#### "Schema not found" Errors
- **Cause**: Database migrations not applied
- **Solution**: Run all pending migrations

### Best Practices for LLM Database Access

1. **Always verify environment setup** at the start of each session
2. **Use service role keys sparingly** and only for admin operations
3. **Implement proper error handling** for all database operations
4. **Test connections** before attempting complex operations
5. **Document all required environment variables** and their purposes
6. **Use RLS policies** to restrict access appropriately
7. **Implement retry logic** for transient failures
8. **Monitor and log** all database access attempts

This implementation provides a robust, secure, and scalable admin system for the Twisted Hearth Foundation event management platform.
