-- ================================================================
-- TWISTED HEARTH FOUNDATION - COMPREHENSIVE DATABASE SCHEMA
-- Phase 1: Critical Security + Phase 2: Enhanced Schema
-- ================================================================

-- ================================================================
-- 1. ADMIN ROLE SYSTEM (CRITICAL - Security Foundation)
-- ================================================================

-- Admin role table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can manage roles
CREATE POLICY "user_roles_admin_only"
ON public.user_roles
FOR ALL
TO authenticated
USING (EXISTS(
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

-- Helper function to check admin status (SECURITY DEFINER to bypass RLS)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ================================================================
-- 2. FIX EXISTING TABLE SECURITY (CRITICAL)
-- ================================================================

-- Fix users table RLS (currently too permissive)
DROP POLICY IF EXISTS "select_users_policy" ON public.users;

CREATE POLICY "users_select_own_or_admin"
ON public.users
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Fix rsvps table RLS (currently too permissive) 
DROP POLICY IF EXISTS "select_own_rsvp" ON public.rsvps;

CREATE POLICY "rsvps_select_owner_or_admin"
ON public.rsvps
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "rsvps_insert_self_or_admin"
ON public.rsvps
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "rsvps_update_owner_or_admin"
ON public.rsvps
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "rsvps_delete_owner_or_admin"
ON public.rsvps
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- ================================================================
-- 3. SCAVENGER HUNT SYSTEM TABLES
-- ================================================================

-- Hunt Hints (Public Read - everyone can see hints)
CREATE TABLE IF NOT EXISTS public.hunt_hints (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hint_text TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL CHECK (category IN ('visual', 'text', 'location', 'riddle')),
  points INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hunt_hints ENABLE ROW LEVEL SECURITY;

-- Public read for active hints
CREATE POLICY "hunt_hints_public_read"
ON public.hunt_hints
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admin-only write for hints
CREATE POLICY "hunt_hints_admin_write"
ON public.hunt_hints
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Hunt Runs (Private - owner + admin only)
CREATE TABLE IF NOT EXISTS public.hunt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hunt_runs ENABLE ROW LEVEL SECURITY;

-- Private policies for hunt runs
CREATE POLICY "hunt_runs_select_owner_or_admin"
ON public.hunt_runs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_runs_insert_self_or_admin"
ON public.hunt_runs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_runs_update_owner_or_admin"
ON public.hunt_runs
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_runs_delete_owner_or_admin"
ON public.hunt_runs
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Hunt Progress (Private - owner + admin only)
CREATE TABLE IF NOT EXISTS public.hunt_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hunt_run_id UUID NOT NULL REFERENCES public.hunt_runs(id) ON DELETE CASCADE,
  hint_id BIGINT NOT NULL REFERENCES public.hunt_hints(id) ON DELETE CASCADE,
  found_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hunt_run_id, hint_id)
);

ALTER TABLE public.hunt_progress ENABLE ROW LEVEL SECURITY;

-- Private policies for hunt progress
CREATE POLICY "hunt_progress_select_owner_or_admin"
ON public.hunt_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_progress_insert_self_or_admin"
ON public.hunt_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_progress_update_owner_or_admin"
ON public.hunt_progress
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_progress_delete_owner_or_admin"
ON public.hunt_progress
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Hunt Rewards (Private - owner + admin only)
CREATE TABLE IF NOT EXISTS public.hunt_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hunt_run_id UUID NOT NULL REFERENCES public.hunt_runs(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'trophy', 'special_access')),
  reward_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hunt_rewards ENABLE ROW LEVEL SECURITY;

-- Private policies for hunt rewards
CREATE POLICY "hunt_rewards_select_owner_or_admin"
ON public.hunt_rewards
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_rewards_insert_self_or_admin"
ON public.hunt_rewards
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_rewards_update_owner_or_admin"
ON public.hunt_rewards
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "hunt_rewards_delete_owner_or_admin"
ON public.hunt_rewards
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- ================================================================
-- 4. PHOTO GALLERY SYSTEM (Enhanced with Metadata)
-- ================================================================

