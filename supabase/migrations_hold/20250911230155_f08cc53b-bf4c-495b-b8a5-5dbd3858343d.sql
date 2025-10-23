-- ================================================================
-- PHASE 3: RPC FUNCTIONS & STORAGE POLICIES
-- ================================================================

-- ================================================================
-- 1. ENHANCED RSVP FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.upsert_rsvp(
  p_attending BOOLEAN,
  p_guests INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT NULL,
  p_costume_idea TEXT DEFAULT NULL,
  p_dietary_restrictions TEXT DEFAULT NULL,
  p_contributions TEXT DEFAULT NULL
) RETURNS public.rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.rsvps;
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to RSVP';
  END IF;

  -- Validate guest count
  IF p_guests < 1 OR p_guests > 10 THEN
    RAISE EXCEPTION 'Guest count must be between 1 and 10';
  END IF;

  -- Insert or update RSVP
  INSERT INTO public.rsvps (
    user_id, 
    num_guests, 
    costume_idea, 
    dietary_restrictions, 
    contributions, 
    status,
    updated_at
  )
  VALUES (
    v_user_id, 
    p_guests, 
    p_costume_idea, 
    p_dietary_restrictions, 
    p_contributions, 
    CASE WHEN p_attending THEN 'confirmed' ELSE 'cancelled' END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET num_guests = EXCLUDED.num_guests,
        costume_idea = EXCLUDED.costume_idea,
        dietary_restrictions = EXCLUDED.dietary_restrictions,
        contributions = EXCLUDED.contributions,
        status = EXCLUDED.status,
        updated_at = now()
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_rsvp TO authenticated;

-- ================================================================
-- 2. HUNT PROGRESS FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.mark_hint_found(
  p_hint_id BIGINT,
  p_hunt_run_id UUID DEFAULT NULL
) RETURNS public.hunt_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_run_id UUID;
  v_hint_points INTEGER;
  v_row public.hunt_progress;
  v_total_hints INTEGER;
  v_found_hints INTEGER;
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to mark hints found';
  END IF;

  -- Validate hint exists and is active
  SELECT points INTO v_hint_points 
  FROM public.hunt_hints 
  WHERE id = p_hint_id AND is_active = true;

  IF v_hint_points IS NULL THEN
    RAISE EXCEPTION 'Hint not found or inactive';
  END IF;

  -- Get or create active hunt run
  IF p_hunt_run_id IS NULL THEN
    SELECT id INTO v_run_id 
    FROM public.hunt_runs 
    WHERE user_id = v_user_id AND status = 'active'
    ORDER BY started_at DESC LIMIT 1;
    
    -- Create new hunt run if none exists
    IF v_run_id IS NULL THEN
      INSERT INTO public.hunt_runs (user_id, status) 
      VALUES (v_user_id, 'active') 
      RETURNING id INTO v_run_id;
    END IF;
  ELSE
    v_run_id := p_hunt_run_id;
    
    -- Verify user owns this hunt run
    IF NOT EXISTS(
      SELECT 1 FROM public.hunt_runs 
      WHERE id = v_run_id AND user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'Hunt run not found or access denied';
    END IF;
  END IF;

  -- Insert progress record (idempotent)
  INSERT INTO public.hunt_progress (user_id, hunt_run_id, hint_id, points_earned)
  VALUES (v_user_id, v_run_id, p_hint_id, v_hint_points)
  ON CONFLICT (hunt_run_id, hint_id) DO NOTHING
  RETURNING * INTO v_row;

  -- If this was a new record, update hunt run totals
  IF v_row.id IS NOT NULL THEN
    -- Update total points for the hunt run
    UPDATE public.hunt_runs 
    SET total_points = (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM public.hunt_progress 
      WHERE hunt_run_id = v_run_id
    )
    WHERE id = v_run_id;

    -- Check if hunt is completed
    SELECT COUNT(*) INTO v_total_hints FROM public.hunt_hints WHERE is_active = true;
    SELECT COUNT(*) INTO v_found_hints FROM public.hunt_progress WHERE hunt_run_id = v_run_id;

    -- Mark hunt as completed if all hints found
    IF v_found_hints >= v_total_hints THEN
      UPDATE public.hunt_runs 
      SET status = 'completed', completed_at = now()
      WHERE id = v_run_id;

      -- Award completion rewards
      INSERT INTO public.hunt_rewards (user_id, hunt_run_id, reward_type, reward_name, description)
      VALUES (
        v_user_id, 
        v_run_id, 
        'trophy', 
        'Hunt Master', 
        'Completed the entire scavenger hunt!'
      );
    END IF;
  END IF;

  RETURN v_row;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mark_hint_found TO authenticated;

-- ================================================================
-- 3. TOURNAMENT REGISTRATION FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.register_team(
  p_tournament_name TEXT,
  p_team_name TEXT,
  p_contact_info TEXT DEFAULT NULL,
  p_special_requirements TEXT DEFAULT NULL
) RETURNS public.tournament_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.tournament_registrations;
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to register for tournaments';
  END IF;

  -- Validate inputs
  IF LENGTH(TRIM(p_tournament_name)) < 2 THEN
    RAISE EXCEPTION 'Tournament name must be at least 2 characters';
  END IF;

  IF LENGTH(TRIM(p_team_name)) < 2 THEN
    RAISE EXCEPTION 'Team name must be at least 2 characters';
  END IF;

  -- Insert tournament registration
  INSERT INTO public.tournament_registrations (
    user_id, 
    tournament_name, 
    team_name, 
    contact_info, 
    special_requirements,
    status
  )
  VALUES (
    v_user_id, 
    TRIM(p_tournament_name), 
    TRIM(p_team_name), 
    p_contact_info, 
    p_special_requirements,
    'pending'
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.register_team TO authenticated;

-- ================================================================
-- 4. PHOTO UPLOAD FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.upload_photo(
  p_storage_path TEXT,
  p_filename TEXT,
  p_caption TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_category TEXT DEFAULT 'general'
) RETURNS public.photos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.photos;
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to upload photos';
  END IF;

  -- Validate category
  IF p_category NOT IN ('costumes', 'food', 'activities', 'general') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: costumes, food, activities, general';
  END IF;

  -- Insert photo metadata
  INSERT INTO public.photos (
    user_id,
    storage_path,
    filename,
    caption,
    tags,
    category,
    is_approved,
    created_at
  )
  VALUES (
    v_user_id,
    p_storage_path,
    p_filename,
    p_caption,
    p_tags,
    p_category,
    false, -- Requires admin approval
    now()
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upload_photo TO authenticated;

-- ================================================================
-- 5. PHOTO REACTION FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.toggle_photo_reaction(
  p_photo_id UUID,
  p_reaction_type TEXT DEFAULT 'like'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
  v_added BOOLEAN := false;
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to react to photos';
  END IF;

  -- Validate reaction type
  IF p_reaction_type NOT IN ('like', 'love', 'laugh', 'wow') THEN
    RAISE EXCEPTION 'Invalid reaction type. Must be one of: like, love, laugh, wow';
  END IF;

  -- Check if photo exists and is approved
  IF NOT EXISTS(
    SELECT 1 FROM public.photos 
    WHERE id = p_photo_id AND is_approved = true
  ) THEN
    RAISE EXCEPTION 'Photo not found or not approved';
  END IF;

  -- Check if reaction already exists
  SELECT true INTO v_exists
  FROM public.photo_reactions
  WHERE photo_id = p_photo_id 
    AND user_id = v_user_id 
    AND reaction_type = p_reaction_type;

  IF v_exists THEN
    -- Remove existing reaction
    DELETE FROM public.photo_reactions
    WHERE photo_id = p_photo_id 
      AND user_id = v_user_id 
      AND reaction_type = p_reaction_type;
    
    v_added := false;
  ELSE
    -- Add new reaction
    INSERT INTO public.photo_reactions (photo_id, user_id, reaction_type)
    VALUES (p_photo_id, v_user_id, p_reaction_type);
    
    v_added := true;
  END IF;

  -- Update photo likes count (for 'like' reactions only)
  IF p_reaction_type = 'like' THEN
    UPDATE public.photos 
    SET likes_count = (
      SELECT COUNT(*) 
      FROM public.photo_reactions 
      WHERE photo_id = p_photo_id AND reaction_type = 'like'
    )
    WHERE id = p_photo_id;
  END IF;

  RETURN v_added;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.toggle_photo_reaction TO authenticated;

-- ================================================================
-- 6. ADMIN FUNCTIONS
-- ================================================================

-- Function to approve/reject photos
CREATE OR REPLACE FUNCTION public.moderate_photo(
  p_photo_id UUID,
  p_approve BOOLEAN,
  p_featured BOOLEAN DEFAULT false
) RETURNS public.photos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.photos;
BEGIN
  -- Admin check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Update photo approval status
  UPDATE public.photos
  SET is_approved = p_approve,
      is_featured = CASE WHEN p_approve THEN p_featured ELSE false END,
      updated_at = now()
  WHERE id = p_photo_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Photo not found';
  END IF;

  RETURN v_row;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.moderate_photo TO authenticated;

-- Function to get user hunt statistics
CREATE OR REPLACE FUNCTION public.get_hunt_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_hints INTEGER,
  found_hints INTEGER,
  completion_percentage DECIMAL,
  total_points INTEGER,
  hunt_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  -- Authentication and authorization check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF v_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Can only view own stats unless admin.';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.hunt_hints WHERE is_active = true) as total_hints,
    COALESCE(found.found_count, 0)::INTEGER as found_hints,
    ROUND(
      COALESCE(found.found_count, 0)::DECIMAL / 
      NULLIF((SELECT COUNT(*) FROM public.hunt_hints WHERE is_active = true), 0) * 100, 
      2
    ) as completion_percentage,
    COALESCE(runs.total_points, 0)::INTEGER as total_points,
    COALESCE(runs.status, 'not_started')::TEXT as hunt_status
  FROM (
    SELECT 1 -- Dummy row to ensure we get results
  ) dummy
  LEFT JOIN (
    SELECT COUNT(*) as found_count
    FROM public.hunt_progress hp
    JOIN public.hunt_runs hr ON hp.hunt_run_id = hr.id
    WHERE hr.user_id = v_user_id AND hr.status = 'active'
  ) found ON true
  LEFT JOIN (
    SELECT total_points, status
    FROM public.hunt_runs
    WHERE user_id = v_user_id AND status = 'active'
    ORDER BY started_at DESC
    LIMIT 1
  ) runs ON true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_hunt_stats TO authenticated;

-- ================================================================
-- 7. STORAGE BUCKET POLICIES (Update existing gallery bucket)
-- ================================================================

-- Update gallery bucket policies for enhanced security
DROP POLICY IF EXISTS "storage_gallery_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_gallery_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_gallery_update_owner_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "storage_gallery_delete_owner_or_admin" ON storage.objects;

-- Public read for gallery objects
CREATE POLICY "gallery_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery');

-- Authenticated users can upload to their own folder
CREATE POLICY "gallery_user_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files, admins can update any
CREATE POLICY "gallery_update_own_or_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- Users can delete their own files, admins can delete any
CREATE POLICY "gallery_delete_own_or_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);