-- Allow users to delete their own photos (and admins)
CREATE POLICY "Users can delete own photos"
ON public.photos
FOR DELETE
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));