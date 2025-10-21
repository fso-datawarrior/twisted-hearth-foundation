# SPEED BEER PONG TOURNAMENT - IMPLEMENTATION PLAN (v3)

**Project**: Add Beer Pong Tournament Registration & Management
**Branch**: `prod-2025.partytillyou.rip`
**Created**: 2025-10-21
**Updated**: 2025-10-21 (v3 - Time calculator, enhanced management, rule voting)

---

## 🎯 OBJECTIVES

1. Implement **ultra-fast 5-minute max games** with 4-minute sudden death trigger
2. Enable team registration for 2-person teams (max 20 teams)
3. Allow teams to **upload custom photos** and add **team slogans**
4. **Admin bracket management**: generate brackets, record scores, manage matches
5. **Tournament time calculator**: estimate duration based on team count (4-min or 5-min toggles)
6. **Enhanced match management**: easy winner/loser changes, "up next" visibility
7. **Rule discussion/voting system**: community-driven rule proposals and voting
8. **Public bracket display** for game day viewing with mobile-friendly bracket tree
9. Display registered teams on the Schedule page with live updates

---

## 🏓 PART 1: LIGHTNING BEER PONG RULES (5-MINUTE MAX)

### **Official Tournament Rules**

**Tournament Format**: Single-elimination bracket
**Team Size**: 2 players per team
**Max Teams**: 20
**Equipment**: 12 cups, 2 ping pong balls, water
**Cup Contents**: WATER ONLY (no alcohol)

---

### **Game Setup**
- Each team arranges **6 cups** in triangle formation (3-2-1)
- Cups filled with water (no alcohol)
- Set visible 5-minute countdown timer
- Coin flip to determine which team starts

---

### **Core Gameplay Rules**

1. **Throwing**: Teams alternate throws. Both players throw once per turn.
2. **Hits**:
   - Ball lands in cup → Remove cup, dump water
   - Both players make their shots → **"Bring backs"** (throw again immediately)
3. **Re-Racks**: Each team gets **ONE re-rack** per game
   - Available when: 4, 3, or 2 cups remain
   - Must request before opponent's turn starts
4. **Bounce Shots**: If ball bounces on table, defending team **CAN swat it**
5. **Elbows**: Elbow must stay behind table edge when throwing
6. **Distractions**: No touching cups, blowing, or physical interference during throws

---

### **⏱️ TIME LIMIT & SUDDEN DEATH**

#### **Regular Play (0:00 - 4:00)**
- Standard beer pong rules
- First team to eliminate all opponent cups wins immediately
- If game concludes before 4:00, winner advances

#### **Sudden Death Trigger (4:00 mark)**
If game is still active when timer hits **4:00 remaining**:

1. **STOP PLAY IMMEDIATELY**
2. **Count cups**: Determine which team has FEWER cups remaining
3. **Coin Flip**:
   - Team with **FEWER cups** gets to call the coin flip (heads/tails)
   - Coin flip winner chooses to go **first** or **second**
