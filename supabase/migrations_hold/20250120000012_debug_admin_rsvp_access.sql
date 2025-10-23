-- Debug and fix admin RSVP access issues
-- This migration ensures admin authentication and RLS policies work correctly

-- First, let's ensure the admin seeding function is working
SELECT public.ensure_admins_seeded();

-- Check if the current user has admin role
DO $$
DECLARE
  current_user_id UUID;
  is_admin_check BOOLEAN;
BEGIN
  -- Get current user ID
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RAISE LOG 'No authenticated user found';
  ELSE
    -- Check if user has admin role
    SELECT EXISTS(
      SELECT 1 FROM public.user_roles 
      WHERE user_id = current_user_id AND role = 'admin'::app_role
    ) INTO is_admin_check;
    
    RAISE LOG 'Current user ID: %, Is admin: %', current_user_id, is_admin_check;
  END IF;
END $$;

-- Ensure the check_admin_status function works correctly
CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN := false;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has admin role
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = current_user_id AND role = 'admin'::app_role
  ) INTO is_admin;
  
  RAISE LOG 'check_admin_status: user_id=%, is_admin=%', current_user_id, is_admin;
  
  RETURN is_admin;
END;
$$;

-- Ensure the has_role function works correctly
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_role_check BOOLEAN := false;
BEGIN
  -- Check if user has the specified role
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id AND user_roles.role = role_name
  ) INTO has_role_check;
  
  RAISE LOG 'has_role: user_id=%, role=%, result=%', user_id, role_name, has_role_check;
  
  RETURN has_role_check;
END;
$$;

-- Drop and recreate RLS policies to ensure they work
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can insert own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Admins can view all RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Admins can update all RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Admins can insert RSVPs" ON public.rsvps;

-- Recreate RLS policies with better debugging
CREATE POLICY "Users can view own RSVPs"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own RSVPs"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own RSVPs"
  ON public.rsvps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- CRITICAL: Allow admins to view ALL RSVPs
CREATE POLICY "Admins can view all RSVPs"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all RSVPs"
  ON public.rsvps FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert RSVPs"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Test the policies by checking if we can see RSVPs
DO $$
DECLARE
  rsvp_count INTEGER;
  current_user_id UUID;
  is_admin_check BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    -- Check admin status
    SELECT public.has_role(current_user_id, 'admin'::app_role) INTO is_admin_check;
    
    -- Try to count RSVPs
    SELECT COUNT(*) INTO rsvp_count FROM public.rsvps;
    
    RAISE LOG 'Debug RSVP access: user_id=%, is_admin=%, rsvp_count=%', 
      current_user_id, is_admin_check, rsvp_count;
  ELSE
    RAISE LOG 'No authenticated user for RSVP access test';
  END IF;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_admin_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- Log completion
DO $$
BEGIN
  RAISE LOG 'Admin RSVP access debug migration completed';
END $$;
