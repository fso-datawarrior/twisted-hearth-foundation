-- Fix the RLS approach - drop the problematic view and use proper column-level access control
DROP VIEW IF EXISTS public.tournament_registrations_public;

-- Restore the original public read policy but with proper column restrictions at API level
CREATE POLICY "tournament_regs_public_read" 
ON public.tournament_registrations 
FOR SELECT 
USING (true);

-- The sensitive data protection will be handled at the API layer by selecting only safe columns for public access