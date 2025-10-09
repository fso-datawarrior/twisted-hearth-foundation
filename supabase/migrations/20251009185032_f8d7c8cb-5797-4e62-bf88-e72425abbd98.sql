-- Update RSVP select policy to restrict access to own RSVPs or admins only
DROP POLICY IF EXISTS "select_own_rsvp" ON public.rsvps;

CREATE POLICY "select_own_rsvp" ON public.rsvps
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());