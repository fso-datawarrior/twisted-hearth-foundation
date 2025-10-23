-- Make gallery bucket public for approved photos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'gallery';

-- Add RLS policy for public read access to gallery
CREATE POLICY "Anyone can view gallery photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');