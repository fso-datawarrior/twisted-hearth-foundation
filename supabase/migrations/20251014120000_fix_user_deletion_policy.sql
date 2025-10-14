-- Fix user deletion by adding missing RLS DELETE policy for profiles table
-- This allows admins to delete user profiles from the admin dashboard

-- Add DELETE policy for profiles table (admin only)
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add comment explaining the policy
COMMENT ON POLICY "Admins can delete profiles" ON public.profiles IS 
'Allows admin users to delete user profiles. This is required for the admin user management functionality.';
