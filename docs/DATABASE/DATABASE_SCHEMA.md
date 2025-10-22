# Database Schema - Twisted Hearth Foundation

## Overview
Complete PostgreSQL database schema for the Twisted Hearth Foundation Halloween party management system, hosted on Supabase.

## Core Tables

### 1. User Management

#### `users` (Legacy Table)
```sql
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  auth_provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `profiles` (Enhanced User Data)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `user_roles` (Admin System)
```sql
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. RSVP System

#### `rsvps` (Event Registration)
```sql
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  name TEXT, -- Legacy field
  num_guests SMALLINT NOT NULL DEFAULT 1 CHECK (num_guests BETWEEN 1 AND 8),
  additional_guests JSONB, -- Array of guest objects
  costume_idea TEXT,
  dietary_restrictions TEXT,
  contributions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  idempotency_token UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
```

### 3. Guestbook System

#### `guestbook` (Social Messages)
```sql
CREATE TABLE public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
```

#### `guestbook_reactions` (Message Reactions)
```sql
CREATE TABLE public.guestbook_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (length(emoji) BETWEEN 1 AND 16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, emoji)
);
```

#### `guestbook_replies` (Message Replies)
```sql
CREATE TABLE public.guestbook_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `guestbook_reports` (Content Moderation)
```sql
CREATE TABLE public.guestbook_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT CHECK (length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```### 4. Photo Gallery System

#### `photos` (Image Metadata)
```sql
CREATE TABLE public.photos (
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
  vignette_id UUID REFERENCES public.past_vignettes(id),
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `photo_reactions` (Image Interactions)
```sql
CREATE TABLE public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (photo_id, user_id, reaction_type)
);
```

### 5. Scavenger Hunt System

#### `hunt_hints` (Game Hints)
```sql
CREATE TABLE public.hunt_hints (
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
```

#### `hunt_runs` (User Game Sessions)
```sql
CREATE TABLE public.hunt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `hunt_progress` (User Progress Tracking)
```sql
CREATE TABLE public.hunt_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hunt_run_id UUID NOT NULL REFERENCES public.hunt_runs(id) ON DELETE CASCADE,
  hint_id BIGINT NOT NULL REFERENCES public.hunt_hints(id) ON DELETE CASCADE,
  found_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hunt_run_id, hint_id)
);
```

#### `hunt_rewards` (Achievement System)
```sql
CREATE TABLE public.hunt_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hunt_run_id UUID NOT NULL REFERENCES public.hunt_runs(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'trophy', 'special_access')),
  reward_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```### 6. Tournament System

#### `tournament_registrations` (Competition Signups)
```sql
CREATE TABLE public.tournament_registrations (
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
```

#### `tournament_teams` (Team Management)
```sql
CREATE TABLE public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  captain_id UUID REFERENCES auth.users(id),
  members TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'winner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `tournament_matches` (Match Tracking)
```sql
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_id UUID REFERENCES public.tournament_teams(id),
  team2_id UUID REFERENCES public.tournament_teams(id),
  match_date TIMESTAMPTZ,
  winner_id UUID REFERENCES public.tournament_teams(id),
  score TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7. Content Management

#### `vignettes` (Story Content)
```sql
CREATE TABLE public.vignettes (
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
```

#### `past_vignettes` (Historical Stories)
```sql
CREATE TABLE public.past_vignettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  theme_tag TEXT NOT NULL CHECK (length(theme_tag) <= 20),
  photo_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```### 8. Email System

#### `email_templates` (Email Templates)
```sql
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  preview_text TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `email_campaigns` (Campaign Management)
```sql
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_list TEXT CHECK (recipient_list IN ('all', 'rsvp_yes', 'rsvp_pending', 'custom')),
  custom_recipients TEXT[],
  template_id UUID REFERENCES public.email_templates(id),
  status TEXT CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
```

#### `campaign_recipients` (Recipient Tracking)
```sql
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id),
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE (campaign_id, email)
);
```

#### `email_sends` (Send Logging)
```sql
CREATE TABLE public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT CHECK (status IN ('sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);
```### 9. Analytics System

#### `user_sessions` (Session Tracking)
```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  browser TEXT,
  device_type TEXT,
  os TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  ip_address TEXT,
  country TEXT,
  region TEXT
);
```

#### `page_views` (Page Analytics)
```sql
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  time_on_page INTEGER,
  exited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `user_activity_logs` (Action Tracking)
```sql
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `content_interactions` (Content Analytics)
```sql
CREATE TABLE public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```#### `system_metrics` (Performance Metrics)
```sql
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `analytics_daily_aggregates` (Daily Rollups)
```sql
CREATE TABLE public.analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Traffic Metrics
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  -- Performance Metrics
  avg_session_duration NUMERIC DEFAULT 0,
  avg_page_load_time NUMERIC DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  -- User Metrics
  new_users INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  -- Feature Metrics
  rsvps_submitted INTEGER DEFAULT 0,
  rsvps_confirmed INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  guestbook_posts INTEGER DEFAULT 0,
  -- Aggregated Data
  popular_photos JSONB DEFAULT '[]'::jsonb,
  top_pages JSONB DEFAULT '[]'::jsonb
);
```

### 11. Release Management System (RMS)

#### `system_releases` (Main Release Metadata)
```sql
CREATE TABLE public.system_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  major_version INTEGER NOT NULL,
  minor_version INTEGER NOT NULL,
  patch_version INTEGER NOT NULL,
  pre_release TEXT,
  release_date TIMESTAMPTZ,
  summary TEXT,
  environment TEXT NOT NULL DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
  deployment_status TEXT NOT NULL DEFAULT 'draft' CHECK (deployment_status IN ('draft', 'deployed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### `release_features` (New Features Per Release)
```sql
CREATE TABLE public.release_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('feature', 'enhancement', 'improvement')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `release_api_changes` (API Modifications)
```sql
CREATE TABLE public.release_api_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  change_type TEXT NOT NULL CHECK (change_type IN ('added', 'modified', 'deprecated', 'removed')),
  description TEXT,
  breaking_change BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `release_changes` (Generic Changes)
```sql
CREATE TABLE public.release_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('ui', 'bug_fix', 'improvement', 'security', 'performance', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `release_notes` (Technical and Additional Notes)
```sql
CREATE TABLE public.release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.system_releases(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('technical', 'additional', 'breaking_changes', 'migration')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 12. Notification System

#### `notification_preferences` (User Notification Settings)
```sql
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  in_app_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  email_on_comment BOOLEAN DEFAULT true,
  email_on_reply BOOLEAN DEFAULT true,
  email_on_reaction BOOLEAN DEFAULT true,
  email_on_rsvp_update BOOLEAN DEFAULT true,
  email_on_admin_announcement BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `notifications` (User Notifications)
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'reaction', 'rsvp_update', 'event_update', 'admin_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 13. Support System
```sql
CREATE TABLE public.support_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  user_agent TEXT,
  browser_logs JSONB,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Key Indexes

### Performance Indexes
- `idx_user_sessions_user_id` - User session lookups
- `idx_page_views_session_id` - Page view analytics
- `idx_photos_user_id` - User photo queries
- `idx_rsvps_email` - Email-based RSVP lookups
- `idx_hunt_runs_user_id` - User hunt progress
- `idx_analytics_daily_aggregates_date` - Daily analytics queries

### Composite Indexes
- `idx_content_interactions_composite` - Content interaction analytics
- `idx_system_metrics_composite` - Performance metric queries
- `idx_photo_reactions_photo_id` - Photo reaction counts

## Relationships

### Primary Relationships
- `users` → `rsvps` (1:1)
- `users` → `photos` (1:many)
- `users` → `guestbook` (1:many)
- `users` → `hunt_runs` (1:many)
- `photos` → `photo_reactions` (1:many)
- `guestbook` → `guestbook_replies` (1:many)
- `email_campaigns` → `campaign_recipients` (1:many)

### Foreign Key Constraints
All tables use proper foreign key constraints with appropriate CASCADE and SET NULL behaviors for data integrity.