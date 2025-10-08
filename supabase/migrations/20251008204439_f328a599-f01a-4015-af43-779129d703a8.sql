-- Add is_favorite column to photos table
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create photo_emoji_reactions table
CREATE TABLE IF NOT EXISTS public.photo_emoji_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id, emoji)
);

-- Enable RLS on photo_emoji_reactions
ALTER TABLE public.photo_emoji_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photo_emoji_reactions
CREATE POLICY "Anyone can view photo emoji reactions"
  ON public.photo_emoji_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own photo emoji reactions"
  ON public.photo_emoji_reactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photo_emoji_reactions_photo_id ON public.photo_emoji_reactions(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_emoji_reactions_user_id ON public.photo_emoji_reactions(user_id);