-- Create past_vignettes table
CREATE TABLE IF NOT EXISTS public.past_vignettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 1000),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  theme_tag TEXT NOT NULL CHECK (length(trim(theme_tag)) > 0 AND length(theme_tag) <= 20),
  photo_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add updated_at trigger
CREATE TRIGGER update_past_vignettes_updated_at
  BEFORE UPDATE ON public.past_vignettes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for active vignettes query
CREATE INDEX idx_past_vignettes_active_sort 
  ON public.past_vignettes(is_active, sort_order, created_at DESC)
  WHERE is_active = true;

-- Add is_vignette_selected column to photos table
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS is_vignette_selected BOOLEAN DEFAULT false;

-- Add index for vignette-selected photos
CREATE INDEX IF NOT EXISTS idx_photos_vignette_selected 
  ON public.photos(is_vignette_selected, is_approved)
  WHERE is_vignette_selected = true AND is_approved = true;

-- Enable RLS on past_vignettes
ALTER TABLE public.past_vignettes ENABLE ROW LEVEL SECURITY;

-- RLS policies for past_vignettes
CREATE POLICY "Anyone can view active vignettes"
  ON public.past_vignettes
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert vignettes"
  ON public.past_vignettes
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vignettes"
  ON public.past_vignettes
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vignettes"
  ON public.past_vignettes
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create manage_vignette RPC function
CREATE OR REPLACE FUNCTION public.manage_vignette(
  p_action TEXT,
  p_vignette_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_theme_tag TEXT DEFAULT NULL,
  p_photo_ids UUID[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true,
  p_sort_order INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_vignette_id UUID;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can manage vignettes';
  END IF;

  CASE p_action
    WHEN 'create' THEN
      IF p_title IS NULL OR p_description IS NULL OR p_year IS NULL OR p_theme_tag IS NULL THEN
        RAISE EXCEPTION 'Title, description, year, and theme_tag are required';
      END IF;

      INSERT INTO public.past_vignettes (
        title, description, year, theme_tag, photo_ids, is_active, sort_order, created_by
      )
      VALUES (
        p_title, p_description, p_year, p_theme_tag, 
        COALESCE(p_photo_ids, '{}'), p_is_active, p_sort_order, auth.uid()
      )
      RETURNING id INTO v_vignette_id;

      v_result := jsonb_build_object('id', v_vignette_id, 'action', 'created');

    WHEN 'update' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for update';
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
        updated_by = auth.uid(),
        updated_at = now()
      WHERE id = p_vignette_id;

      v_result := jsonb_build_object('id', p_vignette_id, 'action', 'updated');

    WHEN 'delete' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for delete';
      END IF;

      DELETE FROM public.past_vignettes
      WHERE id = p_vignette_id;

      v_result := jsonb_build_object('id', p_vignette_id, 'action', 'deleted');

    WHEN 'reorder' THEN
      IF p_vignette_id IS NULL OR p_sort_order IS NULL THEN
        RAISE EXCEPTION 'Vignette ID and sort_order are required for reorder';
      END IF;

      UPDATE public.past_vignettes
      SET 
        sort_order = p_sort_order,
        updated_by = auth.uid(),
        updated_at = now()
      WHERE id = p_vignette_id;

      v_result := jsonb_build_object('id', p_vignette_id, 'action', 'reordered');

    ELSE
      RAISE EXCEPTION 'Invalid action: %. Valid actions are: create, update, delete, reorder', p_action;
  END CASE;

  RETURN v_result;
END;
$$;

-- Create get_active_vignettes RPC function
CREATE OR REPLACE FUNCTION public.get_active_vignettes()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  year INTEGER,
  theme_tag TEXT,
  photo_ids UUID[],
  is_active BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  updated_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.year,
    v.theme_tag,
    v.photo_ids,
    v.is_active,
    v.sort_order,
    v.created_at,
    v.updated_at,
    v.created_by,
    v.updated_by
  FROM public.past_vignettes v
  WHERE v.is_active = true
  ORDER BY v.sort_order ASC, v.created_at DESC
  LIMIT 3;
END;
$$;

-- Create toggle_vignette_selection RPC function
CREATE OR REPLACE FUNCTION public.toggle_vignette_selection(
  p_photo_id UUID,
  p_selected BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can manage vignette selections';
  END IF;

  UPDATE public.photos
  SET is_vignette_selected = p_selected
  WHERE id = p_photo_id AND is_approved = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Photo not found or not approved';
  END IF;

  v_result := jsonb_build_object(
    'photo_id', p_photo_id, 
    'is_vignette_selected', p_selected,
    'action', CASE WHEN p_selected THEN 'selected' ELSE 'deselected' END
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.past_vignettes TO authenticated;
GRANT ALL ON public.past_vignettes TO service_role;

-- Add comments
COMMENT ON TABLE public.past_vignettes IS 'Stores curated photo vignettes from past events. Max 3 active vignettes displayed at a time.';
COMMENT ON COLUMN public.photos.is_vignette_selected IS 'Indicates if this photo is selected for vignette display';
COMMENT ON FUNCTION public.manage_vignette IS 'Admin-only function to create, update, delete, or reorder vignettes';
COMMENT ON FUNCTION public.get_active_vignettes IS 'Returns up to 3 active vignettes for public display';
COMMENT ON FUNCTION public.toggle_vignette_selection IS 'Admin-only function to toggle vignette selection status for approved photos';