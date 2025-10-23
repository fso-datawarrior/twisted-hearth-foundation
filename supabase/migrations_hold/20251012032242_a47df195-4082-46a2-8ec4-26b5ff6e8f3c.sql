-- Normalize RLS audience for past_vignettes select policy
-- Ensures only authenticated users can read active vignettes

-- Drop existing ambiguous policy variants if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'past_vignettes' AND policyname = 'Anyone can view active vignettes'
  ) THEN
    DROP POLICY "Anyone can view active vignettes" ON public.past_vignettes;
  END IF;
END $$;

-- Recreate explicitly scoping audience to authenticated users
CREATE POLICY "Anyone can view active vignettes"
  ON public.past_vignettes
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin manage policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'past_vignettes' AND policyname = 'Admins can manage vignettes'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage vignettes" ON public.past_vignettes FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;