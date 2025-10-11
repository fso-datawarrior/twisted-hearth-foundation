-- Create signature_libations table
CREATE TABLE IF NOT EXISTS public.signature_libations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  libation_type TEXT NOT NULL DEFAULT 'cocktail',
  image_url TEXT,
  serving_size TEXT,
  prep_notes TEXT,
  prep_time TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT valid_libation_type CHECK (libation_type IN ('cocktail', 'mocktail', 'punch', 'specialty'))
);

-- Enable RLS
ALTER TABLE public.signature_libations ENABLE ROW LEVEL SECURITY;

-- Public read policy for active libations
CREATE POLICY "Anyone can view active libations"
  ON public.signature_libations
  FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Admin full access policy
CREATE POLICY "Admins can manage all libations"
  ON public.signature_libations
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create index for ordering
CREATE INDEX idx_signature_libations_sort_order 
  ON public.signature_libations(sort_order, created_at);

-- Create index for type filtering
CREATE INDEX idx_signature_libations_type
  ON public.signature_libations(libation_type);

-- Create updated_at trigger
CREATE TRIGGER update_signature_libations_updated_at
  BEFORE UPDATE ON public.signature_libations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing hardcoded drinks
INSERT INTO public.signature_libations (name, description, ingredients, libation_type, image_url, is_active, sort_order)
VALUES 
  (
    'The Mad Hatter''s Punch',
    'A whimsical blend of citrus and berries with a touch of madness',
    ARRAY['Vodka', 'Mixed berries', 'Citrus juices', 'Sparkling wine', 'Fresh mint'],
    'punch',
    '🎩',
    true,
    0
  ),
  (
    'Cheshire Cat Grin',
    'A mysteriously delicious mocktail that appears and disappears on your palate',
    ARRAY['Butterfly pea flower tea', 'Lemon juice', 'Honey', 'Sparkling water', 'Lavender'],
    'mocktail',
    '😸',
    true,
    1
  ),
  (
    'Queen of Hearts Royale',
    'A bold, red cocktail fit for royalty - off with their heads if they don''t love it!',
    ARRAY['Gin', 'Pomegranate juice', 'Rose water', 'Champagne', 'Edible rose petals'],
    'cocktail',
    '👑',
    true,
    2
  );