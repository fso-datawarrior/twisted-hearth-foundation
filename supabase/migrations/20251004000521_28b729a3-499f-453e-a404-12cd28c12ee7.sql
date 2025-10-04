-- Add additional_guests column to rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN additional_guests JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.rsvps.additional_guests IS 'Array of additional guest objects with name (required) and email (optional) for guests beyond the primary two';