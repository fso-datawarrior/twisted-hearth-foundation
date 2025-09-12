# 🎭 Twisted Hearth Foundation - Database & RLS Implementation
## Lovable AI Implementation Prompt

### 📋 **Project Overview**
Implement a comprehensive database and Row-Level Security (RLS) system for the Twisted Hearth Foundation event management platform. This system needs to handle private user data (RSVPs, scavenger hunt progress) while enabling public community features (photo gallery, guestbook) with proper moderation controls.

---

## 🎯 **Core Requirements**

### **Privacy Model**
- **Private Data**: RSVPs and scavenger hunt progress are personal - only owner and admins can see
- **Public Data**: Photo gallery and comments are shared - all guests can view (after moderation)
- **Admin Override**: Admins have full visibility and management capabilities

### **Security Principles**
- Row-Level Security (RLS) on all tables
- Admin role system with `is_admin()` helper function
- Security definer RPCs for complex operations
- Proper data isolation and access controls

---

## 🗄️ **Database Schema Implementation**

### **1. Admin Role System (CRITICAL - Implement First)**

```sql
-- Admin role table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function to check admin status
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
```

### **2. Core Tables (Update Existing)**

#### **Users Table (Already exists - verify structure)**
```sql
-- Ensure users table has proper structure
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  auth_provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### **RSVPs Table (Update existing with proper RLS)**
```sql
-- Update existing rsvps table structure if needed
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS idempotency_token UUID,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for RSVPs (PRIVATE - owner + admin only)
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
```

### **3. New Tables - Scavenger Hunt System**

#### **Hunt Hints (Public - everyone can read)**
```sql
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

-- Public read for hints
CREATE POLICY "hunt_hints_public_read"
ON public.hunt_hints
FOR SELECT
TO anon, authenticated
USING (is_active = true);
```

#### **Hunt Runs (Private - owner + admin only)**
```sql
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
```

#### **Hunt Progress (Private - owner + admin only)**
```sql
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
```

#### **Hunt Rewards (Private - owner + admin only)**
```sql
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
```

### **4. Photo Gallery System (Enhanced)**

#### **Photos Metadata Table**
```sql
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
```

#### **Photo Reactions Table**
```sql
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
```

### **5. Tournament System**

#### **Tournament Registrations**
```sql
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

-- Public read for hype
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
```

#### **Tournament Teams & Matches**
```sql
CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  captain_id UUID REFERENCES auth.users(id),
  members TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'winner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Enable RLS
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Public read for teams and matches
CREATE POLICY "tournament_teams_public_read"
ON public.tournament_teams
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "tournament_matches_public_read"
ON public.tournament_matches
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin-only write for teams and matches
CREATE POLICY "tournament_teams_admin_write"
ON public.tournament_teams
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "tournament_matches_admin_write"
ON public.tournament_matches
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

### **6. Vignettes Table**
```sql
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
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

---

## 🔧 **RPC Functions Implementation**

### **1. Enhanced RSVP Function**
```sql
CREATE OR REPLACE FUNCTION public.upsert_rsvp(
  p_attending BOOLEAN,
  p_guests INTEGER,
  p_notes TEXT,
  p_costume_idea TEXT DEFAULT NULL,
  p_dietary_restrictions TEXT DEFAULT NULL,
  p_contributions TEXT DEFAULT NULL
) RETURNS public.rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.rsvps;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  INSERT INTO public.rsvps (
    user_id, 
    num_guests, 
    costume_idea, 
    dietary_restrictions, 
    contributions, 
    status
  )
  VALUES (
    v_user_id, 
    p_guests, 
    p_costume_idea, 
    p_dietary_restrictions, 
    p_contributions, 
    CASE WHEN p_attending THEN 'confirmed' ELSE 'cancelled' END
  )
  ON CONFLICT (user_id) DO UPDATE
    SET num_guests = EXCLUDED.num_guests,
        costume_idea = EXCLUDED.costume_idea,
        dietary_restrictions = EXCLUDED.dietary_restrictions,
        contributions = EXCLUDED.contributions,
        status = EXCLUDED.status,
        updated_at = now()
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_rsvp TO authenticated;
```

### **2. Hunt Progress Function**
```sql
CREATE OR REPLACE FUNCTION public.mark_hint_found(
  p_hint_id BIGINT,
  p_hunt_run_id UUID DEFAULT NULL
) RETURNS public.hunt_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_run_id UUID;
  v_hint_points INTEGER;
  v_row public.hunt_progress;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Get or create hunt run
  IF p_hunt_run_id IS NULL THEN
    SELECT id INTO v_run_id 
    FROM public.hunt_runs 
    WHERE user_id = v_user_id AND status = 'active'
    ORDER BY started_at DESC LIMIT 1;
    
    IF v_run_id IS NULL THEN
      INSERT INTO public.hunt_runs (user_id) 
      VALUES (v_user_id) 
      RETURNING id INTO v_run_id;
    END IF;
  ELSE
    v_run_id := p_hunt_run_id;
  END IF;

  -- Get hint points
  SELECT points INTO v_hint_points 
  FROM public.hunt_hints 
  WHERE id = p_hint_id AND is_active = true;

  IF v_hint_points IS NULL THEN
    RAISE EXCEPTION 'Hint not found or inactive';
  END IF;

  -- Insert progress
  INSERT INTO public.hunt_progress (user_id, hunt_run_id, hint_id, points_earned)
  VALUES (v_user_id, v_run_id, p_hint_id, v_hint_points)
  ON CONFLICT (hunt_run_id, hint_id) DO NOTHING
  RETURNING * INTO v_row;

  -- Update hunt run total points
  UPDATE public.hunt_runs 
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0) 
    FROM public.hunt_progress 
    WHERE hunt_run_id = v_run_id
  )
  WHERE id = v_run_id;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_hint_found TO authenticated;
