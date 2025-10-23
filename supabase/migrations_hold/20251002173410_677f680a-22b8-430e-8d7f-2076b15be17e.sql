-- Create app role enum for secure role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  is_approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Create guestbook table
CREATE TABLE public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- Create guestbook_replies table
CREATE TABLE public.guestbook_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guestbook_replies ENABLE ROW LEVEL SECURITY;

-- Create guestbook_reactions table
CREATE TABLE public.guestbook_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

ALTER TABLE public.guestbook_reactions ENABLE ROW LEVEL SECURITY;

-- Create guestbook_reports table
CREATE TABLE public.guestbook_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.guestbook_reports ENABLE ROW LEVEL SECURITY;

-- Create photos table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  category TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create photo_reactions table
CREATE TABLE public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id, reaction_type)
);

ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Create hunt_hints table
CREATE TABLE public.hunt_hints (
  id SERIAL PRIMARY KEY,
  hint_text TEXT NOT NULL,
  location TEXT,
  rune_id TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hunt_hints ENABLE ROW LEVEL SECURITY;

-- Create hunt_runs table
CREATE TABLE public.hunt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_points INTEGER DEFAULT 0
);

ALTER TABLE public.hunt_runs ENABLE ROW LEVEL SECURITY;

-- Create hunt_progress table
CREATE TABLE public.hunt_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_run_id UUID REFERENCES public.hunt_runs(id) ON DELETE CASCADE NOT NULL,
  hint_id INTEGER REFERENCES public.hunt_hints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  found_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_earned INTEGER DEFAULT 10,
  UNIQUE(hunt_run_id, hint_id)
);

ALTER TABLE public.hunt_progress ENABLE ROW LEVEL SECURITY;

-- Create hunt_rewards table
CREATE TABLE public.hunt_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_run_id UUID REFERENCES public.hunt_runs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL,
  reward_data JSONB,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hunt_rewards ENABLE ROW LEVEL SECURITY;

-- Create tournament_registrations table
CREATE TABLE public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tournament_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  contact_info TEXT,
  special_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Create tournament_teams table
CREATE TABLE public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  captain_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  members JSONB DEFAULT '[]'::jsonb,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

-- Create tournament_matches table
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_id UUID REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
  match_time TIMESTAMPTZ,
  round INTEGER,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Create function to check admin status (for compatibility)
CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Create function to ensure admin users are seeded
CREATE OR REPLACE FUNCTION public.ensure_admins_seeded()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be used to seed admin roles
  -- Implementation depends on your admin seeding logic
  RETURN;
