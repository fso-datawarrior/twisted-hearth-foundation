-- Fix RSVP admin connections by adding missing fields and fixing queries
-- This migration adds the missing fields that the admin dashboard expects

-- Add missing fields to rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS costume_idea TEXT,
ADD COLUMN IF NOT EXISTS contributions TEXT;

-- Create index for performance on new fields
CREATE INDEX IF NOT EXISTS idx_rsvps_costume ON public.rsvps(costume_idea) WHERE costume_idea IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rsvps_contributions ON public.rsvps(contributions) WHERE contributions IS NOT NULL;

-- Update the admin_update_rsvp_status function to use correct field name
CREATE OR REPLACE FUNCTION public.admin_update_rsvp_status(
  p_rsvp_id UUID,
  p_status TEXT,
  p_is_approved BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update RSVP status';
  END IF;
  
  UPDATE public.rsvps
  SET status = p_status,
      is_approved = COALESCE(p_is_approved, is_approved),
      updated_at = now()
  WHERE id = p_rsvp_id;  -- Use 'id' not 'rsvp_id'
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_update_rsvp_status TO authenticated;
