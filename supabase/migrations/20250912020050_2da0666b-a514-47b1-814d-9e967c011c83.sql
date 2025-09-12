-- Insert test data for photos table
INSERT INTO public.photos (user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, created_at)
VALUES 
  -- Sample approved photos
  (auth.uid(), 'test/sample-costume-1.jpg', 'sample-costume-1.jpg', 'Amazing Cinderella costume from last year!', ARRAY['costumes', 'fairy-tale', 'blue'], 'costumes', true, true, now() - interval '2 days'),
  (auth.uid(), 'test/sample-food-1.jpg', 'sample-food-1.jpg', 'Delicious twisted fairy tale themed cupcakes', ARRAY['food', 'desserts', 'themed'], 'food', true, false, now() - interval '1 day'),
  (auth.uid(), 'test/sample-activity-1.jpg', 'sample-activity-1.jpg', 'Beer pong tournament in full swing!', ARRAY['tournament', 'games', 'competition'], 'activities', true, false, now() - interval '3 hours'),
  
  -- Sample pending approval photos
  (auth.uid(), 'test/sample-costume-2.jpg', 'sample-costume-2.jpg', 'Little Red Riding Hood with a twist', ARRAY['costumes', 'creative', 'red'], 'costumes', false, false, now() - interval '1 hour'),
  (auth.uid(), 'test/sample-general-1.jpg', 'sample-general-1.jpg', 'Group photo from the haunted storytelling session', ARRAY['group', 'storytelling', 'memories'], 'general', false, false, now() - interval '30 minutes');

-- Insert test data for hunt progress
INSERT INTO public.hunt_runs (user_id, status, total_points, started_at, created_at)
VALUES 
  (auth.uid(), 'active', 75, now() - interval '2 hours', now() - interval '2 hours'),
  (auth.uid(), 'completed', 150, now() - interval '1 day', now() - interval '1 day');

-- Get the hunt run IDs for inserting progress records
WITH test_runs AS (
  SELECT id as run_id FROM public.hunt_runs WHERE user_id = auth.uid() LIMIT 2
),
test_hints AS (
  SELECT id as hint_id, points FROM public.hunt_hints WHERE is_active = true LIMIT 3
)
INSERT INTO public.hunt_progress (user_id, hunt_run_id, hint_id, points_earned, found_at, created_at)
SELECT 
  auth.uid(),
  (SELECT run_id FROM test_runs LIMIT 1),
  hint_id,
  points,
  now() - interval '1 hour',
  now() - interval '1 hour'
FROM test_hints;