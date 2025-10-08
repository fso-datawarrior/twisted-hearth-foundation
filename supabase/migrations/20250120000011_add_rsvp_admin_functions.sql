-- Add admin functions for RSVP management
-- This migration adds functions for check-in, notes, and payment management

-- Function to check in a guest (admin only)
CREATE OR REPLACE FUNCTION public.admin_checkin_guest(
  p_rsvp_id UUID,
  p_attended BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can check in guests';
  END IF;
  
  UPDATE public.rsvps
  SET attended = p_attended,
      checked_in_at = CASE WHEN p_attended THEN now() ELSE NULL END,
      checked_in_by = CASE WHEN p_attended THEN auth.uid() ELSE NULL END,
      updated_at = now()
  WHERE id = p_rsvp_id;
  
  RAISE LOG 'Guest check-in updated: % attended: % by admin: %', p_rsvp_id, p_attended, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_checkin_guest TO authenticated;

-- Function to update admin notes (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_rsvp_notes(
  p_rsvp_id UUID,
  p_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update RSVP notes';
  END IF;
  
  UPDATE public.rsvps
  SET rsvp_notes = p_notes,
      updated_at = now()
  WHERE id = p_rsvp_id;
  
  RAISE LOG 'RSVP notes updated: % by admin: %', p_rsvp_id, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_rsvp_notes TO authenticated;

-- Function to update payment status (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_payment_status(
  p_rsvp_id UUID,
  p_payment_status TEXT,
  p_payment_amount DECIMAL DEFAULT NULL,
  p_payment_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update payment status';
  END IF;
  
  IF p_payment_status NOT IN ('not_required', 'pending', 'paid', 'refunded', 'waived') THEN
    RAISE EXCEPTION 'Invalid payment status: %', p_payment_status;
  END IF;
  
  UPDATE public.rsvps
  SET payment_status = p_payment_status,
      payment_amount = COALESCE(p_payment_amount, payment_amount),
      payment_date = COALESCE(p_payment_date, payment_date),
      updated_at = now()
  WHERE id = p_rsvp_id;
  
  RAISE LOG 'Payment status updated: % status: % by admin: %', p_rsvp_id, p_payment_status, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_payment_status TO authenticated;

-- Function to bulk check-in guests (admin only)
CREATE OR REPLACE FUNCTION public.admin_bulk_checkin_guests(
  p_rsvp_ids UUID[],
  p_attended BOOLEAN DEFAULT true
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER := 0;
  rsvp_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can bulk check in guests';
  END IF;
  
  FOREACH rsvp_id IN ARRAY p_rsvp_ids
  LOOP
    UPDATE public.rsvps
    SET attended = p_attended,
        checked_in_at = CASE WHEN p_attended THEN now() ELSE NULL END,
        checked_in_by = CASE WHEN p_attended THEN auth.uid() ELSE NULL END,
        updated_at = now()
    WHERE id = rsvp_id;
    
    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RAISE LOG 'Bulk check-in completed: % guests updated by admin: %', updated_count, auth.uid();
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_bulk_checkin_guests TO authenticated;

-- Log the changes
DO $$
BEGIN
  RAISE LOG 'RSVP admin functions added: admin_checkin_guest, admin_update_rsvp_notes, admin_update_payment_status, admin_bulk_checkin_guests';
END $$;