4. **Throwing Round**:
   - Each player gets a number of throws equal to **opponent's cup count**
   - Example:
     - Team A has 4 cups remaining
     - Team B has 2 cups remaining
     - Team B calls coin flip (they're losing)
     - Team A players each throw **2 balls** (opponent's cup count)
     - Team B players each throw **4 balls** (opponent's cup count)
   - **NO DEFENSE**: Cannot swat, blow, or interfere. Just throw.
   - **NO RE-THROWS**: If ball bounces back, you don't get to re-throw it
5. **Winner Determination**:
   - After sudden death round, count remaining cups
   - Team with **FEWER cups** wins
   - If still tied: Repeat sudden death until resolved

**Max Game Time**: 5 minutes

---

### **Why This System Works**
- ✅ **Ultra-fast**: 5 min max keeps tournament on schedule
- ✅ **Fair advantage**: Winning team (ahead on cups) gets more throws in sudden death
- ✅ **Dramatic tension**: 4-minute trigger creates urgency
- ✅ **Simple to referee**: Just watch clock and count cups
- ✅ **No stalling**: Can't play defense in sudden death

---

## 🗄️ PART 2: DATABASE SCHEMA CHANGES

### Migration: Add Beer Pong Team Features

**File**: `supabase/migrations/20251021180000_beer_pong_teams_v2.sql`

```sql
-- ================================================================
-- BEER PONG TOURNAMENT SYSTEM v2
-- Features: Custom photo uploads, team slogans, bracket management
-- ================================================================

-- Add new columns to tournament_teams table
ALTER TABLE public.tournament_teams
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS team_slogan TEXT,
  ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tournament_type TEXT DEFAULT 'beer_pong' CHECK (tournament_type IN ('beer_pong', 'other')),
  ADD COLUMN IF NOT EXISTS seed_number INTEGER,
  ADD COLUMN IF NOT EXISTS eliminated_at TIMESTAMPTZ;

-- Add unique constraint: Each user can only captain ONE beer pong team
CREATE UNIQUE INDEX IF NOT EXISTS unique_captain_per_beer_pong_tournament
  ON public.tournament_teams (captain_id)
  WHERE tournament_type = 'beer_pong' AND status != 'eliminated';

-- Add unique constraint: Each partner can only be on ONE beer pong team
CREATE UNIQUE INDEX IF NOT EXISTS unique_partner_per_beer_pong_tournament
  ON public.tournament_teams (partner_user_id)
  WHERE tournament_type = 'beer_pong' AND partner_user_id IS NOT NULL AND status != 'eliminated';

-- ================================================================
-- STORAGE BUCKET FOR TEAM PHOTOS
-- ================================================================

-- Create storage bucket for team photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournament-team-photos',
  'tournament-team-photos',
  true,
  2097152, -- 2MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own team photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tournament-team-photos' AND
    (storage.foldername(name))[1]::uuid = auth.uid()
  );

-- Storage policy: Anyone can view team photos
CREATE POLICY "Anyone can view team photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tournament-team-photos');

-- Storage policy: Users can update/delete own photos
CREATE POLICY "Users can update own team photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'tournament-team-photos' AND
    (storage.foldername(name))[1]::uuid = auth.uid()
  );

CREATE POLICY "Users can delete own team photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tournament-team-photos' AND
    (storage.foldername(name))[1]::uuid = auth.uid()
  );

-- ================================================================
-- TEAM REGISTRATION FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.register_beer_pong_team(
  p_team_name TEXT,
  p_team_slogan TEXT,
  p_partner_email TEXT,
  p_photo_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_captain_id UUID;
  v_partner_id UUID;
  v_team_id UUID;
  v_team_count INTEGER;
BEGIN
  -- Get captain (caller)
  v_captain_id := auth.uid();

  IF v_captain_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to register a team';
  END IF;

  -- Check tournament capacity (max 20 teams)
  SELECT COUNT(*) INTO v_team_count
  FROM tournament_teams
  WHERE tournament_type = 'beer_pong' AND status != 'eliminated';

  IF v_team_count >= 20 THEN
    RAISE EXCEPTION 'Tournament is full (max 20 teams)';
  END IF;

  -- Check if captain already has a team
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE captain_id = v_captain_id
      AND tournament_type = 'beer_pong'
      AND status != 'eliminated'
  ) THEN
    RAISE EXCEPTION 'You are already registered as a team captain';
  END IF;

  -- Check if captain is already a partner on another team
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE partner_user_id = v_captain_id
      AND tournament_type = 'beer_pong'
      AND status != 'eliminated'
  ) THEN
    RAISE EXCEPTION 'You are already registered as a partner on another team';
  END IF;

  -- Find partner by email
  SELECT id INTO v_partner_id
  FROM auth.users
  WHERE email = p_partner_email;

  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'Partner email not found. They must have an account and RSVP first.';
  END IF;

  IF v_partner_id = v_captain_id THEN
    RAISE EXCEPTION 'You cannot be your own partner';
  END IF;

  -- Check if partner is already on a team (as captain or partner)
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE (captain_id = v_partner_id OR partner_user_id = v_partner_id)
      AND tournament_type = 'beer_pong'
      AND status != 'eliminated'
  ) THEN
    RAISE EXCEPTION 'Your partner is already registered on another team';
  END IF;

  -- Create team
  INSERT INTO tournament_teams (
    team_name,
    team_slogan,
    captain_id,
    partner_user_id,
    profile_photo_url,
    tournament_type,
    status
  ) VALUES (
    p_team_name,
    p_team_slogan,
    v_captain_id,
    v_partner_id,
    p_photo_url,
    'beer_pong',
    'active'
  )
  RETURNING id INTO v_team_id;

  RETURN v_team_id;
END;
$$;

-- ================================================================
-- TEAM UPDATE FUNCTION (for editing team info)
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_beer_pong_team(
  p_team_id UUID,
  p_team_name TEXT DEFAULT NULL,
  p_team_slogan TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_captain_id UUID;
BEGIN
  v_captain_id := auth.uid();

  IF v_captain_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to update team';
  END IF;

  -- Verify caller is team captain
  IF NOT EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE id = p_team_id AND captain_id = v_captain_id
  ) THEN
    RAISE EXCEPTION 'Only team captain can update team info';
  END IF;

  -- Update team
  UPDATE tournament_teams
  SET
    team_name = COALESCE(p_team_name, team_name),
    team_slogan = COALESCE(p_team_slogan, team_slogan),
    profile_photo_url = COALESCE(p_photo_url, profile_photo_url)
  WHERE id = p_team_id;

  RETURN TRUE;
END;
$$;

-- ================================================================
-- BRACKET MANAGEMENT (ADMIN ONLY)
-- ================================================================

-- Add match details to tournament_matches
ALTER TABLE public.tournament_matches
  ADD COLUMN IF NOT EXISTS bracket_position TEXT, -- e.g., "R1-M1" (Round 1, Match 1)
  ADD COLUMN IF NOT EXISTS team1_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team2_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Function to generate bracket (admin only)
CREATE OR REPLACE FUNCTION public.generate_beer_pong_bracket()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teams UUID[];
  v_team_count INTEGER;
  v_match_num INTEGER;
  v_round INTEGER;
  v_i INTEGER;
BEGIN
  -- Verify admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can generate brackets';
  END IF;

  -- Get all active beer pong teams, ordered randomly
  SELECT ARRAY_AGG(id ORDER BY RANDOM())
  INTO v_teams
  FROM tournament_teams
  WHERE tournament_type = 'beer_pong' AND status = 'active';

  v_team_count := ARRAY_LENGTH(v_teams, 1);

  IF v_team_count IS NULL OR v_team_count < 2 THEN
    RAISE EXCEPTION 'Need at least 2 teams to generate bracket';
  END IF;

  -- Delete existing matches for beer pong
  DELETE FROM tournament_matches
  WHERE team1_id IN (
    SELECT id FROM tournament_teams WHERE tournament_type = 'beer_pong'
  );

  -- Assign seed numbers
  FOR v_i IN 1..v_team_count LOOP
    UPDATE tournament_teams
    SET seed_number = v_i
    WHERE id = v_teams[v_i];
  END LOOP;

  -- Generate Round 1 matches
  v_match_num := 1;
  v_i := 1;
  WHILE v_i <= v_team_count LOOP
    -- Pair teams (1 vs 2, 3 vs 4, etc.)
    IF v_i + 1 <= v_team_count THEN
      INSERT INTO tournament_matches (
        team1_id,
        team2_id,
        round,
        bracket_position,
        status
      ) VALUES (
        v_teams[v_i],
        v_teams[v_i + 1],
        1,
        'R1-M' || v_match_num,
        'scheduled'
      );
      v_match_num := v_match_num + 1;
    ELSE
      -- Odd number of teams: bye for last team
      INSERT INTO tournament_matches (
        team1_id,
        team2_id,
        round,
        bracket_position,
        status,
        winner_id
      ) VALUES (
        v_teams[v_i],
        NULL,
        1,
        'R1-M' || v_match_num,
        'completed',
        v_teams[v_i]
      );
    END IF;
    v_i := v_i + 2;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Function to record match result (admin only)
CREATE OR REPLACE FUNCTION public.record_match_result(
  p_match_id UUID,
  p_winner_id UUID,
  p_team1_cups_remaining INTEGER,
  p_team2_cups_remaining INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_next_round INTEGER;
  v_next_match_num INTEGER;
BEGIN
  -- Verify admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can record match results';
  END IF;

  -- Get match details
  SELECT * INTO v_match
  FROM tournament_matches
  WHERE id = p_match_id;

  IF v_match IS NULL THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  -- Verify winner is one of the teams
  IF p_winner_id != v_match.team1_id AND p_winner_id != v_match.team2_id THEN
    RAISE EXCEPTION 'Winner must be one of the match teams';
  END IF;

  -- Update match
  UPDATE tournament_matches
  SET
    winner_id = p_winner_id,
    team1_score = CASE WHEN team1_id = p_winner_id
                       THEN 6 - p_team1_cups_remaining
                       ELSE 6 - p_team2_cups_remaining END,
    team2_score = CASE WHEN team2_id = p_winner_id
                       THEN 6 - p_team2_cups_remaining
                       ELSE 6 - p_team1_cups_remaining END,
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_match_id;

  -- Mark losing team as eliminated
  UPDATE tournament_teams
  SET
    status = 'eliminated',
    eliminated_at = NOW(),
    losses = losses + 1
  WHERE id != p_winner_id
    AND (id = v_match.team1_id OR id = v_match.team2_id);

  -- Update winner's record
  UPDATE tournament_teams
  SET wins = wins + 1
  WHERE id = p_winner_id;

  -- Check if this was the final match
  IF v_match.round >= 3 AND NOT EXISTS (
    SELECT 1 FROM tournament_matches
    WHERE round = v_match.round AND status = 'scheduled'
  ) THEN
    -- Mark winner as tournament champion
    UPDATE tournament_teams
    SET status = 'winner'
    WHERE id = p_winner_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- ================================================================
-- PUBLIC VIEWS
-- ================================================================

-- View for public beer pong teams (with display names)
CREATE OR REPLACE VIEW public.beer_pong_teams_public AS
SELECT
  t.id,
  t.team_name,
  t.team_slogan,
  t.profile_photo_url,
  t.wins,
  t.losses,
  t.seed_number,
  t.status,
  t.created_at,
  p_captain.display_name AS captain_name,
  p_partner.display_name AS partner_name
FROM tournament_teams t
LEFT JOIN profiles p_captain ON t.captain_id = p_captain.id
LEFT JOIN profiles p_partner ON t.partner_user_id = p_partner.id
WHERE t.tournament_type = 'beer_pong'
ORDER BY t.seed_number ASC NULLS LAST, t.created_at ASC;

-- Grant access to view
GRANT SELECT ON public.beer_pong_teams_public TO anon, authenticated;

-- View for public bracket display
CREATE OR REPLACE VIEW public.beer_pong_bracket_public AS
SELECT
  m.id,
  m.round,
  m.bracket_position,
  m.status,
  m.team1_score,
  m.team2_score,
  m.started_at,
  m.completed_at,
  t1.team_name AS team1_name,
  t1.profile_photo_url AS team1_photo,
  t2.team_name AS team2_name,
  t2.profile_photo_url AS team2_photo,
  tw.team_name AS winner_name,
  m.winner_id
FROM tournament_matches m
LEFT JOIN tournament_teams t1 ON m.team1_id = t1.id
LEFT JOIN tournament_teams t2 ON m.team2_id = t2.id
LEFT JOIN tournament_teams tw ON m.winner_id = tw.id
WHERE t1.tournament_type = 'beer_pong' OR t2.tournament_type = 'beer_pong' OR m.team1_id IS NULL
ORDER BY m.round ASC, m.bracket_position ASC;

-- Grant access to bracket view
GRANT SELECT ON public.beer_pong_bracket_public TO anon, authenticated;

COMMENT ON VIEW public.beer_pong_teams_public IS
  'Public view of beer pong teams with player display names (no PII)';

COMMENT ON VIEW public.beer_pong_bracket_public IS
  'Public view of tournament bracket for game day display';

-- ================================================================
-- RULE DISCUSSION & VOTING SYSTEM
-- ================================================================

-- Create table for rule proposals
CREATE TABLE IF NOT EXISTS public.beer_pong_rule_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'archived')),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for votes on rule proposals
CREATE TABLE IF NOT EXISTS public.beer_pong_rule_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES public.beer_pong_rule_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id) -- One vote per user per proposal
);

-- Enable RLS
ALTER TABLE public.beer_pong_rule_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beer_pong_rule_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rule proposals
CREATE POLICY "Anyone can view active rule proposals"
  ON public.beer_pong_rule_proposals FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Authenticated users can create rule proposals"
  ON public.beer_pong_rule_proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own proposals"
  ON public.beer_pong_rule_proposals FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all proposals"
  ON public.beer_pong_rule_proposals FOR ALL
  TO authenticated
  USING (public.is_admin());

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes"
  ON public.beer_pong_rule_votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.beer_pong_rule_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.beer_pong_rule_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to cast/change vote
CREATE OR REPLACE FUNCTION public.vote_on_rule_proposal(
  p_proposal_id UUID,
  p_vote_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_old_vote TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to vote';
  END IF;

  -- Check if user already voted
  SELECT vote_type INTO v_old_vote
  FROM beer_pong_rule_votes
  WHERE proposal_id = p_proposal_id AND user_id = v_user_id;

  IF v_old_vote IS NOT NULL THEN
    -- User already voted - update vote
    IF v_old_vote = p_vote_type THEN
      -- Same vote - remove it (toggle off)
      DELETE FROM beer_pong_rule_votes
      WHERE proposal_id = p_proposal_id AND user_id = v_user_id;

      -- Update counts
      IF p_vote_type = 'upvote' THEN
        UPDATE beer_pong_rule_proposals
        SET upvotes = upvotes - 1
        WHERE id = p_proposal_id;
      ELSE
        UPDATE beer_pong_rule_proposals
        SET downvotes = downvotes - 1
        WHERE id = p_proposal_id;
      END IF;
    ELSE
      -- Different vote - change it
      UPDATE beer_pong_rule_votes
      SET vote_type = p_vote_type, created_at = NOW()
      WHERE proposal_id = p_proposal_id AND user_id = v_user_id;

      -- Update counts (remove old, add new)
      IF p_vote_type = 'upvote' THEN
        UPDATE beer_pong_rule_proposals
        SET upvotes = upvotes + 1, downvotes = downvotes - 1
        WHERE id = p_proposal_id;
      ELSE
        UPDATE beer_pong_rule_proposals
        SET upvotes = upvotes - 1, downvotes = downvotes + 1
        WHERE id = p_proposal_id;
      END IF;
    END IF;
  ELSE
    -- New vote
    INSERT INTO beer_pong_rule_votes (proposal_id, user_id, vote_type)
    VALUES (p_proposal_id, v_user_id, p_vote_type);

    -- Update counts
    IF p_vote_type = 'upvote' THEN
      UPDATE beer_pong_rule_proposals
      SET upvotes = upvotes + 1
      WHERE id = p_proposal_id;
    ELSE
      UPDATE beer_pong_rule_proposals
      SET downvotes = downvotes + 1
      WHERE id = p_proposal_id;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- View for rule proposals with author info
CREATE OR REPLACE VIEW public.beer_pong_rules_public AS
SELECT
  p.id,
  p.title,
  p.description,
  p.status,
  p.upvotes,
  p.downvotes,
  p.upvotes - p.downvotes AS score,
  p.created_at,
  prof.display_name AS author_name
FROM beer_pong_rule_proposals p
LEFT JOIN profiles prof ON p.author_id = prof.id
WHERE p.status = 'active'
ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at DESC;

GRANT SELECT ON public.beer_pong_rules_public TO anon, authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rule_proposals_status ON public.beer_pong_rule_proposals(status);
CREATE INDEX IF NOT EXISTS idx_rule_votes_proposal ON public.beer_pong_rule_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_rule_votes_user ON public.beer_pong_rule_votes(user_id);
```

---

## 🎨 PART 3: TEAM REGISTRATION UI COMPONENT

**File**: `src/components/BeerPongRegistration.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

export function BeerPongRegistration() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [teamSlogan, setTeamSlogan] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    checkIfRegistered();
  }, [user]);

  const checkIfRegistered = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('tournament_teams')
      .select('*')
      .eq('tournament_type', 'beer_pong')
      .or(`captain_id.eq.${user.id},partner_user_id.eq.${user.id}`)
      .single();

    if (data) {
      setIsRegistered(true);
      setMyTeam(data);
      setTeamName(data.team_name);
      setTeamSlogan(data.team_slogan || '');
      setPhotoUrl(data.profile_photo_url);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    setUploadingPhoto(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('tournament-team-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tournament-team-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRegister = async () => {
    if (!teamName || !partnerEmail) {
      toast.error('Please fill in team name and partner email');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to register');
      return;
    }

    setLoading(true);

    try {
      // Upload photo first
      let uploadedPhotoUrl = photoUrl;
      if (photoFile) {
        uploadedPhotoUrl = await uploadPhoto();
        if (!uploadedPhotoUrl) {
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.rpc('register_beer_pong_team', {
        p_team_name: teamName,
        p_team_slogan: teamSlogan || null,
        p_partner_email: partnerEmail,
        p_photo_url: uploadedPhotoUrl || null
      });

      if (error) throw error;

      toast.success(`Team "${teamName}" registered successfully! 🏓`);
      setIsRegistered(true);
      await checkIfRegistered();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register team');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!myTeam || !user) return;

    setLoading(true);

    try {
      // Upload new photo if changed
      let uploadedPhotoUrl = photoUrl;
      if (photoFile) {
        uploadedPhotoUrl = await uploadPhoto();
        if (!uploadedPhotoUrl) {
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.rpc('update_beer_pong_team', {
        p_team_id: myTeam.id,
        p_team_name: teamName !== myTeam.team_name ? teamName : null,
        p_team_slogan: teamSlogan !== myTeam.team_slogan ? teamSlogan : null,
        p_photo_url: uploadedPhotoUrl !== photoUrl ? uploadedPhotoUrl : null
      });

      if (error) throw error;

      toast.success('Team updated successfully!');
      await checkIfRegistered();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 bg-bg-2 border-accent-purple/30">
        <p className="text-muted-foreground">Please log in to register a team</p>
      </Card>
    );
  }

  if (isRegistered && myTeam && myTeam.captain_id !== user.id) {
    // User is a partner, not captain (can't edit)
    return (
      <Card className="p-6 bg-bg-2 border-accent-gold/50">
        <h3 className="font-subhead text-xl text-accent-gold mb-2">
          ✅ You're Registered as a Partner!
        </h3>
        <p className="text-muted-foreground">
          Team: <strong>{myTeam.team_name}</strong><br />
          See you at 8:00 PM!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-bg-2 border-accent-purple/30">
      <h3 className="font-subhead text-2xl text-accent-gold mb-4">
        {isRegistered ? '✏️ Edit Your Team' : '🏓 Register Your Team'}
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="teamName">Team Name *</Label>
          <Input
            id="teamName"
            placeholder="e.g., Twisted Throwers"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={50}
            disabled={isRegistered}
          />
        </div>

        <div>
          <Label htmlFor="teamSlogan">Team Slogan (Optional)</Label>
          <Textarea
            id="teamSlogan"
            placeholder="e.g., We came, we saw, we ponged!"
            value={teamSlogan}
            onChange={(e) => setTeamSlogan(e.target.value)}
            maxLength={100}
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Max 100 characters
          </p>
        </div>

        {!isRegistered && (
          <div>
            <Label htmlFor="partnerEmail">Partner's Email *</Label>
            <Input
              id="partnerEmail"
              type="email"
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your partner must have an account and RSVP'd to the event
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="photo">Team Photo (Optional)</Label>
          <div className="mt-2">
            {(photoPreview || photoUrl) ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview || photoUrl || ''}
                  alt="Team photo preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-accent-purple/50"
                />
                <button
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    if (isRegistered) setPhotoUrl(myTeam?.profile_photo_url);
                  }}
                  className="absolute -top-2 -right-2 bg-accent-red text-white rounded-full p-1 hover:bg-accent-red/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-accent-purple/50 rounded-lg cursor-pointer hover:border-accent-gold/50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                </div>
              </label>
            )}
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Max 2MB. PNG, JPG, WebP, or GIF.
          </p>
        </div>

        <Button
          onClick={isRegistered ? handleUpdateTeam : handleRegister}
          disabled={loading || uploadingPhoto}
          className="w-full bg-accent-gold text-bg hover:bg-accent-gold/90"
        >
          {loading || uploadingPhoto
            ? (uploadingPhoto ? 'Uploading photo...' : 'Saving...')
            : (isRegistered ? 'Update Team' : 'Register Team')}
        </Button>
      </div>
    </Card>
  );
}
```

---

## 👥 PART 4: TEAMS LIST COMPONENT

**File**: `src/components/BeerPongTeamsList.tsx`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';

interface BeerPongTeam {
  id: string;
  team_name: string;
  team_slogan: string | null;
  profile_photo_url: string | null;
  captain_name: string;
  partner_name: string;
  wins: number;
  losses: number;
  seed_number: number | null;
  status: string;
  created_at: string;
}

export function BeerPongTeamsList() {
  const [teams, setTeams] = useState<BeerPongTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('beer_pong_teams_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_teams',
          filter: 'tournament_type=eq.beer_pong'
        },
        () => {
          loadTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('beer_pong_teams_public')
      .select('*');

    if (error) {
      console.error('Error loading teams:', error);
    } else {
      setTeams(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading teams...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center p-8 bg-bg rounded-lg border border-accent-purple/30">
        <p className="text-muted-foreground">
          No teams registered yet. Be the first to register!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-subhead text-2xl text-accent-purple mb-4">
        Registered Teams ({teams.length}/20)
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map((team) => (
          <Card
            key={team.id}
            className="p-4 bg-bg border-accent-purple/30 hover:border-accent-gold/50 transition-colors relative overflow-hidden"
          >
            {team.status === 'winner' && (
              <div className="absolute top-2 right-2">
                <Trophy className="w-6 h-6 text-accent-gold" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {team.profile_photo_url ? (
                <img
                  src={team.profile_photo_url}
                  alt={team.team_name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-accent-purple/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-accent-purple/20 flex items-center justify-center border-2 border-accent-purple/50">
                  <Users className="w-8 h-8 text-accent-purple" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-subhead text-lg text-accent-gold truncate">
                  {team.team_name}
                </h4>
                {team.team_slogan && (
                  <p className="text-xs italic text-accent-purple mb-1 line-clamp-2">
                    "{team.team_slogan}"
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {team.captain_name} & {team.partner_name}
                </p>
                {(team.wins > 0 || team.losses > 0) && (
                  <p className="text-xs text-accent-green mt-1">
                    {team.wins}W - {team.losses}L
                  </p>
                )}
                {team.seed_number && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Seed #{team.seed_number}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teams.length >= 20 && (
        <p className="text-center text-accent-red mt-4 font-bold">
          🚫 Tournament Full - Registration Closed
        </p>
      )}
    </div>
  );
}
```

---

## 🎮 PART 5: ADMIN BRACKET MANAGEMENT

**File**: `src/components/admin/BeerPongBracketManagement.tsx`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Trophy, Play } from 'lucide-react';

interface Match {
  id: string;
  round: number;
  bracket_position: string;
  status: string;
  team1_name: string | null;
  team1_photo: string | null;
  team2_name: string | null;
  team2_photo: string | null;
  team1_score: number;
  team2_score: number;
  winner_name: string | null;
  winner_id: string | null;
  team1_id: string;
  team2_id: string;
}

export function BeerPongBracketManagement() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [team1Cups, setTeam1Cups] = useState(6);
  const [team2Cups, setTeam2Cups] = useState(6);

  useEffect(() => {
    loadBracket();

    // Real-time updates
    const channel = supabase
      .channel('bracket_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_matches' },
        () => loadBracket()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBracket = async () => {
    const { data, error } = await supabase
      .from('beer_pong_bracket_public')
      .select('*');

    if (error) {
      console.error('Error loading bracket:', error);
    } else {
      setMatches(data || []);
    }
  };

  const generateBracket = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('generate_beer_pong_bracket');

      if (error) throw error;

      toast.success('Bracket generated successfully!');
      await loadBracket();
    } catch (error: any) {
      console.error('Bracket generation error:', error);
      toast.error(error.message || 'Failed to generate bracket');
    } finally {
      setLoading(false);
    }
  };

  const recordResult = async () => {
    if (!selectedMatch) return;

    // Determine winner based on cups remaining
    const winnerId = team1Cups < team2Cups
      ? selectedMatch.team1_id
      : selectedMatch.team2_id;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('record_match_result', {
        p_match_id: selectedMatch.id,
        p_winner_id: winnerId,
        p_team1_cups_remaining: team1Cups,
        p_team2_cups_remaining: team2Cups
      });

      if (error) throw error;

      toast.success('Match result recorded!');
      setSelectedMatch(null);
      setTeam1Cups(6);
      setTeam2Cups(6);
      await loadBracket();
    } catch (error: any) {
      console.error('Record result error:', error);
      toast.error(error.message || 'Failed to record result');
    } finally {
      setLoading(false);
    }
  };

  const groupByRound = (matches: Match[]) => {
    const grouped: { [key: number]: Match[] } = {};
    matches.forEach((match) => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    return grouped;
  };

  const rounds = groupByRound(matches);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl text-accent-gold">
          Beer Pong Bracket Management
        </h2>
        <Button
          onClick={generateBracket}
          disabled={loading || matches.length > 0}
          className="bg-accent-purple hover:bg-accent-purple/80"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate Bracket
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card className="p-8 text-center bg-bg-2 border-accent-purple/30">
          <p className="text-muted-foreground">
            No bracket generated yet. Click "Generate Bracket" to create the tournament bracket.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.keys(rounds)
            .map(Number)
            .sort((a, b) => a - b)
            .map((roundNum) => (
              <div key={roundNum}>
                <h3 className="font-subhead text-xl text-accent-purple mb-4">
                  Round {roundNum}
                  {roundNum === Math.max(...Object.keys(rounds).map(Number)) &&
                    matches.some((m) => m.status === 'completed' && m.round === roundNum) &&
                    ' - FINALS 🏆'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {rounds[roundNum].map((match) => (
                    <Card
                      key={match.id}
                      className={`p-4 bg-bg border-2 ${
                        match.status === 'completed'
                          ? 'border-accent-green/50'
                          : selectedMatch?.id === match.id
                          ? 'border-accent-gold'
                          : 'border-accent-purple/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-mono text-muted-foreground">
                          {match.bracket_position}
                        </span>
                        {match.status === 'completed' && (
                          <Trophy className="w-5 h-5 text-accent-gold" />
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Team 1 */}
                        <div
                          className={`flex items-center gap-2 p-2 rounded ${
                            match.winner_id === match.team1_id
                              ? 'bg-accent-gold/20 border-2 border-accent-gold'
                              : 'bg-bg-2'
                          }`}
                        >
                          {match.team1_photo && (
                            <img
                              src={match.team1_photo}
                              alt={match.team1_name || ''}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate">
                            {match.team1_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="font-bold">{match.team1_score}</span>
                          )}
                        </div>

                        {/* Team 2 */}
                        <div
                          className={`flex items-center gap-2 p-2 rounded ${
                            match.winner_id === match.team2_id
                              ? 'bg-accent-gold/20 border-2 border-accent-gold'
                              : 'bg-bg-2'
                          }`}
                        >
                          {match.team2_photo && (
                            <img
                              src={match.team2_photo}
                              alt={match.team2_name || ''}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate">
                            {match.team2_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="font-bold">{match.team2_score}</span>
                          )}
                        </div>
                      </div>

                      {match.status === 'scheduled' && match.team1_name && match.team2_name && (
                        <Button
                          onClick={() => setSelectedMatch(match)}
                          className="w-full mt-3 bg-accent-purple hover:bg-accent-purple/80"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Record Result
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Record Result Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="p-6 bg-bg-2 border-accent-gold w-full max-w-md">
            <h3 className="font-subhead text-xl text-accent-gold mb-4">
              Record Match Result
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Cups Remaining - {selectedMatch.team1_name}</Label>
                <Input
                  type="number"
                  min="0"
                  max="6"
                  value={team1Cups}
                  onChange={(e) => setTeam1Cups(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Cups Remaining - {selectedMatch.team2_name}</Label>
                <Input
                  type="number"
                  min="0"
                  max="6"
                  value={team2Cups}
                  onChange={(e) => setTeam2Cups(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="bg-accent-purple/20 p-3 rounded">
                <p className="text-sm">
                  Winner:{' '}
                  <strong className="text-accent-gold">
                    {team1Cups < team2Cups
                      ? selectedMatch.team1_name
                      : team2Cups < team1Cups
                      ? selectedMatch.team2_name
                      : 'Tied - adjust cups'}
                  </strong>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={recordResult}
                  disabled={loading || team1Cups === team2Cups}
                  className="flex-1 bg-accent-gold hover:bg-accent-gold/90"
                >
                  Save Result
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMatch(null);
                    setTeam1Cups(6);
                    setTeam2Cups(6);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
```

---

## 📺 PART 6: PUBLIC BRACKET DISPLAY

**File**: `src/components/BeerPongBracketDisplay.tsx`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Trophy, Clock } from 'lucide-react';

interface Match {
  id: string;
  round: number;
  bracket_position: string;
  status: string;
  team1_name: string | null;
  team1_photo: string | null;
  team2_name: string | null;
  team2_photo: string | null;
  team1_score: number;
  team2_score: number;
  winner_name: string | null;
  winner_id: string | null;
  team1_id: string;
  team2_id: string;
}

export function BeerPongBracketDisplay() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBracket();

    // Real-time updates
    const channel = supabase
      .channel('bracket_display_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_matches' },
        () => loadBracket()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBracket = async () => {
    const { data, error } = await supabase
      .from('beer_pong_bracket_public')
      .select('*');

    if (error) {
      console.error('Error loading bracket:', error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading bracket...</div>;
  }

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center bg-bg-2 border-accent-purple/30">
        <p className="text-muted-foreground">
          Bracket will appear here once tournament starts!
        </p>
      </Card>
    );
  }

  const groupByRound = (matches: Match[]) => {
    const grouped: { [key: number]: Match[] } = {};
    matches.forEach((match) => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    return grouped;
  };

  const rounds = groupByRound(matches);
  const maxRound = Math.max(...Object.keys(rounds).map(Number));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-heading text-3xl text-accent-gold mb-2">
          Tournament Bracket
        </h3>
        <p className="text-muted-foreground">
          Live updates • Single elimination • Winner takes home the trophy!
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-8">
          {Object.keys(rounds)
            .map(Number)
            .sort((a, b) => a - b)
            .map((roundNum) => (
              <div key={roundNum}>
                <h4 className="font-subhead text-xl text-accent-purple mb-4">
                  {roundNum === maxRound && rounds[roundNum].some((m) => m.status === 'completed')
                    ? '🏆 FINALS'
                    : `Round ${roundNum}`}
                </h4>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rounds[roundNum].map((match) => (
                    <Card
                      key={match.id}
                      className={`p-4 bg-bg border-2 ${
                        match.status === 'completed'
                          ? 'border-accent-green/50'
                          : match.status === 'in_progress'
                          ? 'border-accent-gold animate-pulse'
                          : 'border-accent-purple/30'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono text-muted-foreground">
                          {match.bracket_position}
                        </span>
                        {match.status === 'in_progress' && (
                          <span className="flex items-center gap-1 text-xs text-accent-gold">
                            <Clock className="w-3 h-3" />
                            Live
                          </span>
                        )}
                        {match.status === 'completed' && (
                          <Trophy className="w-4 h-4 text-accent-gold" />
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Team 1 */}
                        <div
                          className={`flex items-center gap-2 p-2 rounded ${
                            match.winner_id === match.team1_id
                              ? 'bg-accent-gold/30 border-2 border-accent-gold'
                              : 'bg-bg-2'
                          }`}
                        >
                          {match.team1_photo && (
                            <img
                              src={match.team1_photo}
                              alt={match.team1_name || ''}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate text-sm">
                            {match.team1_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="font-bold text-accent-gold">
                              {match.team1_score}
                            </span>
                          )}
                        </div>

                        {/* Team 2 */}
                        <div
                          className={`flex items-center gap-2 p-2 rounded ${
                            match.winner_id === match.team2_id
                              ? 'bg-accent-gold/30 border-2 border-accent-gold'
                              : 'bg-bg-2'
                          }`}
                        >
                          {match.team2_photo && (
                            <img
                              src={match.team2_photo}
                              alt={match.team2_name || ''}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate text-sm">
                            {match.team2_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="font-bold text-accent-gold">
                              {match.team2_score}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ⏱️ PART 7: TOURNAMENT TIME CALCULATOR

**File**: `src/components/admin/TournamentTimeCalculator.tsx`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Trophy } from 'lucide-react';

export function TournamentTimeCalculator() {
  const [teamCount, setTeamCount] = useState(0);
  const [useShortGames, setUseShortGames] = useState(false); // false = 5min, true = 4min
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamCount();

    // Subscribe to team changes
    const channel = supabase
      .channel('team_count_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_teams',
          filter: 'tournament_type=eq.beer_pong'
        },
        () => loadTeamCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTeamCount = async () => {
    const { data, error } = await supabase
      .from('tournament_teams')
      .select('id', { count: 'exact' })
      .eq('tournament_type', 'beer_pong')
      .neq('status', 'eliminated');

    if (!error && data) {
      setTeamCount(data.length);
    }
    setLoading(false);
  };

  // Calculate tournament structure
  const calculateTournament = () => {
    if (teamCount < 2) {
      return {
        rounds: 0,
        totalMatches: 0,
        matchesByRound: [],
        estimatedTime: 0,
        formattedTime: '0h 0m'
      };
    }

    const gameMinutes = useShortGames ? 4 : 5;
    const setupMinutes = 2; // Time between matches
    const totalMinutesPerMatch = gameMinutes + setupMinutes;

    // Calculate rounds needed (log2 of team count, rounded up)
    const rounds = Math.ceil(Math.log2(teamCount));

    // Calculate matches per round
    const matchesByRound: number[] = [];
    let remainingTeams = teamCount;

    for (let r = 0; r < rounds; r++) {
      const matchesThisRound = Math.floor(remainingTeams / 2);
      matchesByRound.push(matchesThisRound);

      // Account for odd number of teams (byes)
      const teamsWithByes = remainingTeams % 2;
      remainingTeams = matchesThisRound + teamsWithByes;
    }

    const totalMatches = matchesByRound.reduce((sum, m) => sum + m, 0);
    const estimatedMinutes = totalMatches * totalMinutesPerMatch;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;

    return {
      rounds,
      totalMatches,
      matchesByRound,
      estimatedTime: estimatedMinutes,
      formattedTime: `${hours}h ${minutes}m`
    };
  };

  const tournament = calculateTournament();

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-bg-2 to-bg border-accent-gold/50">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-accent-gold" />
        <h3 className="font-subhead text-2xl text-accent-gold">
          Tournament Time Estimator
        </h3>
      </div>

      {/* Team Count */}
      <div className="mb-6 p-4 bg-bg rounded-lg border border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-purple" />
            <span className="font-subhead text-lg">Registered Teams</span>
          </div>
          <span className="text-3xl font-bold text-accent-gold">
            {teamCount} / 20
          </span>
        </div>
      </div>

      {/* Game Time Toggle */}
      <div className="mb-6 p-4 bg-bg rounded-lg border border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="game-time" className="text-base font-subhead">
              Game Duration
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {useShortGames ? '4 minutes' : '5 minutes'} per game
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!useShortGames ? 'text-accent-gold font-bold' : 'text-muted-foreground'}`}>
              5 min
            </span>
            <Switch
              id="game-time"
              checked={useShortGames}
              onCheckedChange={setUseShortGames}
            />
            <span className={`text-sm ${useShortGames ? 'text-accent-gold font-bold' : 'text-muted-foreground'}`}>
              4 min
            </span>
          </div>
        </div>
      </div>

      {/* Tournament Summary */}
      {teamCount >= 2 ? (
        <div className="space-y-4">
          {/* Total Time */}
          <div className="p-5 bg-accent-gold/10 rounded-lg border-2 border-accent-gold">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Estimated Total Time
                </p>
                <p className="text-4xl font-bold text-accent-gold">
                  {tournament.formattedTime}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-accent-gold/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Includes {useShortGames ? 4 : 5} min games + 2 min setup between matches
            </p>
          </div>

          {/* Round Breakdown */}
          <div className="p-4 bg-bg rounded-lg border border-accent-purple/30">
            <h4 className="font-subhead text-sm text-accent-purple mb-3">
              Round Breakdown
            </h4>
            <div className="space-y-2">
              {tournament.matchesByRound.map((matches, index) => {
                const roundTime = matches * (useShortGames ? 4 : 5) + matches * 2;
                const roundName = index === tournament.rounds - 1
                  ? 'Finals'
                  : `Round ${index + 1}`;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {roundName}: {matches} {matches === 1 ? 'match' : 'matches'}
                    </span>
                    <span className="text-accent-gold font-mono">
                      ~{roundTime} min
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-bg rounded border border-accent-purple/30 text-center">
              <p className="text-2xl font-bold text-accent-gold">
                {tournament.rounds}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Rounds</p>
            </div>
            <div className="p-3 bg-bg rounded border border-accent-purple/30 text-center">
              <p className="text-2xl font-bold text-accent-gold">
                {tournament.totalMatches}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Matches</p>
            </div>
            <div className="p-3 bg-bg rounded border border-accent-purple/30 text-center">
              <p className="text-2xl font-bold text-accent-gold">
                {useShortGames ? '4' : '5'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Min/Game</p>
            </div>
          </div>

          {/* Time Window Recommendation */}
          {tournament.estimatedTime > 120 && (
            <div className="p-4 bg-accent-red/10 rounded-lg border border-accent-red/30">
              <p className="text-sm text-accent-red font-semibold">
                ⚠️ Tournament may run long
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Consider using 4-minute games to keep within 2-hour window
              </p>
            </div>
          )}

          {tournament.estimatedTime <= 90 && (
            <div className="p-4 bg-accent-green/10 rounded-lg border border-accent-green/30">
              <p className="text-sm text-accent-green font-semibold">
                ✓ Perfect timing!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tournament fits comfortably in a 90-120 minute window
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>Waiting for teams to register...</p>
          <p className="text-sm mt-2">
            Time estimate will appear once at least 2 teams are registered
          </p>
        </div>
      )}
    </Card>
  );
}
```

---

## 💬 PART 8: RULE DISCUSSION & VOTING COMPONENT

**File**: `src/components/BeerPongRuleDiscussion.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ThumbsUp, ThumbsDown, MessageSquarePlus, TrendingUp } from 'lucide-react';

interface RuleProposal {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  score: number;
  author_name: string;
  created_at: string;
}

interface UserVote {
  proposal_id: string;
  vote_type: 'upvote' | 'downvote';
}

export function BeerPongRuleDiscussion() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<RuleProposal[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProposals();
    if (user) {
      loadUserVotes();
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel('rule_proposals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beer_pong_rule_proposals'
        },
        () => loadProposals()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beer_pong_rule_votes'
        },
        () => {
          loadProposals();
          if (user) loadUserVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadProposals = async () => {
    const { data, error } = await supabase
      .from('beer_pong_rules_public')
      .select('*');

    if (error) {
      console.error('Error loading proposals:', error);
    } else {
      setProposals(data || []);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('beer_pong_rule_votes')
      .select('proposal_id, vote_type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading user votes:', error);
    } else {
      setUserVotes(data || []);
    }
  };

  const getUserVote = (proposalId: string): 'upvote' | 'downvote' | null => {
    const vote = userVotes.find((v) => v.proposal_id === proposalId);
    return vote ? vote.vote_type : null;
  };

  const handleVote = async (proposalId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const { error } = await supabase.rpc('vote_on_rule_proposal', {
        p_proposal_id: proposalId,
        p_vote_type: voteType
      });

      if (error) throw error;

      // Refresh votes
      await loadUserVotes();
      await loadProposals();
    } catch (error: any) {
      console.error('Vote error:', error);
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleSubmitProposal = async () => {
    if (!title || !description) {
      toast.error('Please fill in both title and description');
      return;
    }

    if (!user) {
      toast.error('Please log in to submit a proposal');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('beer_pong_rule_proposals')
        .insert({
          author_id: user.id,
          title: title.trim(),
          description: description.trim(),
          status: 'active'
        });

      if (error) throw error;

      toast.success('Rule proposal submitted!');
      setTitle('');
      setDescription('');
      setShowNewProposal(false);
      await loadProposals();
    } catch (error: any) {
      console.error('Proposal submission error:', error);
      toast.error(error.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-2xl text-accent-purple">
            Rule Proposals & Discussion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Suggest rule changes or enhancements for next year
          </p>
        </div>
        {user && (
          <Button
            onClick={() => setShowNewProposal(!showNewProposal)}
            className="bg-accent-purple hover:bg-accent-purple/80"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Propose Rule
          </Button>
        )}
      </div>

      {/* New Proposal Form */}
      {showNewProposal && (
        <Card className="p-6 bg-bg-2 border-accent-purple/50">
          <h4 className="font-subhead text-lg text-accent-gold mb-4">
            Submit a Rule Proposal
          </h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-title">Rule Title *</Label>
              <Input
                id="rule-title"
                placeholder="e.g., Add redemption round after sudden death"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="rule-description">Description *</Label>
              <Textarea
                id="rule-description"
                placeholder="Explain the rule change and why it would improve the tournament..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/500 characters
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitProposal}
                disabled={loading || !title || !description}
                className="bg-accent-gold hover:bg-accent-gold/90"
              >
                Submit Proposal
              </Button>
              <Button
                onClick={() => {
                  setShowNewProposal(false);
                  setTitle('');
                  setDescription('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <Card className="p-8 text-center bg-bg-2 border-accent-purple/30">
          <p className="text-muted-foreground">
            No rule proposals yet. Be the first to suggest an improvement!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const userVote = getUserVote(proposal.id);
            return (
              <Card
                key={proposal.id}
                className="p-5 bg-bg border-accent-purple/30 hover:border-accent-gold/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Vote Controls */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote(proposal.id, 'upvote')}
                      disabled={!user}
                      className={`p-2 rounded transition-colors ${
                        userVote === 'upvote'
                          ? 'bg-accent-green text-white'
                          : 'bg-bg-2 text-muted-foreground hover:text-accent-green hover:bg-accent-green/20'
                      }`}
                      title={user ? 'Upvote' : 'Log in to vote'}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className={`font-bold text-lg ${
                      proposal.score > 0 ? 'text-accent-green' :
                      proposal.score < 0 ? 'text-accent-red' :
                      'text-muted-foreground'
                    }`}>
                      {proposal.score > 0 ? '+' : ''}{proposal.score}
                    </span>
                    <button
                      onClick={() => handleVote(proposal.id, 'downvote')}
                      disabled={!user}
                      className={`p-2 rounded transition-colors ${
                        userVote === 'downvote'
                          ? 'bg-accent-red text-white'
                          : 'bg-bg-2 text-muted-foreground hover:text-accent-red hover:bg-accent-red/20'
                      }`}
                      title={user ? 'Downvote' : 'Log in to vote'}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Proposal Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-subhead text-lg text-accent-gold mb-2">
                      {proposal.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        By <strong>{proposal.author_name || 'Anonymous'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                      {proposal.score >= 5 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-accent-gold font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            Popular
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!user && (
        <Card className="p-4 bg-accent-purple/10 border-accent-purple/30">
          <p className="text-sm text-center text-muted-foreground">
            <strong className="text-accent-purple">Log in</strong> to vote on proposals or submit your own ideas
          </p>
        </Card>
      )}
    </div>
  );
}
```

---

## 📅 PART 9: UPDATE SCHEDULE PAGE

**File**: `src/pages/Schedule.tsx` (add after existing schedule items)

```typescript
import { BeerPongRegistration } from '@/components/BeerPongRegistration';
import { BeerPongTeamsList } from '@/components/BeerPongTeamsList';
import { BeerPongBracketDisplay } from '@/components/BeerPongBracketDisplay';
import { BeerPongRuleDiscussion } from '@/components/BeerPongRuleDiscussion';

// ... existing imports and schedule code ...

// Add this section AFTER the schedule timeline, BEFORE "Important Notes":

{/* Beer Pong Tournament Section */}
<div className="mt-16 bg-bg-2 p-8 rounded-lg border-2 border-accent-gold/50">
  <h2 className="font-heading text-3xl text-accent-gold mb-2 text-center">
    🏓 Speed Beer Pong Tournament
  </h2>
  <p className="font-body text-muted-foreground text-center mb-6">
    Starts at <strong className="text-accent-gold">8:00 PM</strong> •
    Max 20 Teams • 2 Players Per Team • Water Only • 5-Min Games
  </p>

  <div className="grid lg:grid-cols-2 gap-8 mb-8">
    {/* Registration Form */}
    <div>
      <BeerPongRegistration />
    </div>

    {/* Tournament Rules */}
    <Card className="p-6 bg-bg border-accent-purple/30">
      <h3 className="font-subhead text-xl text-accent-red mb-3">
        Lightning Rules ⚡
      </h3>
      <div className="space-y-3 text-sm text-muted-foreground">
        <div>
          <strong className="text-accent-gold">Format:</strong> Single-elimination bracket
        </div>
        <div>
          <strong className="text-accent-gold">Game Time:</strong> 5 minutes max
        </div>
        <div>
          <strong className="text-accent-gold">Sudden Death:</strong> At 4:00 mark if still playing
          <ul className="ml-4 mt-1 space-y-1 text-xs">
            <li>• Team with fewer cups calls coin flip</li>
            <li>• Winner chooses to go first/second</li>
            <li>• Each player throws = opponent's cup count</li>
            <li>• No defense allowed in sudden death</li>
          </ul>
        </div>
        <div>
          <strong className="text-accent-gold">Cups:</strong> 6-cup triangle (water only)
        </div>
        <div>
          <strong className="text-accent-gold">Re-Racks:</strong> 1 per game (at 4, 3, or 2 cups)
        </div>
        <div>
          <strong className="text-accent-gold">Bounce Shots:</strong> Defender can swat
        </div>
        <div>
          <strong className="text-accent-gold">Prize:</strong> Trophies for winning team! 🏆
        </div>
      </div>
    </Card>
  </div>

  {/* Registered Teams */}
  <BeerPongTeamsList />

  {/* Bracket Display (visible once generated) */}
  <div className="mt-8">
    <BeerPongBracketDisplay />
  </div>

  {/* Rule Discussion Section */}
  <div className="mt-12">
    <BeerPongRuleDiscussion />
  </div>
</div>
```

---

## 🔧 PART 10: ADMIN DASHBOARD INTEGRATION

**File**: `src/pages/AdminDashboard.tsx` (add to admin tabs)

```typescript
import { BeerPongBracketManagement } from '@/components/admin/BeerPongBracketManagement';
import { TournamentTimeCalculator } from '@/components/admin/TournamentTimeCalculator';

// Add a new tab for Beer Pong management:

<TabsContent value="beer-pong">
  <div className="space-y-8">
    {/* Time Calculator at the top */}
    <TournamentTimeCalculator />

    {/* Bracket Management below */}
    <BeerPongBracketManagement />
  </div>
</TabsContent>
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Database Setup
- [ ] Create migration: `supabase/migrations/20251021180000_beer_pong_teams_v2.sql`
- [ ] Test migration locally with `supabase db reset`
- [ ] Verify storage bucket created for team photos
- [ ] Test `register_beer_pong_team` function
- [ ] Test `update_beer_pong_team` function
- [ ] Test `generate_beer_pong_bracket` function
- [ ] Test `record_match_result` function
- [ ] Verify rule proposals tables created
- [ ] Test `vote_on_rule_proposal` function (upvote, downvote, toggle)
- [ ] Test RLS policies for rule proposals
- [ ] Deploy migration to production

### Phase 2: Team Registration UI
- [ ] Create `src/components/BeerPongRegistration.tsx`
- [ ] Add photo upload functionality
- [ ] Test file size/type validation (2MB, images only)
- [ ] Test partner email validation
- [ ] Test duplicate team prevention
- [ ] Test team editing (captain only)

### Phase 3: Team Display
- [ ] Create `src/components/BeerPongTeamsList.tsx`
- [ ] Test real-time updates when teams register
- [ ] Test photo display with fallback
- [ ] Test slogan display
- [ ] Test mobile responsiveness

### Phase 4: Bracket Management (Admin)
- [ ] Create `src/components/admin/BeerPongBracketManagement.tsx`
- [ ] Test bracket generation with various team counts (2, 4, 8, 16, 20)
- [ ] Test odd number of teams (byes)
- [ ] Test match result recording
- [ ] Test winner advancement to next round
- [ ] Test real-time updates

### Phase 5: Public Bracket Display
- [ ] Create `src/components/BeerPongBracketDisplay.tsx`
- [ ] Test real-time match updates
- [ ] Test responsive layout
- [ ] Test empty state (before bracket generated)

### Phase 6: Tournament Time Calculator (Admin)
- [ ] Create `src/components/admin/TournamentTimeCalculator.tsx`
- [ ] Test team count real-time updates
- [ ] Test 4-min vs 5-min toggle calculations
- [ ] Verify round breakdown accuracy with various team counts
- [ ] Test time window warnings (>120min, <90min)
- [ ] Test mobile responsiveness

### Phase 7: Rule Discussion & Voting System
- [ ] Create `src/components/BeerPongRuleDiscussion.tsx`
- [ ] Test rule proposal submission
- [ ] Test upvote/downvote mechanics
- [ ] Test vote toggle (click same vote to remove)
- [ ] Test real-time updates across browsers
- [ ] Test sorting by score (top-voted first)
- [ ] Test login prompts for anonymous users

### Phase 8: Schedule Page Integration
- [ ] Update `src/pages/Schedule.tsx`
- [ ] Add all new components (registration, teams, bracket, rules)
- [ ] Test layout on mobile
- [ ] Test rule discussion section positioning
- [ ] Test accessibility

### Phase 9: Admin Dashboard Integration
- [ ] Add BeerPongBracketManagement to admin tabs
- [ ] Add TournamentTimeCalculator above bracket management
- [ ] Test admin permissions
- [ ] Test bracket generation from admin panel
- [ ] Test time calculator visibility and accuracy

### Phase 10: Testing & Polish
- [ ] End-to-end test: register 2 teams, generate bracket, record results
- [ ] Test with 20 teams (full tournament)
- [ ] Test photo uploads from mobile
- [ ] Test slogan editing
- [ ] Test real-time updates across multiple browsers
- [ ] Test admin bracket management on tablets
- [ ] Test time calculator with odd numbers (3, 5, 7, 11, 13 teams)
- [ ] Test rule voting from multiple accounts
- [ ] Test rule proposal character limits

### Phase 11: Documentation & Training
- [ ] Print physical rules sheet for tournament day
- [ ] Create admin guide for running tournament
- [ ] Document how to use time calculator to decide game duration
- [ ] Document how to moderate rule proposals (admin panel)
- [ ] Test backup plan if tech fails (paper bracket)

---

## 📊 TOURNAMENT TIMELINE (5-MINUTE GAMES)

**Assuming 20 teams**:
- **Round 1** (10 matches): ~50 min (5 min per game)
- **Round 2** (5 matches): ~25 min
- **Round 3** (2-3 matches): ~15 min
- **Finals** (1 match): ~5 min
- **Total**: ~1.5 hours (fits 8:00 PM - 9:30 PM)

With setup/transitions: **~2 hours max** (8:00 PM - 10:00 PM)

---

## ✅ SUMMARY

This comprehensive implementation plan (v3) provides:

### Core Features
1. **Ultra-fast 5-minute games** with 4-minute sudden death trigger
2. **Coin flip sudden death mechanic** with throw count = opponent cups
3. **Custom photo uploads** (2MB max) + team slogans (100 chars)
4. **Full admin bracket management** with generation, seeding, and scoring
5. **Public bracket display** with real-time updates and mobile-friendly tree view

### New Features (v3)
6. **Tournament Time Calculator** (Admin Dashboard):
   - Real-time team count tracking
   - Toggle between 4-min and 5-min game durations
   - Automatic round/match calculation
   - Time window warnings (>2 hours, <90 minutes)
   - Round-by-round breakdown

7. **Enhanced Bracket Management**:
   - Easy winner/loser recording
   - "Up next" match visibility
   - Mobile-optimized admin controls
   - Real-time bracket updates across all devices

8. **Rule Discussion & Voting System**:
   - Community rule proposals (title + description)
   - Upvote/downvote mechanics
   - Toggle votes (click again to remove)
   - Popular proposal highlighting (5+ score)
   - Real-time vote updates
   - Admin moderation controls

### Technical Implementation
9. **Complete database schema** with:
   - Storage bucket for photos with RLS policies
   - Rule proposals and votes tables
   - 6 PostgreSQL functions (registration, bracket, voting)
   - Public views for safe data exposure
   - Indexes for performance

10. **8 React components** ready to implement:
    - BeerPongRegistration.tsx
    - BeerPongTeamsList.tsx
    - BeerPongBracketManagement.tsx (admin)
    - BeerPongBracketDisplay.tsx (public)
    - TournamentTimeCalculator.tsx (admin)
    - BeerPongRuleDiscussion.tsx (public)
    - Plus Schedule and AdminDashboard integrations

**Estimated Development Time**: 14-16 hours
**Estimated Testing Time**: 4-5 hours

**Total Implementation**: ~3 full days (2 days coding + 1 day testing)

**Key Benefits**:
- ⏱️ Keeps tournament under 2 hours with time calculator
- 📱 Fully mobile-responsive for game day viewing
- 🗳️ Community-driven rule improvements for next year
- 🔄 Real-time updates across all features
- 🔒 Secure with RLS policies and admin-only functions

Ready to implement! 🏓👻⚡