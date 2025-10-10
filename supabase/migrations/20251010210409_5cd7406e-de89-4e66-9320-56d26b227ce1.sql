-- Add columns for static image URLs to past_vignettes table
ALTER TABLE public.past_vignettes 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS teaser_url TEXT;

-- Seed the three existing home page vignettes
INSERT INTO public.past_vignettes (
  title, 
  description, 
  year, 
  theme_tag,
  thumbnail_url,
  teaser_url,
  is_active,
  sort_order
) VALUES
(
  'Goldilocks — The Butcher''s Den',
  'What if the cozy little cottage wasn''t a home at all… but a butcher''s den?',
  2024,
  'homepage-featured',
  '/img/goldilocks-teaser.jpg',
  '/img/goldilocks-teaser.jpg',
  true,
  1
),
(
  'Jack & the Beanstalk — A Thief''s Reward',
  'What if Jack wasn''t a hero at all, but a thief who finally got what he deserved?',
  2024,
  'homepage-featured',
  '/img/jack-teaser.jpg',
  '/img/jack-teaser.jpg',
  true,
  2
),
(
  'Snow White & the Goblin-Dwarves',
  'What if the seven dwarves had a curse of their own?',
  2024,
  'homepage-featured',
  '/img/snowwhite-teaser.jpg',
  '/img/snowwhite-teaser.jpg',
  true,
  3
)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_past_vignettes_theme_active 
ON public.past_vignettes(theme_tag, is_active, sort_order) 
WHERE is_active = true;

-- Create storage bucket for homepage vignette images
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage-vignettes', 'homepage-vignettes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Admins can upload homepage vignette images
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload homepage vignette images'
  ) THEN
    CREATE POLICY "Admins can upload homepage vignette images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'homepage-vignettes' AND
      has_role(auth.uid(), 'admin'::app_role)
    );
  END IF;
END $$;

-- RLS policy: Anyone can view homepage vignette images
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view homepage vignette images'
  ) THEN
    CREATE POLICY "Anyone can view homepage vignette images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'homepage-vignettes');
  END IF;
END $$;

-- RLS policy: Admins can delete homepage vignette images
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete homepage vignette images'
  ) THEN
    CREATE POLICY "Admins can delete homepage vignette images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'homepage-vignettes' AND
      has_role(auth.uid(), 'admin'::app_role)
    );
  END IF;
END $$;

-- RLS policy: Admins can update homepage vignette images
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update homepage vignette images'
  ) THEN
    CREATE POLICY "Admins can update homepage vignette images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'homepage-vignettes' AND
      has_role(auth.uid(), 'admin'::app_role)
    );
  END IF;
END $$;