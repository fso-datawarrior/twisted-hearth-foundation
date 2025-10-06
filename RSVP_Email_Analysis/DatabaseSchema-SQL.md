-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.guestbook (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  display_name text NOT NULL,
  message text NOT NULL,
  is_anonymous boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_pkey PRIMARY KEY (id),
  CONSTRAINT guestbook_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.guestbook_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT guestbook_reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.guestbook(id),
  CONSTRAINT guestbook_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.guestbook_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid,
  display_name text NOT NULL,
  message text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_replies_pkey PRIMARY KEY (id),
  CONSTRAINT guestbook_replies_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.guestbook(id),
  CONSTRAINT guestbook_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.guestbook_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_reports_pkey PRIMARY KEY (id),
  CONSTRAINT guestbook_reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.guestbook(id),
  CONSTRAINT guestbook_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hunt_hints (
  id integer NOT NULL DEFAULT nextval('hunt_hints_id_seq'::regclass),
  hint_text text NOT NULL,
  location text,
  rune_id text NOT NULL,
  points integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hunt_hints_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hunt_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hunt_run_id uuid NOT NULL,
  hint_id integer NOT NULL,
  user_id uuid NOT NULL,
  found_at timestamp with time zone NOT NULL DEFAULT now(),
  points_earned integer DEFAULT 10,
  CONSTRAINT hunt_progress_pkey PRIMARY KEY (id),
  CONSTRAINT hunt_progress_hunt_run_id_fkey FOREIGN KEY (hunt_run_id) REFERENCES public.hunt_runs(id),
  CONSTRAINT hunt_progress_hint_id_fkey FOREIGN KEY (hint_id) REFERENCES public.hunt_hints(id),
  CONSTRAINT hunt_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hunt_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hunt_run_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reward_type text NOT NULL,
  reward_data jsonb,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hunt_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT hunt_rewards_hunt_run_id_fkey FOREIGN KEY (hunt_run_id) REFERENCES public.hunt_runs(id),
  CONSTRAINT hunt_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hunt_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  total_points integer DEFAULT 0,
  CONSTRAINT hunt_runs_pkey PRIMARY KEY (id),
  CONSTRAINT hunt_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.photo_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT photo_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT photo_reactions_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
  CONSTRAINT photo_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  storage_path text NOT NULL,
  filename text NOT NULL,
  caption text,
  tags ARRAY,
  category text,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT photos_pkey PRIMARY KEY (id),
  CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.potluck_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  notes text,
  is_vegan boolean DEFAULT false,
  is_gluten_free boolean DEFAULT false,
  user_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  display_name text,
  CONSTRAINT potluck_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  num_guests integer NOT NULL DEFAULT 1,
  dietary_restrictions text,
  is_approved boolean DEFAULT false,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  additional_guests jsonb,
  CONSTRAINT rsvps_pkey PRIMARY KEY (id),
  CONSTRAINT rsvps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tournament_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team1_id uuid,
  team2_id uuid,
  winner_id uuid,
  match_time timestamp with time zone,
  round integer,
  status text DEFAULT 'scheduled'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_matches_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES public.tournament_teams(id),
  CONSTRAINT tournament_matches_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES public.tournament_teams(id),
  CONSTRAINT tournament_matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.tournament_teams(id)
);
CREATE TABLE public.tournament_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tournament_name text NOT NULL,
  team_name text NOT NULL,
  contact_info text,
  special_requirements text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tournament_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tournament_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_name text NOT NULL UNIQUE,
  captain_id uuid,
  members jsonb DEFAULT '[]'::jsonb,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tournament_teams_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_teams_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);