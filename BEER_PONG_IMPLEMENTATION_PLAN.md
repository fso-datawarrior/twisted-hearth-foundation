# SPEED BEER PONG TOURNAMENT - IMPLEMENTATION PLAN (v2)

**Project**: Add Beer Pong Tournament Registration & Management
**Branch**: `prod-2025.partytillyou.rip`
**Created**: 2025-10-21
**Updated**: 2025-10-21 (v2 - 5-minute games, custom photos, admin brackets)

---

## 🎯 OBJECTIVES

1. Implement **ultra-fast 5-minute max games** with 4-minute sudden death trigger
2. Enable team registration for 2-person teams (max 20 teams)
3. Allow teams to **upload custom photos** and add **team slogans**
4. **Admin bracket management**: generate brackets, record scores, manage matches
5. **Public bracket display** for game day viewing
6. Display registered teams on the Schedule page with live updates

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

## 📅 PART 7: UPDATE SCHEDULE PAGE

**File**: `src/pages/Schedule.tsx` (add after existing schedule items)

```typescript
import { BeerPongRegistration } from '@/components/BeerPongRegistration';
import { BeerPongTeamsList } from '@/components/BeerPongTeamsList';
import { BeerPongBracketDisplay } from '@/components/BeerPongBracketDisplay';

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
</div>
```

---

## 🔧 PART 8: ADMIN DASHBOARD INTEGRATION

**File**: `src/pages/AdminDashboard.tsx` (add to admin tabs)

```typescript
import { BeerPongBracketManagement } from '@/components/admin/BeerPongBracketManagement';

// Add a new tab for Beer Pong management:

<TabsContent value="beer-pong">
  <BeerPongBracketManagement />
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

### Phase 6: Schedule Page Integration
- [ ] Update `src/pages/Schedule.tsx`
- [ ] Add all new components
- [ ] Test layout on mobile
- [ ] Test accessibility

### Phase 7: Admin Dashboard Integration
- [ ] Add BeerPongBracketManagement to admin tabs
- [ ] Test admin permissions
- [ ] Test bracket generation from admin panel

### Phase 8: Testing & Polish
- [ ] End-to-end test: register 2 teams, generate bracket, record results
- [ ] Test with 20 teams (full tournament)
- [ ] Test photo uploads from mobile
- [ ] Test slogan editing
- [ ] Test real-time updates across multiple browsers
- [ ] Test admin bracket management on tablets

### Phase 9: Documentation & Training
- [ ] Print physical rules sheet for tournament day
- [ ] Create admin guide for running tournament
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

This updated implementation plan provides:
1. **Ultra-fast 5-minute games** with 4-minute sudden death trigger
2. **Coin flip sudden death mechanic** with throw count = opponent cups
3. **Custom photo uploads** + team slogans
4. **Full admin bracket management** with generation, seeding, and scoring
5. **Public bracket display** with real-time updates
6. **Complete database schema** with storage bucket, RLS policies, and functions
7. **All React components** ready to implement

**Estimated Development Time**: 10-12 hours
**Estimated Testing Time**: 3-4 hours

**Total Implementation**: ~2 full days

Ready to implement! 🏓👻⚡
