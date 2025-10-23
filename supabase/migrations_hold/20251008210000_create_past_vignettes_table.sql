-- Create past_vignettes table for managing twisted vignette stories
CREATE TABLE IF NOT EXISTS public.past_vignettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  theme_tag TEXT NOT NULL CHECK (length(theme_tag) <= 20),
  photo_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.past_vignettes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_past_vignettes_active ON public.past_vignettes(is_active, sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_past_vignettes_year ON public.past_vignettes(year DESC);
CREATE INDEX IF NOT EXISTS idx_past_vignettes_sort_order ON public.past_vignettes(sort_order, created_at);

-- RLS Policies
CREATE POLICY "Anyone can view active vignettes"
  ON public.past_vignettes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all vignettes"
  ON public.past_vignettes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage vignettes"
  ON public.past_vignettes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to manage vignettes (admin only)
CREATE OR REPLACE FUNCTION public.manage_vignette(
  p_action TEXT,
  p_vignette_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_theme_tag TEXT DEFAULT NULL,
  p_photo_ids UUID[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vignette_id UUID;
  current_user_id UUID;
BEGIN
  -- Check admin permissions
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can manage vignettes';
  END IF;
  
  current_user_id := auth.uid();
  
  -- Validate action
  IF p_action NOT IN ('create', 'update', 'delete', 'reorder') THEN
    RAISE EXCEPTION 'Invalid action: %. Must be create, update, delete, or reorder', p_action;
  END IF;
  
  -- Validate theme_tag length
  IF p_theme_tag IS NOT NULL AND length(p_theme_tag) > 20 THEN
    RAISE EXCEPTION 'Theme tag must be 20 characters or less';
  END IF;
  
  -- Validate year range
  IF p_year IS NOT NULL AND (p_year < 1900 OR p_year > 2100) THEN
    RAISE EXCEPTION 'Year must be between 1900 and 2100';
  END IF;
  
  CASE p_action
    WHEN 'create' THEN
      -- Validate required fields for creation
      IF p_title IS NULL OR p_description IS NULL OR p_year IS NULL OR p_theme_tag IS NULL THEN
        RAISE EXCEPTION 'Title, description, year, and theme_tag are required for creating vignettes';
      END IF;
      
      INSERT INTO public.past_vignettes (
        title, description, year, theme_tag, photo_ids, is_active, sort_order, created_by, updated_by
      ) VALUES (
        p_title, p_description, p_year, p_theme_tag, 
        COALESCE(p_photo_ids, '{}'), COALESCE(p_is_active, true), 
        COALESCE(p_sort_order, 0), current_user_id, current_user_id
      ) RETURNING id INTO vignette_id;
      
      RAISE LOG 'Vignette created: % by user: %', vignette_id, current_user_id;
      
    WHEN 'update' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for updates';
      END IF;
      
      UPDATE public.past_vignettes
      SET 
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        year = COALESCE(p_year, year),
        theme_tag = COALESCE(p_theme_tag, theme_tag),
        photo_ids = COALESCE(p_photo_ids, photo_ids),
        is_active = COALESCE(p_is_active, is_active),
        sort_order = COALESCE(p_sort_order, sort_order),
        updated_by = current_user_id,
        updated_at = now()
      WHERE id = p_vignette_id
      RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
      
      RAISE LOG 'Vignette updated: % by user: %', vignette_id, current_user_id;
      
    WHEN 'delete' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for deletion';
      END IF;
      
      DELETE FROM public.past_vignettes WHERE id = p_vignette_id RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
      
      RAISE LOG 'Vignette deleted: % by user: %', vignette_id, current_user_id;
      
    WHEN 'reorder' THEN
      IF p_vignette_id IS NULL OR p_sort_order IS NULL THEN
        RAISE EXCEPTION 'Vignette ID and sort_order are required for reordering';
      END IF;
      
      UPDATE public.past_vignettes
      SET sort_order = p_sort_order, updated_by = current_user_id, updated_at = now()
      WHERE id = p_vignette_id
      RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
      
      RAISE LOG 'Vignette reordered: % to position % by user: %', vignette_id, p_sort_order, current_user_id;
  END CASE;
  
  RETURN vignette_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.manage_vignette TO authenticated;

-- Function to get active vignettes for public display
CREATE OR REPLACE FUNCTION public.get_active_vignettes()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  year INTEGER,
  theme_tag TEXT,
  photo_ids UUID[],
  sort_order INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id, v.title, v.description, v.year, v.theme_tag, 
    v.photo_ids, v.sort_order, v.created_at
  FROM public.past_vignettes v
  WHERE v.is_active = true
  ORDER BY v.sort_order ASC, v.created_at DESC
  LIMIT 3;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_vignettes TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.past_vignettes IS 'Stores past twisted vignette stories with associated photos';
COMMENT ON COLUMN public.past_vignettes.title IS 'Display title for the vignette story';
COMMENT ON COLUMN public.past_vignettes.description IS 'Detailed description/hook for the vignette';
COMMENT ON COLUMN public.past_vignettes.year IS '4-digit year when the vignette was performed';
COMMENT ON COLUMN public.past_vignettes.theme_tag IS 'Short theme tag (max 20 chars) like "Breaking & Entering"';
COMMENT ON COLUMN public.past_vignettes.photo_ids IS 'Array of photo UUIDs associated with this vignette';
COMMENT ON COLUMN public.past_vignettes.is_active IS 'Whether this vignette should be displayed publicly';
COMMENT ON COLUMN public.past_vignettes.sort_order IS 'Display order (lower numbers first)';