-- Photos Metadata Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('costumes', 'food', 'activities', 'general')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Public can read approved photos
CREATE POLICY "photos_public_read_approved"
ON public.photos
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Owners & admins can see their unapproved photos
CREATE POLICY "photos_owner_or_admin_read_unapproved"
ON public.photos
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Upload by owner or admin
CREATE POLICY "photos_insert_owner_or_admin"
ON public.photos
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Update/Delete by owner or admin
CREATE POLICY "photos_update_owner_or_admin"
ON public.photos
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "photos_delete_owner_or_admin"
ON public.photos
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Photo Reactions Table
CREATE TABLE IF NOT EXISTS public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (photo_id, user_id, reaction_type)
);

ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Public read for reactions
CREATE POLICY "photo_reactions_public_read"
ON public.photo_reactions
FOR SELECT
TO anon, authenticated
USING (true);

-- Insert by authenticated users
CREATE POLICY "photo_reactions_insert_authenticated"
ON public.photo_reactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Delete own reactions
CREATE POLICY "photo_reactions_delete_own"
ON public.photo_reactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ================================================================
-- 5. TOURNAMENT SYSTEM
-- ================================================================

-- Tournament Registrations
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_name TEXT NOT NULL,
  team_name TEXT,
  contact_info TEXT,
  special_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Public read for tournament hype
CREATE POLICY "tournament_regs_public_read"
ON public.tournament_registrations
FOR SELECT
TO anon, authenticated
USING (true);

-- Insert by user or admin
CREATE POLICY "tournament_regs_insert_owner_or_admin"
ON public.tournament_registrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Update/Delete by owner or admin
CREATE POLICY "tournament_regs_update_owner_or_admin"
ON public.tournament_registrations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "tournament_regs_delete_owner_or_admin"
ON public.tournament_registrations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Tournament Teams
CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  captain_id UUID REFERENCES auth.users(id),
  members TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'winner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

-- Public read for teams
CREATE POLICY "tournament_teams_public_read"
ON public.tournament_teams
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin-only write for teams
CREATE POLICY "tournament_teams_admin_write"
ON public.tournament_teams
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Tournament Matches
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_id UUID REFERENCES public.tournament_teams(id),
  team2_id UUID REFERENCES public.tournament_teams(id),
  match_date TIMESTAMPTZ,
  winner_id UUID REFERENCES public.tournament_teams(id),
  score TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Public read for matches
CREATE POLICY "tournament_matches_public_read"
ON public.tournament_matches
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin-only write for matches
CREATE POLICY "tournament_matches_admin_write"
ON public.tournament_matches
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ================================================================
-- 6. VIGNETTES CONTENT MANAGEMENT
-- ================================================================

CREATE TABLE IF NOT EXISTS public.vignettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  event_year INTEGER,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vignettes ENABLE ROW LEVEL SECURITY;

-- Public read for published vignettes
CREATE POLICY "vignettes_public_read"
ON public.vignettes
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Admin-only write
CREATE POLICY "vignettes_admin_write"
ON public.vignettes
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ================================================================
-- 7. PERFORMANCE INDEXES
-- ================================================================

-- Hunt system indexes
CREATE INDEX IF NOT EXISTS idx_hunt_runs_user_id ON public.hunt_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_hunt_runs_status ON public.hunt_runs(status);
CREATE INDEX IF NOT EXISTS idx_hunt_progress_user_id ON public.hunt_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hunt_progress_hunt_run_id ON public.hunt_progress(hunt_run_id);
CREATE INDEX IF NOT EXISTS idx_hunt_hints_category ON public.hunt_hints(category);
CREATE INDEX IF NOT EXISTS idx_hunt_hints_difficulty ON public.hunt_hints(difficulty_level);

-- Photos indexes
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_approved ON public.photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_reactions_photo_id ON public.photo_reactions(photo_id);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournament_regs_user_id ON public.tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_regs_status ON public.tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_team1 ON public.tournament_matches(team1_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_team2 ON public.tournament_matches(team2_id);

-- Vignettes indexes
CREATE INDEX IF NOT EXISTS idx_vignettes_published ON public.vignettes(is_published);
CREATE INDEX IF NOT EXISTS idx_vignettes_featured ON public.vignettes(is_featured);
CREATE INDEX IF NOT EXISTS idx_vignettes_event_year ON public.vignettes(event_year);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);