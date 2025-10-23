-- Function to ensure admin users are seeded properly
CREATE OR REPLACE FUNCTION public.ensure_admins_seeded()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_emails text[] := ARRAY['data.warrior2023@gmail.com', 'kat_crouch@hotmail.com', 'fso@data-warrior.com'];
  email_addr text;
  user_record record;
BEGIN
  -- Loop through admin emails and ensure they have admin roles
  FOREACH email_addr IN ARRAY admin_emails
  LOOP
    -- Check if user exists in auth.users and get their ID
    SELECT id INTO user_record FROM auth.users WHERE lower(email) = lower(email_addr);
    
    IF user_record.id IS NOT NULL THEN
      -- Insert admin role if it doesn't exist
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_record.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE LOG 'Ensured admin role for user: %', email_addr;
    ELSE
      RAISE LOG 'User not found in auth.users: %', email_addr;
    END IF;
  END LOOP;
END;
$$;

-- Enhanced admin check function with better error handling
CREATE OR REPLACE FUNCTION public.check_admin_status(p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid := COALESCE(p_user_id, auth.uid());
  is_admin_user boolean := false;
BEGIN
  -- Return false if no user ID provided
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user has admin role
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id AND ur.role = 'admin'
  ) INTO is_admin_user;

  RETURN is_admin_user;
EXCEPTION WHEN OTHERS THEN
  -- Log error and return false on any exception
  RAISE LOG 'Error checking admin status for user %: %', target_user_id, SQLERRM;
  RETURN false;
END;
$$;