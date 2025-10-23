-- Update the three existing signature libations with correct information

-- Update Poisoned Apple (was Mad Hatter's Punch)
UPDATE public.signature_libations
SET 
  name = 'Poisoned Apple',
  description = 'A bubbling brew of spiced apple cider, steeped with cinnamon, clove, and citrus, beckons like a potion from a haunted orchard. One sip warms the soul and whispers secrets of autumn''s darkest magic.',
  ingredients = ARRAY['apple juice', 'cloves', 'nutmeg', 'allspice', 'candied ginger', 'orange peel', 'cinnamon', 'the liquor of your choice'],
  libation_type = 'cocktail',
  image_url = '🍎',
  updated_at = now()
WHERE name = 'The Mad Hatter''s Punch';

-- Update Blood Wine of the Beast (was Cheshire Cat Grin)
UPDATE public.signature_libations
SET 
  name = 'Blood Wine of the Beast',
  description = 'Deep red wine blend with flavors of blackberry and orange. <em>The Beast''s curse runs deep - each sip brings you closer to the transformation.</em>',
  ingredients = ARRAY['red wine blend', 'cabernet', 'orange slices', 'blackberry', 'cinnamon'],
  libation_type = 'cocktail',
  image_url = '🍷',
  updated_at = now()
WHERE name = 'Cheshire Cat Grin';

-- Update The Enchanted Bramble (was Queen of Hearts Royale)
UPDATE public.signature_libations
SET 
  name = 'The Enchanted Bramble',
  description = '— a dark, enchanting brew kissed with forest berries and a whisper of cinnamon, as if plucked from a midnight spell in a forgotten glade.',
  ingredients = ARRAY['blueberry juice', 'agave syrup', 'lemon juice', 'blueberries', 'blackberries', 'cinnamon', 'the liquor of your choice'],
  libation_type = 'cocktail',
  image_url = '🫐',
  updated_at = now()
WHERE name = 'Queen of Hearts Royale';