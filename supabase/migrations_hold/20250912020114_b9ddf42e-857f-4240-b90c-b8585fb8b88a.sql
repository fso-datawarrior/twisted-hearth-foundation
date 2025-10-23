-- Insert test data for photos table using existing user IDs
WITH existing_user AS (
  SELECT user_id FROM public.users LIMIT 1
)
INSERT INTO public.photos (user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, created_at)
SELECT 
  existing_user.user_id,
  storage_path,
  filename,
  caption,
  tags,
  category,
  is_approved,
  is_featured,
  created_at
FROM existing_user
CROSS JOIN (
  VALUES 
    ('test/sample-costume-1.jpg', 'sample-costume-1.jpg', 'Amazing Cinderella costume from last year!', ARRAY['costumes', 'fairy-tale', 'blue'], 'costumes', true, true, now() - interval '2 days'),
    ('test/sample-food-1.jpg', 'sample-food-1.jpg', 'Delicious twisted fairy tale themed cupcakes', ARRAY['food', 'desserts', 'themed'], 'food', true, false, now() - interval '1 day'),
    ('test/sample-activity-1.jpg', 'sample-activity-1.jpg', 'Beer pong tournament in full swing!', ARRAY['tournament', 'games', 'competition'], 'activities', true, false, now() - interval '3 hours'),
    ('test/sample-costume-2.jpg', 'sample-costume-2.jpg', 'Little Red Riding Hood with a twist', ARRAY['costumes', 'creative', 'red'], 'costumes', false, false, now() - interval '1 hour'),
    ('test/sample-general-1.jpg', 'sample-general-1.jpg', 'Group photo from the haunted storytelling session', ARRAY['group', 'storytelling', 'memories'], 'general', false, false, now() - interval '30 minutes')
) AS sample_data(storage_path, filename, caption, tags, category, is_approved, is_featured, created_at);

-- Insert test data for hunt progress using existing user IDs
WITH existing_user AS (
  SELECT user_id FROM public.users LIMIT 1
)
INSERT INTO public.hunt_runs (user_id, status, total_points, started_at, created_at)
SELECT 
  existing_user.user_id,
  'active',
  75,
  now() - interval '2 hours',
  now() - interval '2 hours'
FROM existing_user
UNION ALL
SELECT 
  existing_user.user_id,
  'completed',
  150,
  now() - interval '1 day',
  now() - interval '1 day'
FROM existing_user;