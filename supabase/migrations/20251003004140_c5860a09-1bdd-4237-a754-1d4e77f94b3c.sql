-- Create submit_rsvp function with idempotency support
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_name TEXT,
  p_email TEXT,
  p_num_guests INTEGER,
  p_costume_idea TEXT DEFAULT NULL,
  p_dietary TEXT DEFAULT NULL,
  p_contributions TEXT DEFAULT NULL,
  p_idempotency TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rsvp_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  -- Check for existing RSVP with same idempotency key (within last 24 hours)
  IF p_idempotency IS NOT NULL THEN
    SELECT id INTO v_rsvp_id
    FROM public.rsvps
    WHERE user_id = v_user_id
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If found, return existing RSVP ID
    IF v_rsvp_id IS NOT NULL THEN
      RETURN v_rsvp_id;
    END IF;
  END IF;
  
  -- Insert new RSVP
  INSERT INTO public.rsvps (
    user_id,
    name,
    email,
    num_guests,
    dietary_restrictions,
    status
  )
  VALUES (
    v_user_id,
    p_name,
    p_email,
    p_num_guests,
    p_dietary,
    'pending'
  )
  RETURNING id INTO v_rsvp_id;
  
  RETURN v_rsvp_id;
END;
$$;