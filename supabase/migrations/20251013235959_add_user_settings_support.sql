-- ================================================================
-- USER SETTINGS IMPLEMENTATION - Database Migration
-- Adds avatar support, RPC functions, and storage bucket for user settings
-- ================================================================

-- 1. Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add updated trigger for profiles (if not exists)
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- 3. Create avatars bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152, -- 2MB limit for avatars
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 4. RLS policies for avatar uploads
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Function to update user profile securely
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist (fallback)
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    SELECT v_user_id, au.email, p_display_name, p_avatar_url
    FROM auth.users au WHERE au.id = v_user_id
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  END IF;

  RETURN QUERY SELECT true, 'Profile updated successfully'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- 6. Function to update user email
CREATE OR REPLACE FUNCTION public.update_user_email(
  p_new_email TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Email validation
  IF p_new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN QUERY SELECT false, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_new_email AND id != v_user_id) THEN
    RETURN QUERY SELECT false, 'Email already in use'::TEXT;
    RETURN;
  END IF;

  -- Update profile email
  UPDATE public.profiles 
  SET email = p_new_email, updated_at = now()
  WHERE id = v_user_id;

  RETURN QUERY SELECT true, 'Email updated successfully. Please verify your new email.'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_email TO authenticated;

-- 7. Update the handle_new_user function to include avatar_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
