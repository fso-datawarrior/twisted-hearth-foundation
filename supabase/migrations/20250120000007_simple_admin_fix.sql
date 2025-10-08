-- Simple admin fix - directly add admin roles for the three admin emails
-- This is the clean, simple approach

-- Add admin roles for the three admin emails
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'admin'::app_role
FROM auth.users u
WHERE u.email IN ('fso@data-warrior.com', 'data.warrior2023@gmail.com', 'kat_crouch@hotmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the results
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role = 'admin';
  
  RAISE LOG 'Total admin users after fix: %', admin_count;
END $$;
