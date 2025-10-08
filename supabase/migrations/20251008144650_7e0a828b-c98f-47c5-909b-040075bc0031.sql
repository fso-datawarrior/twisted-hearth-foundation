-- Create the gallery storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' 
  AND (storage.foldername(name))[1] = 'user-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to view their own uploads
CREATE POLICY "Users can view their own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gallery'
  AND (storage.foldername(name))[1] = 'user-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow admins to view all uploads
CREATE POLICY "Admins can view all uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gallery'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery'
  AND (storage.foldername(name))[1] = 'user-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery'
  AND (storage.foldername(name))[1] = 'user-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
);