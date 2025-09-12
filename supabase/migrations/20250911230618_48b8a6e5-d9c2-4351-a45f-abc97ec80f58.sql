-- ================================================================
-- PHASE 4: INITIAL DATA SETUP & ADMIN ASSIGNMENT
-- ================================================================

-- Insert your user as admin (replace with your email)
-- NOTE: This will only work if you've already signed up through the app
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT auth.users.id, 'admin', now()
FROM auth.users 
WHERE auth.users.email = 'admin@twistedhearth.com'  -- Replace with your email
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample hunt hints for testing
INSERT INTO public.hunt_hints (title, description, hint_text, difficulty_level, category, points, is_active) VALUES
('Hidden Crown', 'A faint crown lurks in the shadows', 'Look for the royal mark hidden in the dark corners', 'easy', 'visual', 1, true),
('Moonlight Secret', 'Something stirs beneath the moon', 'The lunar glow reveals hidden truths', 'easy', 'visual', 1, true), 
('Phantom Footsteps', 'Footsteps that don''t belong', 'Follow the path that shouldn''t exist', 'medium', 'location', 2, true),
('Whispering Voice', 'A whisper urging you forward', 'Listen for the voice that calls your name', 'medium', 'text', 2, true),
('Gleaming Knives', 'Knives gleam where spoons should lie', 'In the place of comfort, danger waits', 'hard', 'riddle', 3, true),
('Coin''s Tale', 'Coins seldom tell a clean story', 'Currency carries more than value', 'hard', 'text', 3, true),
('Glass Memory', 'Glass remembers every breath', 'Reflections hold secrets of the past', 'medium', 'visual', 2, true),
('Story Roots', 'Stories have roots in forgotten places', 'Every tale begins somewhere ancient', 'medium', 'riddle', 2, true),
('Mask Within Mask', 'Hidden identities beneath identities', 'What you wear may wear you in return', 'easy', 'visual', 1, true),
('Stitched Secrets', 'Seams that hold more than fabric', 'The threads tell tales of their weaving', 'hard', 'text', 3, true),
('Sharp Flavor', 'Taste that cuts deeper than expected', 'Some dishes serve more than hunger', 'medium', 'riddle', 2, true),
('Diced Confession', 'Truth chopped and served', 'Ingredients of honesty, prepared raw', 'hard', 'location', 3, true),
('Dark Promise', 'Time keeps darker promises than light', 'The clock counts more than hours', 'medium', 'text', 2, true),
('Bleeding Ink', 'Words that won''t dry completely', 'Some signatures remain forever wet', 'easy', 'visual', 1, true),
('Final Secret', 'The ultimate truth hidden in plain sight', 'What everyone sees but no one notices', 'hard', 'riddle', 5, true)
ON CONFLICT DO NOTHING;

-- Insert sample vignettes for content management
INSERT INTO public.vignettes (title, content, author, event_year, is_featured, is_published) VALUES
('The Tale of Goldilocks'' Revenge', 
'Once upon a time, in a cottage deep in the woods, three bears discovered something far worse than porridge theft. Goldilocks had returned, and this time, she brought friends...

The morning sun cast long shadows through the forest as Papa Bear examined the shattered remains of their front door. Mama Bear clutched Baby Bear close, her usually gentle demeanor replaced by fierce protectiveness.

"She''s not the same little girl," Papa Bear growled, his voice rumbling like distant thunder. "Something changed her during those years away."

Through the trees, they could hear it - laughter. But not the innocent giggle of a child. This was something darker, more knowing. The kind of laughter that promised that fairytales don''t always have happy endings.

And in the distance, barely visible through the morning mist, stood a figure in a familiar blue dress. But her golden hair now bore streaks of silver, and her eyes... her eyes held secrets that would make even the Big Bad Wolf think twice.

The bears had learned to lock their doors. But some things can''t be kept out forever.',
'Unknown Chronicler', 2024, true, true),

('Jack''s Final Climb',
'The beanstalk had grown again, reaching toward clouds that seemed darker than Jack remembered. At forty-three, with calloused hands and a family to feed, Jack found himself at the base of the magical plant, wrestling with a choice he thought he''d left in childhood.

The giant''s gold had run out years ago. The golden eggs had stopped coming. And the harp... well, the harp sang different songs now. Melancholy melodies that spoke of revenge and justice delayed but not denied.

"You can''t go back up there," his wife pleaded, clutching their infant son. "We''ll find another way."

But Jack knew better. He''d heard the rumors in the village - other climbers, other deals made in desperation. The giant wasn''t gone. He was waiting, patient as mountains, for those brave or foolish enough to return.

As Jack began his climb, each leaf and vine feeling familiar yet foreign under his weathered hands, he wondered if this time he''d be the one looking down from the clouds.

The beanstalk swayed in a wind that seemed to whisper his name.',
'Village Storyteller', 2023, false, true),

('Snow White''s Mirror Truth',
'The mirror never lied. That was the problem.

Years after the huntsman''s betrayal, after the dwarfs'' protection, after the prince''s kiss, Snow White stood before the same enchanted glass that had started it all. But this time, she was the one asking the questions.

"Mirror, mirror on the wall," she began, her voice steady despite the tremor in her hands, "who''s the fairest of them all?"

The mirror''s surface rippled like disturbed water before the familiar face appeared - no longer her stepmother''s reflection, but something else entirely. Something that smiled with too many teeth.

"You are, my dear. You always were. But beauty... beauty is such a temporary thing."

Snow White touched her face - still smooth, still young, still the fairest in the land. But she understood now what her stepmother had truly feared. It wasn''t age or fading beauty.

It was the mirror itself. And what it demanded in return for its honesty.

The apple had been just the beginning.',
'Royal Chronicler', 2024, true, true)
ON CONFLICT DO NOTHING;