END;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create function to insert guestbook message
CREATE OR REPLACE FUNCTION public.guestbook_insert_message(
  p_display_name TEXT,
  p_message TEXT,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO public.guestbook (user_id, display_name, message, is_anonymous)
  VALUES (auth.uid(), p_display_name, p_message, p_is_anonymous)
  RETURNING id INTO v_post_id;
  
  RETURN v_post_id;
END;
$$;

-- Create function to mark hunt hint as found
CREATE OR REPLACE FUNCTION public.mark_hint_found(
  p_hint_id INTEGER,
  p_hunt_run_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hunt_run_id UUID;
  v_points INTEGER;
  v_progress_id UUID;
BEGIN
  -- Get or create active hunt run
  IF p_hunt_run_id IS NULL THEN
    SELECT id INTO v_hunt_run_id
    FROM public.hunt_runs
    WHERE user_id = auth.uid() AND completed_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1;
    
    IF v_hunt_run_id IS NULL THEN
      INSERT INTO public.hunt_runs (user_id)
      VALUES (auth.uid())
      RETURNING id INTO v_hunt_run_id;
    END IF;
  ELSE
    v_hunt_run_id := p_hunt_run_id;
  END IF;
  
  -- Get points for this hint
  SELECT points INTO v_points
  FROM public.hunt_hints
  WHERE id = p_hint_id;
  
  -- Insert progress
  INSERT INTO public.hunt_progress (hunt_run_id, hint_id, user_id, points_earned)
  VALUES (v_hunt_run_id, p_hint_id, auth.uid(), v_points)
  ON CONFLICT (hunt_run_id, hint_id) DO NOTHING
  RETURNING id INTO v_progress_id;
  
  -- Update total points
  UPDATE public.hunt_runs
  SET total_points = total_points + v_points
  WHERE id = v_hunt_run_id;
  
  RETURN jsonb_build_object('id', v_progress_id, 'hunt_run_id', v_hunt_run_id);
END;
$$;

-- Create function to get hunt stats
CREATE OR REPLACE FUNCTION public.get_hunt_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_hints_found INTEGER,
  total_points INTEGER,
  completed_runs INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT hp.hint_id)::INTEGER AS total_hints_found,
    COALESCE(SUM(hp.points_earned), 0)::INTEGER AS total_points,
    COUNT(DISTINCT CASE WHEN hr.completed_at IS NOT NULL THEN hr.id END)::INTEGER AS completed_runs
  FROM public.hunt_runs hr
  LEFT JOIN public.hunt_progress hp ON hr.id = hp.hunt_run_id
  WHERE hr.user_id = v_user_id;
END;
$$;

-- Create function to moderate photo
CREATE OR REPLACE FUNCTION public.moderate_photo(
  p_photo_id UUID,
  p_approved BOOLEAN,
  p_featured BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can moderate photos';
  END IF;
  
  UPDATE public.photos
  SET is_approved = p_approved,
      is_featured = p_featured,
      updated_at = now()
  WHERE id = p_photo_id;
END;
$$;

-- Create function to upload photo metadata
CREATE OR REPLACE FUNCTION public.upload_photo(
  p_storage_path TEXT,
  p_filename TEXT,
  p_caption TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photo_id UUID;
BEGIN
  INSERT INTO public.photos (user_id, storage_path, filename, caption, tags, category)
  VALUES (auth.uid(), p_storage_path, p_filename, p_caption, p_tags, p_category)
  RETURNING id INTO v_photo_id;
  
  RETURN v_photo_id;
END;
$$;

-- Create function to toggle photo reaction
CREATE OR REPLACE FUNCTION public.toggle_photo_reaction(
  p_photo_id UUID,
  p_reaction_type TEXT DEFAULT 'like'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.photo_reactions
    WHERE photo_id = p_photo_id AND user_id = auth.uid() AND reaction_type = p_reaction_type
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.photo_reactions
    WHERE photo_id = p_photo_id AND user_id = auth.uid() AND reaction_type = p_reaction_type;
    RETURN false;
  ELSE
    INSERT INTO public.photo_reactions (photo_id, user_id, reaction_type)
    VALUES (p_photo_id, auth.uid(), p_reaction_type);
    RETURN true;
  END IF;
END;
$$;

-- Create function to register tournament team
CREATE OR REPLACE FUNCTION public.register_team(
  p_tournament_name TEXT,
  p_team_name TEXT,
  p_contact_info TEXT DEFAULT NULL,
  p_special_requirements TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration_id UUID;
BEGIN
  INSERT INTO public.tournament_registrations (user_id, tournament_name, team_name, contact_info, special_requirements)
  VALUES (auth.uid(), p_tournament_name, p_team_name, p_contact_info, p_special_requirements)
  RETURNING id INTO v_registration_id;
  
  RETURN v_registration_id;
END;
$$;

-- Create function to update RSVP status (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_rsvp_status(
  p_rsvp_id UUID,
  p_status TEXT,
  p_is_approved BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update RSVP status';
  END IF;
  
  UPDATE public.rsvps
  SET status = p_status,
      is_approved = COALESCE(p_is_approved, is_approved),
      updated_at = now()
  WHERE id = p_rsvp_id;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guestbook_updated_at
  BEFORE UPDATE ON public.guestbook
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for RSVPs
CREATE POLICY "Users can view own RSVPs"
  ON public.rsvps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own RSVPs"
  ON public.rsvps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs"
  ON public.rsvps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete RSVPs"
  ON public.rsvps FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for guestbook
CREATE POLICY "Anyone can view non-deleted guestbook posts"
  ON public.guestbook FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert guestbook posts"
  ON public.guestbook FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guestbook posts"
  ON public.guestbook FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for guestbook_replies
CREATE POLICY "Anyone can view guestbook replies"
  ON public.guestbook_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert replies"
  ON public.guestbook_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for guestbook_reactions
CREATE POLICY "Anyone can view reactions"
  ON public.guestbook_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON public.guestbook_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for guestbook_reports
CREATE POLICY "Users can insert reports"
  ON public.guestbook_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view reports"
  ON public.guestbook_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for photos
CREATE POLICY "Anyone can view approved photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (is_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own photos"
  ON public.photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON public.photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for photo_reactions
CREATE POLICY "Anyone can view photo reactions"
  ON public.photo_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own photo reactions"
  ON public.photo_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for hunt_hints
CREATE POLICY "Anyone can view active hints"
  ON public.hunt_hints FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage hints"
  ON public.hunt_hints FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for hunt_runs
CREATE POLICY "Users can view own hunt runs"
  ON public.hunt_runs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own hunt runs"
  ON public.hunt_runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hunt runs"
  ON public.hunt_runs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for hunt_progress
CREATE POLICY "Users can view own hunt progress"
  ON public.hunt_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own hunt progress"
  ON public.hunt_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for hunt_rewards
CREATE POLICY "Users can view own hunt rewards"
  ON public.hunt_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert hunt rewards"
  ON public.hunt_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tournament_registrations
CREATE POLICY "Users can view own registrations"
  ON public.tournament_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own registrations"
  ON public.tournament_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tournament_teams
CREATE POLICY "Anyone can view tournament teams"
  ON public.tournament_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tournament teams"
  ON public.tournament_teams FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tournament_matches
CREATE POLICY "Anyone can view tournament matches"
  ON public.tournament_matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tournament matches"
  ON public.tournament_matches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));