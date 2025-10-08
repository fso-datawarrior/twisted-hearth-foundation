-- Fix potluck_items UPDATE policy to allow soft deletes
-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own potluck items" ON public.potluck_items;

-- Recreate UPDATE policy with explicit WITH CHECK
CREATE POLICY "Users can update own potluck items" 
ON public.potluck_items 
FOR UPDATE 
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));