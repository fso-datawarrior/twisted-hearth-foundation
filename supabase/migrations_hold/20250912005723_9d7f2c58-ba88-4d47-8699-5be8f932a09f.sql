-- Insert admin users into user_roles table
-- First, ensure the users exist in auth.users table (they should already exist)
-- Then add them to user_roles with admin role

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email IN (
  'data.warrior2023@gmail.com', 
  'kat_crouch@hotmail.com', 
  'fso@data-warrior.com'
)
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;