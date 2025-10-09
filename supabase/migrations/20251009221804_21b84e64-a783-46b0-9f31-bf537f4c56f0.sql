-- Add helpful indexes for common filters/sorts
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON public.rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hunt_progress_user_id ON public.hunt_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hunt_progress_hint_id ON public.hunt_progress(hint_id);
CREATE INDEX IF NOT EXISTS idx_tournament_regs_created_at ON public.tournament_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_date ON public.tournament_matches(match_time);