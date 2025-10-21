# Security & RLS - Twisted Hearth Foundation

## Overview
Row Level Security (RLS) policies and security measures implemented in the Twisted Hearth Foundation database system.

## Row Level Security (RLS)

### RLS Status
All tables have RLS enabled:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
-- ... and all other tables
```

## Admin Role System

### Admin Role Table
```sql
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Admin Check Function
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;
```

**Security Features**:
- ✅ SECURITY DEFINER bypasses RLS for role checking
- ✅ STABLE function for performance
- ✅ Used in all admin-only policies

## RLS Policies by Table

### Users Table
```sql
-- Users can see their own data or admins can see all
CREATE POLICY "users_select_own_or_admin"
ON public.users
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
```

### RSVPs Table
```sql
-- Select: Owner or admin
CREATE POLICY "rsvps_select_owner_or_admin"
ON public.rsvps
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Insert: Self or admin
CREATE POLICY "rsvps_insert_self_or_admin"
ON public.rsvps
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Update: Owner or admin
CREATE POLICY "rsvps_update_owner_or_admin"
ON public.rsvps
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Delete: Owner or admin
CREATE POLICY "rsvps_delete_owner_or_admin"
ON public.rsvps
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
```

### Guestbook Table
```sql
-- Public read for visible posts
CREATE POLICY "gb_select_visible"
ON public.guestbook
FOR SELECT
USING (deleted_at IS NULL);

-- Insert by authenticated users
CREATE POLICY "gb_insert_own"
ON public.guestbook
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update by owner only
CREATE POLICY "gb_update_owner_only"
ON public.guestbook
FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL);
```

### Photos Table
```sql
-- Public read for approved photos
CREATE POLICY "photos_public_read_approved"
ON public.photos
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Owners & admins can see unapproved photos
CREATE POLICY "photos_owner_or_admin_read_unapproved"
ON public.photos
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Upload by owner or admin
CREATE POLICY "photos_insert_owner_or_admin"
ON public.photos
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Update/Delete by owner or admin
CREATE POLICY "photos_update_owner_or_admin"
ON public.photos
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());
```

### Hunt System Tables
```sql
-- Hunt hints: Public read for active hints
CREATE POLICY "hunt_hints_public_read"
ON public.hunt_hints
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Hunt hints: Admin-only write
CREATE POLICY "hunt_hints_admin_write"
ON public.hunt_hints
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Hunt runs: Owner or admin access
CREATE POLICY "hunt_runs_select_owner_or_admin"
ON public.hunt_runs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Hunt progress: Owner or admin access
CREATE POLICY "hunt_progress_select_owner_or_admin"
ON public.hunt_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
```

### Analytics Tables
```sql
-- Analytics: Admin-only read, system can insert
CREATE POLICY "Admins can manage user_sessions" 
ON public.user_sessions FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert user_sessions" 
ON public.user_sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update user_sessions" 
ON public.user_sessions FOR UPDATE 
USING (true);

-- Page views: Admin read, system write
CREATE POLICY "Admins can view page_views" 
ON public.page_views FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System can insert page_views" 
ON public.page_views FOR INSERT 
WITH CHECK (true);
```

## Security Patterns

### Pattern 1: Owner + Admin Access
```sql
-- Standard pattern for user-owned data
CREATE POLICY "table_select_owner_or_admin"
ON public.table_name
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
```

### Pattern 2: Public Read + Admin Write
```sql
-- Pattern for public content with admin management
CREATE POLICY "table_public_read"
ON public.table_name
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "table_admin_write"
ON public.table_name
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

### Pattern 3: System + Admin Access
```sql
-- Pattern for system-generated data
CREATE POLICY "table_system_insert"
ON public.table_name
FOR INSERT
WITH CHECK (true);

CREATE POLICY "table_admin_read"
ON public.table_name
FOR SELECT
USING (public.is_admin());
```

## Storage Security

### Avatar Storage Policies
```sql
-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars are publicly viewable
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Security Functions

### SECURITY DEFINER Functions
Functions marked with `SECURITY DEFINER` run with elevated privileges:

1. **is_admin()** - Bypasses RLS for role checking
2. **submit_rsvp()** - Handles user creation and RSVP upsert
3. **guestbook_insert_message()** - Secure message insertion
4. **update_user_profile()** - Profile management
5. **manage_vignette()** - Admin-only content management

### Function Security Best Practices
- ✅ Use SECURITY DEFINER only when necessary
- ✅ Validate all input parameters
- ✅ Use proper error handling
- ✅ Log security-sensitive operations
- ✅ Return meaningful error messages

## Authentication Integration

### Supabase Auth Integration
```sql
-- Get current user ID
auth.uid()

-- Get current user email
auth.email()

-- Check if user is authenticated
auth.uid() IS NOT NULL
```

### User Profile Creation
```sql
-- Automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

## Security Monitoring

### Audit Logging
Key security events are logged:
- Admin role assignments
- User profile updates
- Content moderation actions
- System function executions

### Security Alerts
- Failed authentication attempts
- Unauthorized access attempts
- Suspicious activity patterns
- System function errors

## Compliance & Privacy

### Data Protection
- ✅ User data isolation through RLS
- ✅ Admin access logging
- ✅ Secure data deletion (CASCADE)
- ✅ Input validation and sanitization

### Privacy Controls
- ✅ Anonymous posting options
- ✅ User data export capabilities
- ✅ Account deletion with data cleanup
- ✅ Content moderation tools

## Security Maintenance

### Regular Security Tasks
1. **Review RLS policies** - Ensure proper access controls
2. **Audit admin users** - Verify admin role assignments
3. **Monitor failed logins** - Check for suspicious activity
4. **Update security functions** - Keep security logic current
5. **Test access controls** - Verify policy effectiveness

### Security Incident Response
1. **Identify the issue** - Determine scope and impact
2. **Contain the threat** - Revoke access if necessary
3. **Investigate** - Review logs and affected data
4. **Remediate** - Fix security gaps
5. **Document** - Record incident and response
6. **Prevent** - Update policies to prevent recurrence