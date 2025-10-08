-- Fix RSVP admin access by creating proper RLS policies
-- This migration allows admins to view and manage all RSVPs

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can insert own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;

-- Allow users to view their own RSVPs
CREATE POLICY "Users can view own RSVPs"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to create their own RSVPs
CREATE POLICY "Users can insert own RSVPs"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own RSVPs
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

-- Allow admins to update any RSVP
CREATE POLICY "Admins can update all RSVPs"
  ON public.rsvps FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert RSVPs on behalf of users
CREATE POLICY "Admins can insert RSVPs"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Log the changes
DO $$
BEGIN
  RAISE LOG 'RSVP admin access policies created: admins can now view and manage all RSVPs';
END $$;
