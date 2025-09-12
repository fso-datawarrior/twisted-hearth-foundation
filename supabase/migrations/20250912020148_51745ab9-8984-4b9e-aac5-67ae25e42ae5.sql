-- First create a test user record if it doesn't exist
INSERT INTO public.users (user_id, name, email, created_at, updated_at)
VALUES (
  'test-user-12345678-1234-5678-9abc-123456789abc'::uuid,
  'Test Admin User',
  'testadmin@example.com',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Insert test data for photos table using the test user
INSERT INTO public.photos (user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, created_at)
VALUES 
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'test/sample-costume-1.jpg', 'sample-costume-1.jpg', 'Amazing Cinderella costume from last year!', ARRAY['costumes', 'fairy-tale', 'blue'], 'costumes', true, true, now() - interval '2 days'),
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'test/sample-food-1.jpg', 'sample-food-1.jpg', 'Delicious twisted fairy tale themed cupcakes', ARRAY['food', 'desserts', 'themed'], 'food', true, false, now() - interval '1 day'),
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'test/sample-activity-1.jpg', 'sample-activity-1.jpg', 'Beer pong tournament in full swing!', ARRAY['tournament', 'games', 'competition'], 'activities', true, false, now() - interval '3 hours'),
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'test/sample-costume-2.jpg', 'sample-costume-2.jpg', 'Little Red Riding Hood with a twist', ARRAY['costumes', 'creative', 'red'], 'costumes', false, false, now() - interval '1 hour'),
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'test/sample-general-1.jpg', 'sample-general-1.jpg', 'Group photo from the haunted storytelling session', ARRAY['group', 'storytelling', 'memories'], 'general', false, false, now() - interval '30 minutes');

-- Insert test data for hunt runs and progress
INSERT INTO public.hunt_runs (user_id, status, total_points, started_at, created_at)
VALUES 
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'active', 75, now() - interval '2 hours', now() - interval '2 hours'),
  ('test-user-12345678-1234-5678-9abc-123456789abc'::uuid, 'completed', 150, now() - interval '1 day', now() - interval '1 day');