-- Add is_vignette_selected field to photos table
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS is_vignette_selected BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_photos_vignette_selected ON public.photos(is_vignette_selected) WHERE is_vignette_selected = true;

-- Update moderate_photo function to handle vignette selection
CREATE OR REPLACE FUNCTION public.moderate_photo(
  p_photo_id UUID,
  p_approved BOOLEAN,
  p_featured BOOLEAN DEFAULT false,
  p_is_preview BOOLEAN DEFAULT NULL,
  p_preview_category TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL,
  p_is_vignette_selected BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can moderate photos';
  END IF;
  
  -- Validate preview_category if provided
  IF p_preview_category IS NOT NULL AND 
     p_preview_category NOT IN ('vignettes', 'activities', 'costumes', 'thumbnails') THEN
    RAISE EXCEPTION 'Invalid preview category: %', p_preview_category;
  END IF;
  
  UPDATE public.photos
  SET is_approved = p_approved,
      is_featured = p_featured,
      is_preview = COALESCE(p_is_preview, is_preview),
      preview_category = COALESCE(p_preview_category, preview_category),
      sort_order = COALESCE(p_sort_order, sort_order),
      is_vignette_selected = COALESCE(p_is_vignette_selected, is_vignette_selected),
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo moderated: % approved: % featured: % vignette_selected: % by user: %', 
    p_photo_id, p_approved, p_featured, p_is_vignette_selected, auth.uid();
END;
$$;

-- Function to toggle vignette selection for approved photos
CREATE OR REPLACE FUNCTION public.toggle_vignette_selection(
  p_photo_id UUID,
  p_selected BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage vignette selections';
  END IF;
  
  -- Only allow vignette selection for approved photos
  IF NOT EXISTS (
    SELECT 1 FROM public.photos 
    WHERE id = p_photo_id AND is_approved = true
  ) THEN
    RAISE EXCEPTION 'Photo must be approved before it can be selected for vignettes';
  END IF;
  
  UPDATE public.photos
  SET is_vignette_selected = p_selected,
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo vignette selection toggled: % selected: % by user: %', 
    p_photo_id, p_selected, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_vignette_selection TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.photos.is_vignette_selected IS 'Whether this approved photo is selected for use in vignettes';
