-- Add missing release management functions
-- These functions are required for the release management system to work properly

-- ============================================================================
-- Function: get_release_full
-- Purpose: Get full release data with all related records (features, API changes, changes, notes)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_release_full(p_release_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_release JSONB;
  v_features JSONB;
  v_api_changes JSONB;
  v_changes JSONB;
  v_notes JSONB;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view full release details';
  END IF;

  -- Get release
  SELECT to_jsonb(sr.*) INTO v_release
  FROM system_releases sr
  WHERE sr.id = p_release_id;

  IF v_release IS NULL THEN
    RAISE EXCEPTION 'Release not found';
  END IF;

  -- Get features
  SELECT COALESCE(jsonb_agg(to_jsonb(rf.*) ORDER BY rf.sort_order), '[]'::jsonb)
  INTO v_features
  FROM release_features rf
  WHERE rf.release_id = p_release_id;

  -- Get API changes
  SELECT COALESCE(jsonb_agg(to_jsonb(rac.*) ORDER BY rac.sort_order), '[]'::jsonb)
  INTO v_api_changes
  FROM release_api_changes rac
  WHERE rac.release_id = p_release_id;

  -- Get changes
  SELECT COALESCE(jsonb_agg(to_jsonb(rc.*) ORDER BY rc.sort_order), '[]'::jsonb)
  INTO v_changes
  FROM release_changes rc
  WHERE rc.release_id = p_release_id;

  -- Get notes
  SELECT COALESCE(jsonb_agg(to_jsonb(rn.*)), '[]'::jsonb)
  INTO v_notes
  FROM release_notes rn
  WHERE rn.release_id = p_release_id;

  -- Return combined result
  RETURN jsonb_build_object(
    'release', v_release,
    'features', v_features,
    'api_changes', v_api_changes,
    'changes', v_changes,
    'notes', v_notes
  );
END;
$$;

-- ============================================================================
-- Function: archive_release
-- Purpose: Archive a release (admin only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.archive_release(p_release_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can archive releases';
  END IF;

  UPDATE system_releases
  SET 
    is_archived = TRUE,
    deployment_status = 'archived',
    updated_at = NOW()
  WHERE id = p_release_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release not found';
  END IF;
END;
$$;

-- ============================================================================
-- Function: publish_release
-- Purpose: Publish a release (admin only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.publish_release(p_release_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can publish releases';
  END IF;

  UPDATE system_releases
  SET 
    deployment_status = 'deployed',
    updated_at = NOW()
  WHERE id = p_release_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release not found';
  END IF;
END;
$$;

-- Grant execute permissions to authenticated users (admin check is in the function)
GRANT EXECUTE ON FUNCTION public.get_release_full(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_release(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_release(UUID) TO authenticated;