```

### **3. Team Registration Function**
```sql
CREATE OR REPLACE FUNCTION public.register_team(
  p_tournament_name TEXT,
  p_team_name TEXT,
  p_contact_info TEXT DEFAULT NULL,
  p_special_requirements TEXT DEFAULT NULL
) RETURNS public.tournament_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row public.tournament_registrations;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  INSERT INTO public.tournament_registrations (
    user_id, 
    tournament_name, 
    team_name, 
    contact_info, 
    special_requirements
  )
  VALUES (
    v_user_id, 
    p_tournament_name, 
    p_team_name, 
    p_contact_info, 
    p_special_requirements
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_team TO authenticated;
```

---

## 🗂️ **Storage Bucket Policies**

### **Gallery Storage Policies**
```sql
-- Update existing gallery bucket policies
CREATE POLICY IF NOT EXISTS "storage_gallery_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery');

CREATE POLICY IF NOT EXISTS "storage_gallery_user_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND 
  owner = auth.uid()
);

CREATE POLICY IF NOT EXISTS "storage_gallery_update_owner_or_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' AND 
  (owner = auth.uid() OR public.is_admin())
)
WITH CHECK (
  bucket_id = 'gallery' AND 
  (owner = auth.uid() OR public.is_admin())
);

CREATE POLICY IF NOT EXISTS "storage_gallery_delete_owner_or_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND 
  (owner = auth.uid() OR public.is_admin())
);
```

---

## 📊 **Indexes for Performance**

```sql
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
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Critical Security (Immediate)**
1. Create `user_roles` table and `is_admin()` function
2. Update existing RLS policies for `rsvps` and `guestbook`
3. Create `photos` metadata table
4. Assign initial admin roles

### **Phase 2: Core Features (Week 1-2)**
1. Implement all hunt system tables and RPCs
2. Create `vignettes` table
3. Update gallery system to use photos table
4. Implement photo reactions system

### **Phase 3: Enhanced Features (Week 3-4)**
1. Build tournament system
2. Add advanced moderation features
3. Implement admin dashboard
4. Add data export functionality

---

## 🎨 **Frontend Integration Points**

### **TypeScript Types Update**
```typescript
// Add to your existing types.ts
export interface HuntHint {
  id: number;
  title: string;
  description: string;
  hint_text: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: 'visual' | 'text' | 'location' | 'riddle';
  points: number;
  is_active: boolean;
}

export interface HuntRun {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_points: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface Photo {
  id: string;
  user_id: string;
  storage_path: string;
  filename: string;
  caption?: string;
  tags: string[];
  category?: 'costumes' | 'food' | 'activities' | 'general';
  is_approved: boolean;
  is_featured: boolean;
  likes_count: number;
  created_at: string;
}
```

### **Supabase Client Updates**
```typescript
// Add to your Supabase client
export const supabase = createClient<Database>(url, key);

// New RPC calls
export const markHintFound = async (hintId: number, huntRunId?: string) => {
  const { data, error } = await supabase.rpc('mark_hint_found', {
    p_hint_id: hintId,
    p_hunt_run_id: huntRunId
  });
  return { data, error };
};

export const registerTeam = async (tournamentName: string, teamName: string) => {
  const { data, error } = await supabase.rpc('register_team', {
    p_tournament_name: tournamentName,
    p_team_name: teamName
  });
  return { data, error };
};
```

---

## ✅ **Acceptance Criteria**

### **Security Requirements**
- [ ] All tables have proper RLS policies
- [ ] Admin system is functional with `is_admin()` helper
- [ ] Private data (RSVPs, hunt progress) is only visible to owner + admin
- [ ] Public data (photos, comments) is visible to all when approved
- [ ] Storage bucket policies are properly configured

### **Functionality Requirements**
- [ ] Scavenger hunt system is fully functional
- [ ] Photo gallery with metadata and reactions works
- [ ] Tournament registration system is operational
- [ ] Vignettes system is working
- [ ] All RPC functions are properly secured

### **Performance Requirements**
- [ ] All tables have appropriate indexes
- [ ] RLS policies don't significantly impact query performance
- [ ] Storage operations are optimized

---

## 🚨 **Critical Notes**

1. **Security First**: The current RLS policies are too permissive and need immediate attention
2. **Admin Setup**: Remember to assign admin roles after creating the `user_roles` table
3. **Data Migration**: Existing data will be preserved during implementation
4. **Testing**: Test all RLS policies thoroughly before going live
5. **Monitoring**: Set up monitoring for RLS policy violations and performance

---

## 📞 **Support**

If you encounter any issues during implementation:
1. Check Supabase logs for RLS policy violations
2. Verify admin role assignments
3. Test RPC functions with proper authentication
4. Ensure all foreign key relationships are correct

This implementation provides a robust, secure, and scalable foundation for the Twisted Hearth Foundation event management platform.
