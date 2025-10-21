# Database Functions - Twisted Hearth Foundation

## Overview
PostgreSQL functions, triggers, and stored procedures used in the Twisted Hearth Foundation database system.

## Security Functions

### is_admin()
**Purpose**: Check if current user has admin role

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;
```

**Usage**: Used in RLS policies to grant admin access
**Security**: SECURITY DEFINER bypasses RLS for role checking

### has_role()
**Purpose**: Check if user has specific role

```sql
CREATE OR REPLACE FUNCTION public.has_role(
  p_user_id UUID,
  p_role app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p_user_id AND ur.role = p_role::text
  );
END;
$$;
```

## RSVP Functions

### submit_rsvp()
**Purpose**: Atomically create/update user and RSVP

```sql
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_name text,
  p_email text,
  p_num_guests smallint,
  p_costume_idea text,
  p_dietary text,
  p_contributions text,
  p_idempotency uuid DEFAULT NULL::uuid
)
RETURNS TABLE(rsvp_id uuid, updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
declare
  v_user_id uuid;
  v_rsvp_id uuid;
  v_updated boolean := false;
begin
  -- Find or create user
  select users.user_id into v_user_id 
  from public.users 
  where lower(users.email) = lower(p_email);
  
  if v_user_id is null then
    insert into public.users(name, email) 
    values (p_name, p_email)
    returning users.user_id into v_user_id;
  else
    update public.users
      set name = coalesce(p_name, users.name), updated_at = now()
      where users.user_id = v_user_id;
  end if;

  -- Create or update RSVP
  insert into public.rsvps(
    user_id, num_guests, costume_idea, dietary_restrictions, 
    contributions, status, updated_at, idempotency_token
  )
  values (
    v_user_id, coalesce(p_num_guests,1), p_costume_idea, p_dietary, 
    p_contributions, 'pending', now(), p_idempotency
  )
  on conflict (user_id) do update
    set num_guests = excluded.num_guests,
        costume_idea = excluded.costume_idea,
        dietary_restrictions = excluded.dietary_restrictions,
        contributions = excluded.contributions,
        updated_at = now(),
        idempotency_token = coalesce(excluded.idempotency_token, rsvps.idempotency_token)
  returning rsvps.rsvp_id into v_rsvp_id;

  v_updated := true;
  return query select v_rsvp_id, v_updated;
end
$$;
```

**Features**:
- ✅ Atomic user creation/update
- ✅ RSVP upsert with conflict resolution
- ✅ Idempotency token support
- ✅ Returns RSVP ID and update status

### guestbook_insert_message()
**Purpose**: Securely insert guestbook messages

```sql
CREATE OR REPLACE FUNCTION public.guestbook_insert_message(
  p_display_name TEXT,
  p_message TEXT,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS public.guestbook AS $$
DECLARE
  v_row public.guestbook;
BEGIN
  INSERT INTO public.guestbook (user_id, display_name, message, is_anonymous)
  VALUES (
    auth.uid(),
    COALESCE(NULLIF(TRIM(p_display_name), ''), SPLIT_PART(auth.email(), '@', 1)),
    TRIM(p_message),
    COALESCE(p_is_anonymous, false)
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Features**:
- ✅ Automatic user ID assignment
- ✅ Display name fallback to email username
- ✅ Message trimming and validation
- ✅ Returns inserted row

## User Management Functions

### update_user_profile()
**Purpose**: Update user profile information

```sql
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    SELECT v_user_id, au.email, p_display_name, p_avatar_url
    FROM auth.users au WHERE au.id = v_user_id
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  END IF;

  RETURN QUERY SELECT true, 'Profile updated successfully'::TEXT;
END;
$$;
```

### update_user_email()
**Purpose**: Update user email address

```sql
CREATE OR REPLACE FUNCTION public.update_user_email(
  p_new_email TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Email validation
  IF p_new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN QUERY SELECT false, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_new_email AND id != v_user_id) THEN
    RETURN QUERY SELECT false, 'Email already in use'::TEXT;
    RETURN;
  END IF;

  -- Update profile email
  UPDATE public.profiles 
  SET email = p_new_email, updated_at = now()
  WHERE id = v_user_id;

  RETURN QUERY SELECT true, 'Email updated successfully. Please verify your new email.'::TEXT;
END;
$$;
```## Content Management Functions

### manage_vignette()
**Purpose**: Admin function to manage past vignettes

```sql
CREATE OR REPLACE FUNCTION public.manage_vignette(
  p_action TEXT,
  p_vignette_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_theme_tag TEXT DEFAULT NULL,
  p_photo_ids UUID[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vignette_id UUID;
  current_user_id UUID;
BEGIN
  -- Check admin permissions
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can manage vignettes';
  END IF;
  
  current_user_id := auth.uid();
  
  -- Validate action
  IF p_action NOT IN ('create', 'update', 'delete', 'reorder') THEN
    RAISE EXCEPTION 'Invalid action: %. Must be create, update, delete, or reorder', p_action;
  END IF;
  
  -- Validate theme_tag length
  IF p_theme_tag IS NOT NULL AND length(p_theme_tag) > 20 THEN
    RAISE EXCEPTION 'Theme tag must be 20 characters or less';
  END IF;
  
  -- Validate year range
  IF p_year IS NOT NULL AND (p_year < 1900 OR p_year > 2100) THEN
    RAISE EXCEPTION 'Year must be between 1900 and 2100';
  END IF;
  
  CASE p_action
    WHEN 'create' THEN
      -- Validate required fields for creation
      IF p_title IS NULL OR p_description IS NULL OR p_year IS NULL OR p_theme_tag IS NULL THEN
        RAISE EXCEPTION 'Title, description, year, and theme_tag are required for creating vignettes';
      END IF;
      
      INSERT INTO public.past_vignettes (
        title, description, year, theme_tag, photo_ids, is_active, sort_order, created_by, updated_by
      ) VALUES (
        p_title, p_description, p_year, p_theme_tag, 
        COALESCE(p_photo_ids, '{}'), COALESCE(p_is_active, true), 
        COALESCE(p_sort_order, 0), current_user_id, current_user_id
      ) RETURNING id INTO vignette_id;
      
    WHEN 'update' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for updates';
      END IF;
      
      UPDATE public.past_vignettes
      SET 
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        year = COALESCE(p_year, year),
        theme_tag = COALESCE(p_theme_tag, theme_tag),
        photo_ids = COALESCE(p_photo_ids, photo_ids),
        is_active = COALESCE(p_is_active, is_active),
        sort_order = COALESCE(p_sort_order, sort_order),
        updated_by = current_user_id,
        updated_at = now()
      WHERE id = p_vignette_id
      RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
      
    WHEN 'delete' THEN
      IF p_vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette ID is required for deletion';
      END IF;
      
      DELETE FROM public.past_vignettes WHERE id = p_vignette_id RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
      
    WHEN 'reorder' THEN
      IF p_vignette_id IS NULL OR p_sort_order IS NULL THEN
        RAISE EXCEPTION 'Vignette ID and sort_order are required for reordering';
      END IF;
      
      UPDATE public.past_vignettes
      SET sort_order = p_sort_order, updated_by = current_user_id, updated_at = now()
      WHERE id = p_vignette_id
      RETURNING id INTO vignette_id;
      
      IF vignette_id IS NULL THEN
        RAISE EXCEPTION 'Vignette not found: %', p_vignette_id;
      END IF;
  END CASE;
  
  RETURN vignette_id;
END;
$$;
```

### get_active_vignettes()
**Purpose**: Get active vignettes for public display

```sql
CREATE OR REPLACE FUNCTION public.get_active_vignettes()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  year INTEGER,
  theme_tag TEXT,
  photo_ids UUID[],
  sort_order INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id, v.title, v.description, v.year, v.theme_tag, 
    v.photo_ids, v.sort_order, v.created_at
  FROM public.past_vignettes v
  WHERE v.is_active = true
  ORDER BY v.sort_order ASC, v.created_at DESC
  LIMIT 3;
END;
$$;
```

## Analytics Functions

### aggregate_daily_stats()
**Purpose**: Aggregate daily analytics data

```sql
CREATE OR REPLACE FUNCTION public.aggregate_daily_stats(
  p_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := COALESCE(p_date, CURRENT_DATE - INTERVAL '1 day');
BEGIN
  -- Insert or update daily aggregates
  INSERT INTO public.analytics_daily_aggregates (
    date,
    total_page_views,
    unique_visitors,
    active_sessions,
    avg_session_duration,
    new_users,
    rsvps_submitted,
    rsvps_confirmed,
    photos_uploaded,
    guestbook_posts
  )
  SELECT 
    v_date,
    COUNT(DISTINCT pv.id) as total_page_views,
    COUNT(DISTINCT pv.user_id) as unique_visitors,
    COUNT(DISTINCT us.id) as active_sessions,
    AVG(us.duration_seconds) as avg_session_duration,
    COUNT(DISTINCT CASE WHEN DATE(au.created_at) = v_date THEN au.id END) as new_users,
    COUNT(DISTINCT CASE WHEN DATE(r.created_at) = v_date THEN r.id END) as rsvps_submitted,
    COUNT(DISTINCT CASE WHEN DATE(r.created_at) = v_date AND r.status = 'confirmed' THEN r.id END) as rsvps_confirmed,
    COUNT(DISTINCT CASE WHEN DATE(p.created_at) = v_date THEN p.id END) as photos_uploaded,
    COUNT(DISTINCT CASE WHEN DATE(g.created_at) = v_date THEN g.id END) as guestbook_posts
  FROM public.page_views pv
  LEFT JOIN public.user_sessions us ON DATE(us.started_at) = v_date
  LEFT JOIN auth.users au ON DATE(au.created_at) = v_date
  LEFT JOIN public.rsvps r ON DATE(r.created_at) = v_date
  LEFT JOIN public.photos p ON DATE(p.created_at) = v_date
  LEFT JOIN public.guestbook g ON DATE(g.created_at) = v_date
  WHERE DATE(pv.created_at) = v_date
  ON CONFLICT (date) DO UPDATE SET
    total_page_views = EXCLUDED.total_page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    active_sessions = EXCLUDED.active_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration,
    new_users = EXCLUDED.new_users,
    rsvps_submitted = EXCLUDED.rsvps_submitted,
    rsvps_confirmed = EXCLUDED.rsvps_confirmed,
    photos_uploaded = EXCLUDED.photos_uploaded,
    guestbook_posts = EXCLUDED.guestbook_posts,
    updated_at = now();
END;
$$;
```

## Trigger Functions

### update_updated_at_column()
**Purpose**: Generic trigger function to update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Usage**: Applied to tables that need automatic timestamp updates:
- `profiles`
- `guestbook`
- `photos`
- `rsvps`
- `email_templates`
- `email_campaigns`

### handle_new_user()
**Purpose**: Create profile when new user signs up

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

**Usage**: Triggered on `auth.users` table insert

## Function Permissions

### Grant Statements
```sql
-- Security functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

-- RSVP functions
GRANT EXECUTE ON FUNCTION public.submit_rsvp(text, text, smallint, text, text, text, uuid) TO anon, authenticated;

-- User management functions
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_email TO authenticated;

-- Content management functions
GRANT EXECUTE ON FUNCTION public.manage_vignette TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_vignettes TO authenticated;

-- Guestbook functions
GRANT EXECUTE ON FUNCTION public.guestbook_insert_message TO authenticated;
```

## Performance Considerations

### Function Optimization
- Use `SECURITY DEFINER` sparingly
- Implement proper indexing for function queries
- Use `STABLE` or `IMMUTABLE` where appropriate
- Avoid expensive operations in frequently called functions

### Best Practices
- Validate input parameters
- Use proper error handling with `RAISE EXCEPTION`
- Return meaningful error messages
- Log important operations for debugging