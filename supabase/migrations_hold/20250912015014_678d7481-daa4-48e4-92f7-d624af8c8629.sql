-- Create admin function to update RSVP status
CREATE OR REPLACE FUNCTION public.admin_update_rsvp_status(
  p_rsvp_id uuid,
  p_status text
)
RETURNS rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.rsvps;
BEGIN
  -- Admin check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Validate status
  IF p_status NOT IN ('confirmed', 'cancelled', 'pending') THEN
    RAISE EXCEPTION 'Invalid status. Must be confirmed, cancelled, or pending.';
  END IF;

  -- Update RSVP status
  UPDATE public.rsvps 
  SET status = p_status, updated_at = now()
  WHERE rsvp_id = p_rsvp_id
  RETURNING * INTO v_row;

  IF v_row.rsvp_id IS NULL THEN
    RAISE EXCEPTION 'RSVP not found';
  END IF;

  RETURN v_row;
END;
$$;