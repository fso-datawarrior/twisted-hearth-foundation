# SPEED BEER PONG TOURNAMENT - IMPLEMENTATION PLAN

**Project**: Add Beer Pong Tournament Registration & Management
**Branch**: `prod-2025.partytillyou.rip`
**Created**: 2025-10-21

---

## 🎯 OBJECTIVES

1. Implement time-limited beer pong rules to keep games fast-paced (max 10-15 min per game)
2. Enable team registration for 2-person teams (max 20 teams)
3. Display registered teams on the Schedule page
4. Allow teams to select from pre-curated scary/twisted fairytale profile pictures (first-come, no duplicates)

---

## 🏓 PART 1: TIME-LIMITING RULES (3 STRATEGIES)

### Strategy #1: Progressive Cup Removal ("Speed Drain")
**Rule**: Every 2 minutes, the team with MORE cups remaining loses their HIGHEST-SCORING cup (back row first)

**How it Works**:
- Start with standard 10-cup triangle formation (water-filled)
- Set a 2-minute timer at game start
- Every 2 minutes:
  - Check which team has more cups
  - That team must remove 1 cup from their back row (no drinking/water dump needed)
  - Reset timer
- First team to eliminate all opponent's cups wins
- **Max Game Time**: ~10-12 minutes (5-6 timer cycles)

**Why it's Good**:
- Forces aggressive play
- Penalizes defensive/slow strategies
- No rule changes mid-game for players to remember
- Easy to enforce with a visible countdown timer

---

### Strategy #2: Timed Rounds with Sudden Death ("Lightning Rounds")
**Rule**: Game lasts exactly 10 minutes, then enters sudden death if tied

**How it Works**:
- Standard 10-cup beer pong rules
- Set a 10-minute countdown timer (visible to all)
- When timer hits 0:00:
  - Count remaining cups for each team
  - Team with FEWER cups remaining wins immediately
  - If tied: SUDDEN DEATH - first team to sink a ball wins (alternating shots)
- **Max Game Time**: 12 minutes (10 min + ~2 min sudden death)

**Why it's Good**:
- Creates urgency from the start
- Dramatic final moments as clock runs down
- Clear endpoint
- Easy to explain

---

### Strategy #3: "Redemption Rush" (Cup Reduction Per Round)
**Rule**: Start with 6 cups instead of 10, remove 1 cup from each team every 3 minutes

**How it Works**:
- Each team sets up 6 cups (2-1-2-1 formation or simple triangle)
- Every 3 minutes:
  - Each team removes 1 cup from their own side (their choice which one)
  - Continues until one team has 0 cups OR gets all opponent cups eliminated
- First team to eliminate opponent's cups wins
- **Max Game Time**: ~9-12 minutes (3-4 cup removal cycles)

**Why it's Good**:
- Faster games from the start (fewer cups)
- Strategic choice of which cup to remove
- Self-balancing (both teams lose cups simultaneously)
- No referee needed for timing enforcement

---

### 📋 OFFICIAL RULES DOCUMENT

**Tournament Format**: Single-elimination bracket
**Team Size**: 2 players per team
**Equipment**: 12 cups, 2 ping pong balls, water
**Cup Contents**: WATER ONLY (no alcohol)

