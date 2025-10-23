-- Add soft delete and preview category support to photos table
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add constraint for preview_category values
ALTER TABLE public.photos 
ADD CONSTRAINT valid_preview_category 
CHECK (preview_category IS NULL OR preview_category IN ('vignettes', 'activities', 'costumes', 'thumbnails'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_preview ON public.photos(is_preview, preview_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_photos_deleted ON public.photos(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON public.photos(sort_order, created_at);

-- Soft delete function (admin only)
CREATE OR REPLACE FUNCTION public.soft_delete_photo(p_photo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete photos';
  END IF;
  
  UPDATE public.photos
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo soft deleted: % by user: %', p_photo_id, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.soft_delete_photo TO authenticated;

-- Restore function (admin only)
CREATE OR REPLACE FUNCTION public.restore_photo(p_photo_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can restore photos';
  END IF;
  
  UPDATE public.photos
  SET deleted_at = NULL,
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo restored: % by user: %', p_photo_id, auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_photo TO authenticated;

-- Enhanced moderate_photo with category management
CREATE OR REPLACE FUNCTION public.moderate_photo(
  p_photo_id UUID,
  p_approved BOOLEAN,
  p_featured BOOLEAN DEFAULT false,
  p_is_preview BOOLEAN DEFAULT NULL,
  p_preview_category TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL
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
      updated_at = now()
  WHERE id = p_photo_id;
  
  RAISE LOG 'Photo moderated: % approved: % featured: % by user: %', 
    p_photo_id, p_approved, p_featured, auth.uid();
END;
$$;

-- Update RLS policies to handle soft deletes
DROP POLICY IF EXISTS "Anyone can view approved photos" ON public.photos;

CREATE POLICY "Anyone can view approved non-deleted photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND 
    (is_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins can view deleted photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NOT NULL AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Admin can soft delete any photo
CREATE POLICY "Admins can soft delete photos"
  ON public.photos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
