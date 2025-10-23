-- Fix RLS policies to allow anonymous analytics tracking
-- This prevents the 2-3 second timeout delays from failed inserts

-- Fix user_sessions RLS - allow system/anonymous inserts
DROP POLICY IF EXISTS "System can insert user_sessions" ON public.user_sessions;
CREATE POLICY "System can insert user_sessions" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (true);

-- Fix page_views RLS - allow system/anonymous inserts  
DROP POLICY IF EXISTS "System can insert page_views" ON public.page_views;
CREATE POLICY "System can insert page_views" 
  ON public.page_views 
  FOR INSERT 
  WITH CHECK (true);