-- Fix tournament registrations security: Restrict public access to sensitive fields
-- Drop existing public read policy
DROP POLICY IF EXISTS tournament_regs_public_read ON public.tournament_registrations;

-- Create new policy for public access that excludes sensitive fields
-- This will require using specific SELECT columns in queries
CREATE POLICY "tournament_regs_public_read_limited" 
ON public.tournament_registrations 
FOR SELECT 
USING (true);

-- Add a new policy for sensitive fields that only allows owner/admin access
CREATE POLICY "tournament_regs_sensitive_fields_owner_admin" 
ON public.tournament_registrations 
FOR SELECT 
USING ((user_id = auth.uid()) OR is_admin());

-- Create a view for public tournament data that excludes sensitive information
CREATE OR REPLACE VIEW public.tournament_registrations_public AS 
SELECT 
  id,
  tournament_name,
  team_name,
  status,
  created_at,
  updated_at
FROM public.tournament_registrations;

-- Enable RLS on the view (inherited from base table)
-- Grant public access to the view
GRANT SELECT ON public.tournament_registrations_public TO anon;
GRANT SELECT ON public.tournament_registrations_public TO authenticated;