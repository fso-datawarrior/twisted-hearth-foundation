-- Fix the ensure_admins_seeded function to actually seed admin users
CREATE OR REPLACE FUNCTION public.ensure_admins_seeded()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails text[] := ARRAY['data.warrior2023@gmail.com', 'kat_crouch@hotmail.com', 'fso@data-warrior.com'];
  email_addr text;
  user_id_found uuid;
BEGIN
  -- Loop through admin emails and ensure they have admin roles
  FOREACH email_addr IN ARRAY admin_emails
  LOOP
    -- Check if user exists in auth.users and get their ID
    SELECT id INTO user_id_found 
    FROM auth.users 
    WHERE lower(email) = lower(email_addr);
    
    IF user_id_found IS NOT NULL THEN
      -- Insert admin role using the app_role enum type
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_id_found, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE LOG 'Ensured admin role for user: % (ID: %)', email_addr, user_id_found;
    ELSE
      RAISE LOG 'User not found in auth.users: %', email_addr;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_admins_seeded() TO authenticated;

-- Run the seeding function immediately
SELECT public.ensure_admins_seeded();
