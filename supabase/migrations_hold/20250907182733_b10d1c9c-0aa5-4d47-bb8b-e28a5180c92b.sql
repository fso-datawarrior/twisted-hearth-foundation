-- Fix the search path for guestbook_insert_message function
CREATE OR REPLACE FUNCTION public.guestbook_insert_message(
  p_display_name TEXT,
  p_message TEXT,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS public.guestbook AS $$
DECLARE
  v_row public.guestbook;
BEGIN
  INSERT INTO public.guestbook (user_id, display_name, message, is_anonymous)
  VALUES (
    auth.uid(),
    COALESCE(NULLIF(TRIM(p_display_name), ''), SPLIT_PART(auth.email(), '@', 1)),
    TRIM(p_message),
    COALESCE(p_is_anonymous, false)
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the search path for update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;