#### Core Rules:
1. **Setup**: Each team arranges 6 cups in a triangle formation (or 10 cups if using Strategy #1)
2. **Throwing**: Teams alternate throws. Both players on a team throw once per turn.
3. **Hits**:
   - Ball lands in cup → Remove cup, opponent drinks/dumps water
   - Both players make their shots → "Bring backs" (throw again)
4. **Re-Racks**: Each team gets ONE re-rack per game (can request triangle/diamond reformation)
   - Available when: 6, 4, 3, or 2 cups remain
5. **Bounce Shots**: If ball bounces on table first, defending team can swat it
6. **Elbows**: Elbow must stay behind table edge when throwing
7. **Distractions**: No touching cups, blowing, or physical interference while ball is in air

#### Time-Limiting Rule (CHOOSE ONE):
- **Option A**: Strategy #1 - Progressive Cup Removal (recommended)
- **Option B**: Strategy #2 - Timed Rounds with Sudden Death
- **Option C**: Strategy #3 - Redemption Rush (6-cup start)

#### Tiebreakers:
- If game exceeds time limit (Strategies #1/#3): Sudden death - first to sink wins
- If bracket requires tiebreaker: Rock-paper-scissors or coin flip

---

## 🗄️ PART 2: DATABASE SCHEMA CHANGES

### Migration: Add Beer Pong Team Support

**File**: `supabase/migrations/20251021170000_add_beer_pong_team_features.sql`

```sql
-- Add profile picture and partner fields to tournament_teams table
ALTER TABLE public.tournament_teams
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tournament_type TEXT DEFAULT 'beer_pong' CHECK (tournament_type IN ('beer_pong', 'other'));

-- Add unique constraint: Each user can only captain ONE beer pong team
CREATE UNIQUE INDEX IF NOT EXISTS unique_captain_per_beer_pong_tournament
  ON public.tournament_teams (captain_id)
  WHERE tournament_type = 'beer_pong';

-- Add unique constraint: Each partner can only be on ONE beer pong team
CREATE UNIQUE INDEX IF NOT EXISTS unique_partner_per_beer_pong_tournament
  ON public.tournament_teams (partner_user_id)
  WHERE tournament_type = 'beer_pong' AND partner_user_id IS NOT NULL;

-- Add unique constraint: Each profile picture can only be used once
CREATE UNIQUE INDEX IF NOT EXISTS unique_profile_picture_per_beer_pong_team
  ON public.tournament_teams (profile_picture)
  WHERE tournament_type = 'beer_pong' AND profile_picture IS NOT NULL;

-- Create function to register a beer pong team
CREATE OR REPLACE FUNCTION public.register_beer_pong_team(
  p_team_name TEXT,
  p_partner_email TEXT,
  p_profile_picture TEXT
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
BEGIN
  -- Get captain (caller)
  v_captain_id := auth.uid();

  IF v_captain_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to register a team';
  END IF;

  -- Check if captain already has a team
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE captain_id = v_captain_id AND tournament_type = 'beer_pong'
  ) THEN
    RAISE EXCEPTION 'You are already registered as a team captain';
  END IF;

  -- Check if captain is already a partner on another team
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE partner_user_id = v_captain_id AND tournament_type = 'beer_pong'
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

  -- Check if partner is already on a team (as captain or partner)
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE (captain_id = v_partner_id OR partner_user_id = v_partner_id)
      AND tournament_type = 'beer_pong'
  ) THEN
    RAISE EXCEPTION 'Your partner is already registered on another team';
  END IF;

  -- Check if profile picture is already taken
  IF EXISTS (
    SELECT 1 FROM tournament_teams
    WHERE profile_picture = p_profile_picture AND tournament_type = 'beer_pong'
  ) THEN
    RAISE EXCEPTION 'Profile picture already selected by another team';
  END IF;

  -- Create team
  INSERT INTO tournament_teams (
    team_name,
    captain_id,
    partner_user_id,
    profile_picture,
    tournament_type,
    status
  ) VALUES (
    p_team_name,
    v_captain_id,
    v_partner_id,
    p_profile_picture,
    'beer_pong',
    'active'
  )
  RETURNING id INTO v_team_id;

  RETURN v_team_id;
END;
$$;

-- Create view for public beer pong teams (with display names)
CREATE OR REPLACE VIEW public.beer_pong_teams_public AS
SELECT
  t.id,
  t.team_name,
  t.profile_picture,
  t.wins,
  t.losses,
  t.created_at,
  p_captain.display_name AS captain_name,
  p_partner.display_name AS partner_name
FROM tournament_teams t
LEFT JOIN profiles p_captain ON t.captain_id = p_captain.id
LEFT JOIN profiles p_partner ON t.partner_user_id = p_partner.id
WHERE t.tournament_type = 'beer_pong'
ORDER BY t.created_at ASC;

-- Grant access to view
GRANT SELECT ON public.beer_pong_teams_public TO anon, authenticated;

COMMENT ON VIEW public.beer_pong_teams_public IS
  'Public view of beer pong teams with player display names (no PII)';
```

---

## 🎨 PART 3: TEAM PROFILE PICTURES (20 Options)

Create a new constants file with curated twisted fairytale / scary image options.

**File**: `src/lib/beer-pong-avatars.ts`

```typescript
export interface TeamAvatar {
  id: string;
  name: string;
  emoji: string; // Fallback if image doesn't load
  imageUrl: string; // Path to image in /public/tournament-avatars/
  description: string;
  theme: 'scary' | 'twisted' | 'goofy';
}

export const BEER_PONG_AVATARS: TeamAvatar[] = [
  // SCARY (6)
  {
    id: 'haunted-mirror',
    name: 'Haunted Mirror',
    emoji: '🪞',
    imageUrl: '/tournament-avatars/haunted-mirror.png',
    description: 'Cracked mirror reflecting twisted souls',
    theme: 'scary'
  },
  {
    id: 'plague-doctor',
    name: 'Plague Doctor',
    emoji: '🩺',
    imageUrl: '/tournament-avatars/plague-doctor.png',
    description: 'Medieval bird-masked physician',
    theme: 'scary'
  },
  {
    id: 'black-cat',
    name: 'Black Cat',
    emoji: '🐈‍⬛',
    imageUrl: '/tournament-avatars/black-cat.png',
    description: 'Sinister feline with glowing eyes',
    theme: 'scary'
  },
  {
    id: 'grim-reaper',
    name: 'Grim Reaper',
    emoji: '☠️',
    imageUrl: '/tournament-avatars/grim-reaper.png',
    description: 'Hooded figure wielding a scythe',
    theme: 'scary'
  },
  {
    id: 'ghostly-bride',
    name: 'Ghostly Bride',
    emoji: '👰‍♀️',
    imageUrl: '/tournament-avatars/ghostly-bride.png',
    description: 'Vengeful spirit in tattered wedding dress',
    theme: 'scary'
  },
  {
    id: 'cursed-doll',
    name: 'Cursed Doll',
    emoji: '🪆',
    imageUrl: '/tournament-avatars/cursed-doll.png',
    description: 'Porcelain doll with cracked face',
    theme: 'scary'
  },

  // TWISTED FAIRYTALE (8)
  {
    id: 'red-riding-hood',
    name: 'Big Bad Wolf',
    emoji: '🐺',
    imageUrl: '/tournament-avatars/big-bad-wolf.png',
    description: 'Wolf in grandma\'s clothing',
    theme: 'twisted'
  },
  {
    id: 'poison-apple',
    name: 'Poison Apple',
    emoji: '🍎',
    imageUrl: '/tournament-avatars/poison-apple.png',
    description: 'Snow White\'s cursed red apple',
    theme: 'twisted'
  },
  {
    id: 'wicked-queen',
    name: 'Wicked Queen',
    emoji: '👑',
    imageUrl: '/tournament-avatars/wicked-queen.png',
    description: 'Evil queen with poisoned crown',
    theme: 'twisted'
  },
  {
    id: 'dark-fairy',
    name: 'Dark Fairy',
    emoji: '🧚',
    imageUrl: '/tournament-avatars/dark-fairy.png',
    description: 'Malevolent fairy with tattered wings',
    theme: 'twisted'
  },
  {
    id: 'cursed-frog',
    name: 'Cursed Frog Prince',
    emoji: '🐸',
    imageUrl: '/tournament-avatars/cursed-frog.png',
    description: 'Prince stuck in amphibian form',
    theme: 'twisted'
  },
  {
    id: 'evil-stepmother',
    name: 'Wicked Stepmother',
    emoji: '🔮',
    imageUrl: '/tournament-avatars/evil-stepmother.png',
    description: 'Cinderella\'s tormentor',
    theme: 'twisted'
  },
  {
    id: 'candy-witch',
    name: 'Gingerbread Witch',
    emoji: '🍭',
    imageUrl: '/tournament-avatars/candy-witch.png',
    description: 'Hansel & Gretel\'s captor',
    theme: 'twisted'
  },
  {
    id: 'beast',
    name: 'The Beast',
    emoji: '👹',
    imageUrl: '/tournament-avatars/beast.png',
    description: 'Cursed prince in monstrous form',
    theme: 'twisted'
  },

  // GOOFY (6)
  {
    id: 'drunk-pumpkin',
    name: 'Tipsy Pumpkin',
    emoji: '🎃',
    imageUrl: '/tournament-avatars/drunk-pumpkin.png',
    description: 'Carved pumpkin with wobbly grin',
    theme: 'goofy'
  },
  {
    id: 'dancing-skeleton',
    name: 'Dancing Skeleton',
    emoji: '💀',
    imageUrl: '/tournament-avatars/dancing-skeleton.png',
    description: 'Skeleton doing the thriller',
    theme: 'goofy'
  },
  {
    id: 'party-ghost',
    name: 'Party Ghost',
    emoji: '👻',
    imageUrl: '/tournament-avatars/party-ghost.png',
    description: 'Ghost with lampshade on head',
    theme: 'goofy'
  },
  {
    id: 'zombie-unicorn',
    name: 'Zombie Unicorn',
    emoji: '🦄',
    imageUrl: '/tournament-avatars/zombie-unicorn.png',
    description: 'Undead magical creature',
    theme: 'goofy'
  },
  {
    id: 'vampire-bat',
    name: 'Vampire Bat',
    emoji: '🦇',
    imageUrl: '/tournament-avatars/vampire-bat.png',
    description: 'Bat with tiny fangs and cape',
    theme: 'goofy'
  },
  {
    id: 'frankenstein-dog',
    name: 'Frankenweenie',
    emoji: '🐕',
    imageUrl: '/tournament-avatars/frankenstein-dog.png',
    description: 'Stitched-up pup',
    theme: 'goofy'
  }
];

// Helper function to get available avatars (not taken by other teams)
export async function getAvailableAvatars(supabase: any): Promise<TeamAvatar[]> {
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('profile_picture')
    .eq('tournament_type', 'beer_pong');

  const takenAvatars = new Set(teams?.map(t => t.profile_picture) || []);

  return BEER_PONG_AVATARS.filter(avatar => !takenAvatars.has(avatar.id));
}
```

---

## 🎨 PART 4: TEAM REGISTRATION UI COMPONENT

**File**: `src/components/BeerPongRegistration.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { BEER_PONG_AVATARS, getAvailableAvatars, type TeamAvatar } from '@/lib/beer-pong-avatars';

export function BeerPongRegistration() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [availableAvatars, setAvailableAvatars] = useState<TeamAvatar[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableAvatars();
    checkIfRegistered();
  }, [user]);

  const loadAvailableAvatars = async () => {
    const avatars = await getAvailableAvatars(supabase);
    setAvailableAvatars(avatars);
  };

  const checkIfRegistered = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('tournament_teams')
      .select('*')
      .eq('tournament_type', 'beer_pong')
      .or(`captain_id.eq.${user.id},partner_user_id.eq.${user.id}`)
      .single();

    setIsRegistered(!!data);
  };

  const handleRegister = async () => {
    if (!teamName || !partnerEmail || !selectedAvatar) {
      toast.error('Please fill in all fields and select a profile picture');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to register');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('register_beer_pong_team', {
        p_team_name: teamName,
        p_partner_email: partnerEmail,
        p_profile_picture: selectedAvatar
      });

      if (error) throw error;

      toast.success(`Team "${teamName}" registered successfully!`);
      setIsRegistered(true);
      setTeamName('');
      setPartnerEmail('');
      setSelectedAvatar(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register team');
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

  if (isRegistered) {
    return (
      <Card className="p-6 bg-bg-2 border-accent-gold/50">
        <h3 className="font-subhead text-xl text-accent-gold mb-2">
          ✅ You're Registered!
        </h3>
        <p className="text-muted-foreground">
          Your team is locked in for the tournament. See you at 8:00 PM!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-bg-2 border-accent-purple/30">
      <h3 className="font-subhead text-2xl text-accent-gold mb-4">
        Register Your Team
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            placeholder="e.g., Twisted Throwers"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div>
          <Label htmlFor="partnerEmail">Partner's Email</Label>
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

        <div>
          <Label>Choose Your Team Avatar (First-Come, First-Serve)</Label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-2">
            {availableAvatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`
                  p-2 rounded-lg border-2 transition-all
                  hover:scale-110 hover:shadow-lg
                  ${selectedAvatar === avatar.id
                    ? 'border-accent-gold bg-accent-gold/20'
                    : 'border-accent-purple/30 bg-bg hover:border-accent-purple'
                  }
                `}
                title={avatar.description}
              >
                <div className="text-4xl">{avatar.emoji}</div>
                <div className="text-xs mt-1 truncate">{avatar.name}</div>
              </button>
            ))}
          </div>
          {availableAvatars.length === 0 && (
            <p className="text-accent-red mt-2">
              All avatars are taken! Tournament is full.
            </p>
          )}
        </div>

        <Button
          onClick={handleRegister}
          disabled={loading || availableAvatars.length === 0}
          className="w-full bg-accent-gold text-bg hover:bg-accent-gold/90"
        >
          {loading ? 'Registering...' : 'Register Team'}
        </Button>
      </div>
    </Card>
  );
}
```

---

## 📅 PART 5: UPDATE SCHEDULE PAGE

**File**: `src/pages/Schedule.tsx` (modify existing)

Add the following after the "Schedule of Dark Delights" section:

```typescript
import { BeerPongRegistration } from '@/components/BeerPongRegistration';
import { BeerPongTeamsList } from '@/components/BeerPongTeamsList';

// ... existing schedule code ...

// Add this section AFTER the existing schedule items, BEFORE the "Important Notes" section:

{/* Beer Pong Tournament Section */}
<div className="mt-16 bg-bg-2 p-8 rounded-lg border-2 border-accent-gold/50">
  <h2 className="font-heading text-3xl text-accent-gold mb-4 text-center">
    🏓 Speed Beer Pong Tournament
  </h2>
  <p className="font-body text-muted-foreground text-center mb-6">
    Starts at <strong className="text-accent-gold">8:00 PM</strong> •
    Max 20 Teams • 2 Players Per Team • Water Only
  </p>

  <div className="grid md:grid-cols-2 gap-8">
    {/* Registration Form */}
    <div>
      <BeerPongRegistration />
    </div>

    {/* Tournament Rules */}
    <div className="bg-bg p-6 rounded-lg border border-accent-purple/30">
      <h3 className="font-subhead text-xl text-accent-red mb-3">
        Tournament Rules
      </h3>
      <ul className="text-sm space-y-2 text-muted-foreground">
        <li>• <strong>Format:</strong> Single-elimination bracket</li>
        <li>• <strong>Time Limit:</strong> 10 minutes per game (Strategy #2)</li>
        <li>• <strong>Cups:</strong> 6-cup triangle, water only</li>
        <li>• <strong>Re-Racks:</strong> 1 per game (at 4, 3, or 2 cups)</li>
        <li>• <strong>Bounce Shots:</strong> Defender can swat</li>
        <li>• <strong>Elbows:</strong> Must stay behind table edge</li>
        <li>• <strong>Overtime:</strong> Sudden death if tied at 10:00</li>
        <li>• <strong>Prize:</strong> Trophies for winning team!</li>
      </ul>
    </div>
  </div>

  {/* Registered Teams List */}
  <div className="mt-8">
    <BeerPongTeamsList />
  </div>
</div>
```

---

## 👥 PART 6: TEAMS LIST COMPONENT

**File**: `src/components/BeerPongTeamsList.tsx`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BEER_PONG_AVATARS } from '@/lib/beer-pong-avatars';
import { Card } from '@/components/ui/card';

interface BeerPongTeam {
  id: string;
  team_name: string;
  profile_picture: string;
  captain_name: string;
  partner_name: string;
  wins: number;
  losses: number;
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

  const getAvatarForTeam = (profilePictureId: string) => {
    return BEER_PONG_AVATARS.find(a => a.id === profilePictureId);
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
        {teams.map((team) => {
          const avatar = getAvatarForTeam(team.profile_picture);
          return (
            <Card
              key={team.id}
              className="p-4 bg-bg border-accent-purple/30 hover:border-accent-gold/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-5xl">{avatar?.emoji || '❓'}</div>
                <div className="flex-1">
                  <h4 className="font-subhead text-lg text-accent-gold">
                    {team.team_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {team.captain_name} & {team.partner_name}
                  </p>
                  {(team.wins > 0 || team.losses > 0) && (
                    <p className="text-xs text-accent-green mt-1">
                      {team.wins}W - {team.losses}L
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
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

## 🚀 PART 7: IMPLEMENTATION CHECKLIST

### Phase 1: Database Setup
- [ ] Create migration file: `supabase/migrations/20251021170000_add_beer_pong_team_features.sql`
- [ ] Test migration locally with `supabase db reset`
- [ ] Verify `register_beer_pong_team` function works
- [ ] Test `beer_pong_teams_public` view returns data
- [ ] Deploy migration to production

### Phase 2: Avatar System
- [ ] Create `src/lib/beer-pong-avatars.ts` with 20 avatar definitions
- [ ] Create `/public/tournament-avatars/` directory
- [ ] Add 20 avatar images (PNG/SVG, ~100x100px each)
- [ ] Test `getAvailableAvatars()` function filters taken avatars

### Phase 3: UI Components
- [ ] Create `src/components/BeerPongRegistration.tsx`
- [ ] Create `src/components/BeerPongTeamsList.tsx`
- [ ] Test registration flow end-to-end
- [ ] Test duplicate checks (captain, partner, avatar)
- [ ] Test real-time updates when teams register

### Phase 4: Schedule Page Integration
- [ ] Update `src/pages/Schedule.tsx` with tournament section
- [ ] Add imports for new components
- [ ] Test mobile responsiveness
- [ ] Test accessibility (keyboard nav, screen readers)

### Phase 5: Rules Documentation
- [ ] Choose time-limiting strategy (recommend #2)
- [ ] Print physical rules sheet for tournament day
- [ ] Add rules to admin dashboard (optional)

### Phase 6: Testing & Polish
- [ ] Test with 2 accounts (captain + partner)
- [ ] Test error messages (partner not found, duplicate registrations)
- [ ] Test with 20 teams (verify "full" state)
- [ ] Test avatar selection UI on mobile
- [ ] Test real-time team list updates

### Phase 7: Deployment
- [ ] Merge to `prod-2025.partytillyou.rip` branch
- [ ] Deploy to production
- [ ] Verify on live site
- [ ] Share registration link with guests

---

## 📊 RECOMMENDED CHOICE

**Time-Limiting Strategy**: **#2 - Timed Rounds with Sudden Death**

**Why**:
- Easy to explain to drunk people
- Creates dramatic countdown tension
- Clear endpoint (10 minutes)
- No referee needed during game (just watch clock)
- Sudden death is exciting and decisive

**Tournament Timeline** (assuming 20 teams):
- Round 1 (10 matches): ~2 hours (10 min per game + 2 min setup)
- Round 2 (5 matches): ~1 hour
- Round 3 (2 matches + finals): ~40 min
- **Total**: ~3.5 hours (fits within 8:00 PM - 11:30 PM window)

---

## 🎨 AVATAR IMAGE SOURCES

**Option 1**: AI-Generated (Midjourney, DALL-E)
- Prompt: "simple icon of [description], flat design, Halloween theme, transparent background"
- Export as 256x256 PNG

**Option 2**: Free Icon Libraries
- [Flaticon](https://www.flaticon.com/) - Halloween/fantasy icons
- [The Noun Project](https://thenounproject.com/) - SVG icons
- Filter by "Halloween", "fairytale", "gothic"

**Option 3**: Emoji-Based Fallback
- Use emoji as primary (already in code)
- Skip image generation entirely for MVP
- Add images later if desired

---

## ✅ SUMMARY

This implementation plan provides:
1. **3 time-limiting strategies** to keep games under 15 minutes
2. **Complete database schema** with unique constraints and validation
3. **20 curated team avatars** with first-come-first-serve selection
4. **Registration UI** with real-time availability checking
5. **Team display** on Schedule page with live updates
6. **Full documentation** of tournament rules

**Estimated Development Time**: 6-8 hours
**Estimated Testing Time**: 2-3 hours

Ready to implement! 🏓👻
