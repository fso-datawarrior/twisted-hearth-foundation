-- First create a test user record with proper UUID generation
INSERT INTO public.users (user_id, name, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Test Admin User',
  'testadmin@example.com',
  now(),
  now()
);

-- Get the created user ID and insert test data for photos
WITH test_user AS (
  SELECT user_id FROM public.users WHERE email = 'testadmin@example.com'
)
INSERT INTO public.photos (user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, created_at)
SELECT 
  test_user.user_id,
  storage_path,
  filename,
  caption,
  tags,
  category,
  is_approved,
  is_featured,
  created_at
FROM test_user
CROSS JOIN (
  VALUES 
    ('test/sample-costume-1.jpg', 'sample-costume-1.jpg', 'Amazing Cinderella costume from last year!', ARRAY['costumes', 'fairy-tale', 'blue'], 'costumes', true, true, now() - interval '2 days'),
    ('test/sample-food-1.jpg', 'sample-food-1.jpg', 'Delicious twisted fairy tale themed cupcakes', ARRAY['food', 'desserts', 'themed'], 'food', true, false, now() - interval '1 day'),
    ('test/sample-activity-1.jpg', 'sample-activity-1.jpg', 'Beer pong tournament in full swing!', ARRAY['tournament', 'games', 'competition'], 'activities', true, false, now() - interval '3 hours'),
    ('test/sample-costume-2.jpg', 'sample-costume-2.jpg', 'Little Red Riding Hood with a twist', ARRAY['costumes', 'creative', 'red'], 'costumes', false, false, now() - interval '1 hour'),
    ('test/sample-general-1.jpg', 'sample-general-1.jpg', 'Group photo from the haunted storytelling session', ARRAY['group', 'storytelling', 'memories'], 'general', false, false, now() - interval '30 minutes')
) AS sample_data(storage_path, filename, caption, tags, category, is_approved, is_featured, created_at);

-- Insert test data for hunt runs
WITH test_user AS (
  SELECT user_id FROM public.users WHERE email = 'testadmin@example.com'
)
INSERT INTO public.hunt_runs (user_id, status, total_points, started_at, created_at)
SELECT 
  test_user.user_id,
  'active',
  75,
  now() - interval '2 hours',
  now() - interval '2 hours'
FROM test_user
UNION ALL
SELECT 
  test_user.user_id,
  'completed',
  150,
  now() - interval '1 day',
  now() - interval '1 day'
FROM test_user;