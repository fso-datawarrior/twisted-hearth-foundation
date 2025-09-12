-- Update admin email to fso@data-warrior.com
UPDATE public.user_roles 
SET user_id = (SELECT id FROM auth.users WHERE email = 'fso@data-warrior.com' LIMIT 1)
WHERE role = 'admin' AND user_id = (SELECT id FROM auth.users WHERE email = 'admin@twistedhearth.com' LIMIT 1);

-- Insert fso@data-warrior.com as admin if they exist and don't already have admin role
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT auth.users.id, 'admin', now()
FROM auth.users 
WHERE auth.users.email = 'fso@data-warrior.com'
ON CONFLICT (user_id) DO NOTHING;