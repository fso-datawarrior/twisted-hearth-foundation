-- RLS Hardening Migration
-- Date: 2025-09-23

-- Assumes helper function public.is_admin() exists returning boolean for current_user

-- Enable RLS on relevant tables (idempotent: enabling when already enabled is safe)
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potluck_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunt_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunt_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunt_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunt_rewards ENABLE ROW LEVEL SECURITY;

-- Drop overly-broad policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'photo_reactions' AND policyname = 'photo_reactions_public_read'
  ) THEN
    EXECUTE 'DROP POLICY "photo_reactions_public_read" ON public.photo_reactions';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tournament_registrations' AND policyname = 'tournament_registrations_public_read'
  ) THEN
    EXECUTE 'DROP POLICY "tournament_registrations_public_read" ON public.tournament_registrations';
  END IF;
END$$;

-- Guestbook policies
DROP POLICY IF EXISTS guestbook_select ON public.guestbook;
DROP POLICY IF EXISTS guestbook_insert ON public.guestbook;
DROP POLICY IF EXISTS guestbook_update_owner ON public.guestbook;

CREATE POLICY guestbook_select ON public.guestbook
FOR SELECT
USING (
  -- Admins can read all
  public.is_admin() OR
  -- Owners can read their own messages (including hidden)
  user_id = auth.uid() OR
  -- Public can read non-deleted messages
  deleted_at IS NULL
);

CREATE POLICY guestbook_insert ON public.guestbook
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY guestbook_update_owner ON public.guestbook
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Guestbook replies
DROP POLICY IF EXISTS guestbook_replies_select ON public.guestbook_replies;
DROP POLICY IF EXISTS guestbook_replies_insert ON public.guestbook_replies;
CREATE POLICY guestbook_replies_select ON public.guestbook_replies FOR SELECT USING (true);
CREATE POLICY guestbook_replies_insert ON public.guestbook_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Photos
DROP POLICY IF EXISTS photos_select_public ON public.photos;
DROP POLICY IF EXISTS photos_select_owner_admin ON public.photos;
DROP POLICY IF EXISTS photos_insert_owner ON public.photos;
DROP POLICY IF EXISTS photos_update_owner_admin ON public.photos;

CREATE POLICY photos_select_public ON public.photos FOR SELECT USING (is_approved = true OR public.is_admin() OR user_id = auth.uid());
CREATE POLICY photos_insert_owner ON public.photos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY photos_select_owner_admin ON public.photos FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR is_approved = true);
CREATE POLICY photos_update_owner_admin ON public.photos FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Photo reactions: restricted to owner of reaction; readable for associated photo visibility
DROP POLICY IF EXISTS photo_reactions_select ON public.photo_reactions;
DROP POLICY IF EXISTS photo_reactions_mutate_owner ON public.photo_reactions;
CREATE POLICY photo_reactions_select ON public.photo_reactions
FOR SELECT USING (
  public.is_admin() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.photos p 
    WHERE p.id = photo_id AND (p.is_approved = true OR p.user_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY photo_reactions_mutate_owner ON public.photo_reactions
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Tournament registrations: owners or admins can read/write; public should use a view if needed
DROP POLICY IF EXISTS tournament_registrations_select_owner_admin ON public.tournament_registrations;
DROP POLICY IF EXISTS tournament_registrations_modify_owner_admin ON public.tournament_registrations;
CREATE POLICY tournament_registrations_select_owner_admin ON public.tournament_registrations FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY tournament_registrations_modify_owner_admin ON public.tournament_registrations FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Tournament teams: readable to all; modifications only admins
DROP POLICY IF EXISTS tournament_teams_select_all ON public.tournament_teams;
DROP POLICY IF EXISTS tournament_teams_modify_admin ON public.tournament_teams;
CREATE POLICY tournament_teams_select_all ON public.tournament_teams FOR SELECT USING (true);
CREATE POLICY tournament_teams_modify_admin ON public.tournament_teams FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Tournament matches: readable to all; modifications only admins
DROP POLICY IF EXISTS tournament_matches_select_all ON public.tournament_matches;
DROP POLICY IF EXISTS tournament_matches_modify_admin ON public.tournament_matches;
CREATE POLICY tournament_matches_select_all ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY tournament_matches_modify_admin ON public.tournament_matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Potluck items: owners can read/write their own; admins can read all; public can read list
DROP POLICY IF EXISTS potluck_items_select ON public.potluck_items;
DROP POLICY IF EXISTS potluck_items_modify_owner_admin ON public.potluck_items;
CREATE POLICY potluck_items_select ON public.potluck_items FOR SELECT USING (deleted_at IS NULL OR public.is_admin() OR user_id = auth.uid());
CREATE POLICY potluck_items_modify_owner_admin ON public.potluck_items FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Hunt tables: restrict to owner/admin; hints are public if active
DROP POLICY IF EXISTS hunt_hints_select_public ON public.hunt_hints;
CREATE POLICY hunt_hints_select_public ON public.hunt_hints FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS hunt_runs_owner_admin ON public.hunt_runs;
CREATE POLICY hunt_runs_owner_admin ON public.hunt_runs FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS hunt_progress_owner_admin ON public.hunt_progress;
CREATE POLICY hunt_progress_owner_admin ON public.hunt_progress FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS hunt_rewards_owner_admin ON public.hunt_rewards;
CREATE POLICY hunt_rewards_owner_admin ON public.hunt_rewards FOR ALL USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Storage policies for bucket `gallery`: ensure user folder scoping
-- Requires: create policies on storage.objects (schema: storage)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gallery_read_public ON storage.objects;
DROP POLICY IF EXISTS gallery_write_owner ON storage.objects;

-- Public can read approved images via signed URLs or public bucket; otherwise, restrict by folder owner
CREATE POLICY gallery_read_public ON storage.objects
FOR SELECT
USING (
  bucket_id = 'gallery' AND (
    -- Allow public read; bucket may be configured public; keep row policy permissive for gallery
    true
  )
);

-- Only the owner can insert into their folder: user-uploads/{uid}/...
CREATE POLICY gallery_write_owner ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND
  (
    (storage.foldername(name))[1] = 'user-uploads' AND
    (storage.foldername(name))[2] = auth.uid()::text
  )
);
