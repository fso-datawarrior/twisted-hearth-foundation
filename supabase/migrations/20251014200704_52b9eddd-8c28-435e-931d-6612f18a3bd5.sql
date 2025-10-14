-- Phase 1: Add name fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Phase 2: Add name fields to rsvps table
ALTER TABLE public.rsvps
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Phase 3: Migrate existing RSVP names to first_name/last_name
UPDATE public.rsvps
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = NULLIF(TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1)), '')
WHERE first_name IS NULL AND name IS NOT NULL;

-- Phase 4: Clean up profile display_names that are just emails
UPDATE public.profiles
SET display_name = NULL
WHERE display_name = email;

-- Phase 5: Update the update_user_profile RPC function to handle new fields
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Update profile with proper NULL handling
  UPDATE public.profiles 
  SET 
    first_name = CASE 
      WHEN p_first_name IS NOT NULL THEN p_first_name
      ELSE first_name
    END,
    last_name = CASE 
      WHEN p_last_name IS NOT NULL THEN p_last_name
      ELSE last_name
    END,
    display_name = CASE 
      WHEN p_display_name IS NOT NULL THEN NULLIF(p_display_name, '')
      ELSE display_name
    END,
    avatar_url = CASE 
      WHEN p_avatar_url = '' THEN NULL
      WHEN p_avatar_url IS NOT NULL THEN p_avatar_url
      ELSE avatar_url
    END,
    updated_at = now()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, first_name, last_name, display_name, avatar_url)
    SELECT v_user_id, au.email, p_first_name, p_last_name, NULLIF(p_display_name, ''), NULLIF(p_avatar_url, '')
    FROM auth.users au WHERE au.id = v_user_id;
  END IF;

  RETURN QUERY SELECT true, 'Profile updated successfully'::TEXT;
END;
$$;

-- Phase 6: Create sync function to keep profiles and rsvps in sync
CREATE OR REPLACE FUNCTION public.sync_profile_to_rsvp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update RSVP when profile is updated
  UPDATE public.rsvps
  SET 
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    display_name = NEW.display_name,
    updated_at = now()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Phase 7: Create trigger to auto-sync profile changes to RSVP
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
  AFTER UPDATE OF first_name, last_name, display_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_rsvp();