# Admin Dashboard Widgets - Comprehensive Analysis
## Twisted Hearth Foundation Event Management System

**Date:** October 13, 2025  
**Purpose:** Complete documentation of all dashboard components, data sources, and database architecture

---

## TABLE OF CONTENTS
1. [Dashboard Overview](#dashboard-overview)
2. [Widget Components](#widget-components)
3. [Database Architecture](#database-architecture)
4. [Data Flow & APIs](#data-flow--apis)
5. [File Locations](#file-locations)

---

## DASHBOARD OVERVIEW

### Main Dashboard Page
**Location:** `src/pages/AdminDashboard.tsx`

The Admin Dashboard is the central control panel displaying 7 primary widget categories:

1. **User Engagement Widget**
2. **Content Metrics Widget**
3. **RSVP Trends Widget**
4. **Photo Popularity Widget**
5. **Guestbook Activity Widget**
6. **System Health Widget**
7. **Realtime Activity Feed Widget**

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                             │
├─────────────────────────────────────────────────────────────┤
│  Quick Overview KPIs (Sessions | Page Views | Actions)      │
├─────────────────────────────────────────────────────────────┤
│  Traffic Trends Chart (7d/30d)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────┐                │
│  │ USER        │ CONTENT     │ RSVP        │                │
│  │ ENGAGEMENT  │ METRICS     │ TRENDS      │                │
│  └─────────────┴─────────────┴─────────────┘                │
│  ┌─────────────┬─────────────┬─────────────┐                │
│  │ PHOTO       │ GUESTBOOK   │ SYSTEM      │                │
│  │ POPULARITY  │ ACTIVITY    │ HEALTH      │                │
│  └─────────────┴─────────────┴─────────────┘                │
│  ┌─────────────────────────────────────────┐                │
│  │ REALTIME ACTIVITY FEED (Full Width)     │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## WIDGET COMPONENTS

### 1. USER ENGAGEMENT WIDGET

**Location:** `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`

**Purpose:** Displays user activity and session metrics

**Metrics Displayed:**
- **Total Users** - Count from `profiles` table
- **Active (7d)** - Unique users with sessions in last 7 days
- **Avg Session** - Average session duration in minutes
- **Pages/Session** - Average pages viewed per session
- **New (7d)** - New user registrations in last 7 days
- **Returning** - Users with multiple sessions

**Data Sources:**
```typescript
// Primary Tables
- profiles (user count)
- user_sessions (activity tracking)

// Queries
1. Total users: SELECT COUNT(*) FROM profiles
2. Active users: SELECT DISTINCT user_id FROM user_sessions WHERE started_at >= [7 days ago]
3. Avg session: SELECT AVG(duration_seconds) FROM user_sessions
4. Pages/session: SELECT AVG(pages_viewed) FROM user_sessions
5. New users: SELECT COUNT(*) FROM profiles WHERE created_at >= [7 days ago]
6. Returning: SELECT COUNT(DISTINCT user_id) FROM user_sessions GROUP BY user_id HAVING COUNT(*) > 1
```

**Refresh Interval:** 5 minutes

---

### 2. CONTENT METRICS WIDGET

**Location:** `src/components/admin/DashboardWidgets/ContentMetricsWidget.tsx`

**Purpose:** Track photo gallery and guestbook content

**Metrics Displayed:**
- **Total Photos** - All uploaded photos
- **Pending Approval** - Photos awaiting admin approval
- **Photo Views (7d)** - View interactions in last 7 days
- **Total Likes** - All photo reactions
- **Guestbook Posts** - Active guestbook entries

**Data Sources:**
```typescript
// Primary Tables
- photos
- content_interactions
- photo_reactions
- guestbook

// Queries
1. Total photos: SELECT COUNT(*) FROM photos
2. Pending: SELECT COUNT(*) FROM photos WHERE is_approved = false
3. Views: SELECT COUNT(*) FROM content_interactions WHERE content_type='photo' AND interaction_type='view' AND created_at >= [7d ago]
4. Likes: SELECT COUNT(*) FROM photo_reactions WHERE reaction_type='like'
5. Posts: SELECT COUNT(*) FROM guestbook WHERE deleted_at IS NULL
```

**Special Features:**
- "Action Needed" badge when pending approval > 0

**Refresh Interval:** 5 minutes

---

### 3. RSVP TRENDS WIDGET

**Location:** `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`

**Purpose:** Monitor event attendance and RSVP patterns

**Metrics Displayed:**
- **Confirmed** - RSVPs with status='confirmed'
- **Pending** - RSVPs with status='pending'
- **Total RSVPs** - All RSVP submissions
- **Expected Guests** - Sum of num_guests field
- **7-Day Trend Chart** - Line chart of RSVP submissions over time

**Data Sources:**
```typescript
// Primary Table
- rsvps

// Queries
1. Confirmed: SELECT COUNT(*) FROM rsvps WHERE status='confirmed'
2. Pending: SELECT COUNT(*) FROM rsvps WHERE status='pending'
3. Total: SELECT COUNT(*) FROM rsvps
4. Guests: SELECT SUM(num_guests) FROM rsvps
5. Trend: Daily aggregation of RSVPs by created_at for last 7 days
```

**Visualization:**
- Uses `LineChart` component from `src/components/admin/Analytics/Charts/LineChart.tsx`
- Blue line showing RSVP count per day

**Refresh Interval:** 5 minutes

---

### 4. PHOTO POPULARITY WIDGET

**Location:** `src/components/admin/DashboardWidgets/PhotoPopularityWidget.tsx`

**Purpose:** Display most-liked photos

**Display:**
- Top 10 photos ranked by likes_count
- Thumbnail images with signed URLs
- Photo caption or "Untitled Photo"
- Like count with heart icon

**Data Sources:**
```typescript
// Primary Tables
- photos
- Storage: 'gallery' bucket

// Query
SELECT id, storage_path, caption, likes_count
FROM photos
WHERE is_approved = true
ORDER BY likes_count DESC
LIMIT 10

// Additional Processing
- Generate signed URLs from storage_path
- 1 hour expiry on signed URLs
```

**Special Features:**
- Scrollable list (400px height)
- Real-time thumbnail display
- Fallback for missing images

**Refresh Interval:** 5 minutes

---

### 5. GUESTBOOK ACTIVITY WIDGET

**Location:** `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`

**Purpose:** Monitor guestbook engagement and user contributions

**Metrics Displayed:**
- **Total Posts** - All non-deleted guestbook entries
- **Contributors** - Unique users who posted
- **Reactions** - Total emoji reactions
- **Recent Posts** (scrollable) - Last 10 posts with message preview
- **Top Contributors** - Users with most posts (top 3)
- **Popular Reactions** - Most used emojis (top 3)

**Data Sources:**
```typescript
// Primary Tables
- guestbook
- guestbook_reactions

// Queries
1. Total posts: SELECT COUNT(*) FROM guestbook WHERE deleted_at IS NULL
2. Recent: SELECT * FROM guestbook WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10
3. Contributors: Aggregate by display_name, count posts
4. Reactions: Aggregate by emoji, count occurrences
```

**Layout:**
- 3-column summary stats at top
- Scrollable recent posts section
- Split view: Top Contributors | Popular Reactions

**Refresh Interval:** 5 minutes

---

### 6. SYSTEM HEALTH WIDGET

**Location:** `src/components/admin/DashboardWidgets/SystemHealthWidget.tsx`

**Purpose:** Monitor application performance and errors

**Metrics Displayed:**
- **Avg Page Load** - Average page load time in milliseconds
- **Errors (1h)** - Error count in last hour
- **Active Sessions** - Sessions active in last hour
- **Query Performance** - Overall database query performance rating

**Status Indicators:**
- 🟢 **HEALTHY** - All systems normal
- 🟡 **WARNING** - Some degradation detected
- 🔴 **CRITICAL** - Immediate attention needed

**Data Sources:**
```typescript
// Primary Tables
- system_metrics
- user_sessions

// Queries
1. Page load: SELECT AVG(metric_value) FROM system_metrics WHERE metric_type='page_load_time' AND recorded_at >= [1h ago]
2. Errors: SELECT COUNT(*) FROM system_metrics WHERE metric_type='error' AND recorded_at >= [1h ago]
3. Sessions: SELECT COUNT(*) FROM user_sessions WHERE started_at >= [1h ago] OR ended_at IS NULL
```

**Performance Thresholds:**
```typescript
Query Performance:
- Good: < 1000ms
- Warning: 1000-2000ms
- Critical: > 2000ms

Status Determination:
- Critical: errors > 10 OR query_performance = critical
- Warning: errors > 5 OR query_performance = warning
- Healthy: Otherwise
```

**Refresh Interval:** 2 minutes (faster for real-time monitoring)

---

### 7. REALTIME ACTIVITY FEED WIDGET

**Location:** `src/components/admin/DashboardWidgets/RealtimeActivityFeed.tsx`

**Purpose:** Live stream of user actions across the platform

**Display:**
- Last 20 user activities
- User display name or "Anonymous"
- Action type (formatted)
- Time ago (e.g., "5m ago")
- Category badge
- Scrollable feed (500px height)

**Activity Categories:**
- 📸 **Content** - Photo uploads, edits
- ⚡ **Engagement** - Likes, reactions, comments
- 🧭 **Navigation** - Page views, clicks
- 📝 **RSVP** - RSVP submissions
- 💬 **Guestbook** - Guestbook posts

**Data Sources:**
```typescript
// Primary Tables
- user_activity_logs
- profiles (for display names)

// Query
SELECT 
  id, action_type, action_category, created_at, user_id
FROM user_activity_logs
ORDER BY created_at DESC
LIMIT 20

// Join profiles for display_name
```

**Special Features:**
- 🟢 **Live** badge with pulse animation
- Color-coded activity icons
- Relative timestamps that update
- Hover effects on activity cards

**Refresh Interval:** 30 seconds (near real-time)

---

## DATABASE ARCHITECTURE

### Analytics Tables

#### 1. `user_sessions`
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

**Purpose:** Track user session lifecycle and metrics

**Indexes:**
```sql
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON user_sessions(started_at DESC);
```

---

#### 2. `page_views`
```sql
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
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

**Purpose:** Track individual page views and navigation

**Indexes:**
```sql
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
```

---

#### 3. `user_activity_logs`
```sql
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose:** Log all user actions for activity feed

**Common Action Types:**
- `photo_upload`, `photo_edit`, `photo_like`
- `guestbook_post`, `guestbook_reply`, `guestbook_reaction`
- `rsvp_submit`, `rsvp_update`
- `page_view`, `button_click`, `form_submit`

**Indexes:**
```sql
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_category ON user_activity_logs(action_category);
```

---

#### 4. `content_interactions`
```sql
CREATE TABLE public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose:** Track user interactions with specific content

**Common Interactions:**
- `content_type='photo'`, `interaction_type='view'`
- `content_type='photo'`, `interaction_type='like'`
- `content_type='guestbook'`, `interaction_type='view'`
- `content_type='vignette'`, `interaction_type='view'`

**Indexes:**
```sql
CREATE INDEX idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX idx_content_interactions_content ON content_interactions(content_type, content_id);
CREATE INDEX idx_content_interactions_created_at ON content_interactions(created_at DESC);
```

---

#### 5. `system_metrics`
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

**Purpose:** Store system performance metrics

**Common Metric Types:**
- `page_load_time` (milliseconds)
- `error` (error occurrence)
- `db_query_time` (milliseconds)
- `api_response_time` (milliseconds)

**Indexes:**
```sql
CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);
```

---

#### 6. `analytics_daily_aggregates`
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

**Purpose:** Pre-computed daily metrics for performance optimization

---

### Content Tables

#### 7. `photos`
```sql
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
```

**Purpose:** Store photo gallery uploads

**Special Fields:**
- `storage_path`: Path in Supabase Storage 'gallery' bucket
- `tags`: Array for categorization (e.g., ['vignette-selected'])
- `likes_count`: Denormalized count for performance

---

#### 8. `photo_reactions`
```sql
CREATE TABLE public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id, reaction_type)
);
```

**Purpose:** Track likes and other reactions to photos

---

#### 9. `guestbook`
```sql
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
```

**Purpose:** Store guestbook messages

**Features:**
- Soft delete via `deleted_at`
- Anonymous posting support

---

#### 10. `guestbook_reactions`
```sql
CREATE TABLE public.guestbook_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES guestbook(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);
```

**Purpose:** Track emoji reactions to guestbook posts

---

#### 11. `rsvps`
```sql
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  is_approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  additional_guests TEXT[],
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose:** Manage event RSVPs and attendance

**Status Values:**
- `'pending'` - Awaiting confirmation
- `'confirmed'` - Attendance confirmed
- `'cancelled'` - RSVP cancelled

---

#### 12. `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose:** Extended user profile information

---

## DATA FLOW & APIs

### Analytics API
**Location:** `src/lib/analytics-api.ts`

**Key Functions:**

#### Session Management
```typescript
// Create new session
createSession(): Promise<{ data: string | null; error: any }>

// Update session metrics
updateSession(sessionId: string, updates: {
  pages_viewed?: number;
  actions_taken?: number;
  duration_seconds?: number;
}): Promise<{ error: any }>

// End session
endSession(sessionId: string): Promise<{ error: any }>
```

#### Tracking Functions
```typescript
// Track page view
trackPageView(data: PageViewData): Promise<{ data: string | null; error: any }>

// Track user action
trackActivity(data: ActivityData): Promise<{ error: any }>

// Track content interaction
trackContentInteraction(data: ContentInteractionData): Promise<{ error: any }>
```

#### Admin Queries
```typescript
// Get analytics summary
getAnalyticsSummary(
  startDate?: Date,
  endDate?: Date
): Promise<{ data: any; error: any }>
```

---

### Analytics Hooks

#### Session Tracking Hook
**Location:** `src/hooks/use-session-tracking.ts`

**Purpose:** Manage user session lifecycle

**Features:**
- Auto-creates session on mount
- 30-minute timeout
- Tracks user activity (mouse, keyboard, scroll)
- Persists session ID in sessionStorage
- Ends session on page unload

**Usage:**
```typescript
const { sessionId, isActive, startSession, endSession } = useSessionTracking();
```

---

#### Analytics Tracking Hook
**Location:** `src/hooks/use-analytics-tracking.ts`

**Purpose:** Track page views and events

**Features:**
- Auto-tracks page views on route change
- Updates time-on-page when leaving
- Increments session counters
- Provides event tracking functions

**Usage:**
```typescript
const { trackEvent, trackInteraction, isTracking } = useAnalyticsTracking({
  sessionId,
  enabled: true
});

// Track custom event
trackEvent('button_click', 'engagement', { button_id: 'submit-rsvp' });

// Track content interaction
trackInteraction('photo', photoId, 'like');
```

---

### Analytics Context
**Location:** `src/contexts/AnalyticsContext.tsx`

**Purpose:** Global analytics state provider

**Provides:**
```typescript
interface AnalyticsContextType {
  sessionId: string | null;
  isTracking: boolean;
  trackEvent: (actionType, actionCategory, actionDetails?) => Promise<void>;
  trackInteraction: (contentType, contentId, interactionType, interactionValue?) => Promise<void>;
}
```

**Usage:**
```typescript
import { useAnalytics } from '@/contexts/AnalyticsContext';

const { sessionId, trackEvent } = useAnalytics();
```

---

### Widget Wrapper Component
**Location:** `src/components/admin/AnalyticsWidgets/WidgetWrapper.tsx`

**Purpose:** Standardized container for all dashboard widgets

**Features:**
- Consistent card styling
- Refresh button with loading state
- Collapsible sections (optional)
- Header actions support
- Badge support (e.g., "Live", status indicators)

**Props:**
```typescript
interface WidgetWrapperProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerAction?: ReactNode;
  badge?: ReactNode;
}
```

---

## FILE LOCATIONS

### Dashboard Components
```
src/pages/
  └── AdminDashboard.tsx                    # Main dashboard page

src/components/admin/
  ├── AnalyticsWidgets.tsx                  # Analytics overview widget container
  └── DashboardWidgets/
      ├── index.ts                          # Widget exports
      ├── UserEngagementWidget.tsx          # User metrics
      ├── ContentMetricsWidget.tsx          # Content statistics
      ├── RsvpTrendsWidget.tsx              # RSVP analytics with chart
      ├── PhotoPopularityWidget.tsx         # Top photos by likes
      ├── GuestbookActivityWidget.tsx       # Guestbook stats
      ├── SystemHealthWidget.tsx            # Performance monitoring
      └── RealtimeActivityFeed.tsx          # Live activity stream
```

### Supporting Components
```
src/components/admin/
  ├── AnalyticsWidgets/
  │   ├── WidgetWrapper.tsx                 # Reusable widget container
  │   ├── ErrorWidget.tsx                   # Error state display
  │   ├── LoadingWidget.tsx                 # Loading state skeleton
  │   └── TestWidget.tsx                    # Development testing widget
  │
  ├── Analytics/Charts/
  │   ├── index.ts                          # Chart component exports
  │   ├── LineChart.tsx                     # Line chart (Recharts)
  │   ├── AreaChart.tsx                     # Area chart
  │   ├── BarChart.tsx                      # Bar chart
  │   ├── PieChart.tsx                      # Pie chart
  │   ├── GaugeChart.tsx                    # Gauge/radial chart
  │   └── ComparisonChart.tsx               # Comparison visualization
  │
  └── DashboardSettings.tsx                 # Widget visibility settings
```

### Data & API Layer
```
src/lib/
  ├── analytics-api.ts                      # Analytics data functions
  ├── analytics-export.ts                   # CSV/PDF export utilities
  └── logger.ts                             # Logging utility

src/hooks/
  ├── use-analytics-tracking.ts             # Analytics tracking hook
  └── use-session-tracking.ts               # Session lifecycle management

src/contexts/
  └── AnalyticsContext.tsx                  # Global analytics provider
```

### Database Migrations
```
supabase/migrations/
  ├── 20251012200000_create_analytics_tables.sql
  ├── 20251013012446_1b1b0e10-103e-4408-a3c5-584369a3c420.sql
  └── [other content-related migrations]
```

---

## QUERY OPTIMIZATION STRATEGIES

### Performance Features

#### 1. React Query Caching
All widgets use `@tanstack/react-query` for:
- Automatic data caching
- Configurable refetch intervals
- Background refetching
- Optimistic updates

#### 2. Database Indexes
Critical indexes on frequently queried columns:
```sql
-- Session queries
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON user_sessions(started_at DESC);

-- Activity queries
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);

-- Content queries
CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_content_interactions_content ON content_interactions(content_type, content_id);
```

#### 3. Daily Aggregates
Pre-computed metrics in `analytics_daily_aggregates` table:
- Reduces repeated complex queries
- Background job updates (planned)
- Instant retrieval for historical data

#### 4. Signed URL Caching
Photo signed URLs:
- 1-hour expiry
- Generated on-demand
- Cached in React Query

---

## ROW LEVEL SECURITY (RLS)

### Admin-Only Access
All analytics tables have RLS policies:

```sql
-- Example: user_sessions
CREATE POLICY "Admins can view user_sessions" 
  ON public.user_sessions FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert user_sessions" 
  ON public.user_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update user_sessions" 
  ON public.user_sessions FOR UPDATE 
  USING (true);
```

**Key Points:**
- ✅ Admins can READ all analytics data
- ✅ System can INSERT/UPDATE tracking data (all users)
- ❌ Regular users cannot READ analytics data
- ✅ Users can generate their own tracking data

---

## EXPORT CAPABILITIES

### CSV Export
**Location:** `src/lib/analytics-export.ts`

**Function:** `exportToCSV(data)`

**Exports:**
- Traffic trends
- User engagement metrics
- Content statistics
- RSVP data
- System health metrics

### PDF Export
**Function:** `exportToPDF(data)`

**Includes:**
- Dashboard title and date range
- Summary metrics table
- Data tables
- Formatted for printing

---

## WIDGET CUSTOMIZATION

### Dashboard Settings
**Location:** `src/components/admin/DashboardSettings.tsx`

**Features:**
- Toggle widget visibility
- Settings saved to localStorage
- Persists across sessions

**Default Configuration:**
```typescript
const DEFAULT_VISIBILITY: WidgetVisibility = {
  userEngagement: true,
  contentMetrics: true,
  rsvpTrends: true,
  photoPopularity: true,
  guestbookActivity: true,
  systemHealth: true,
  realtimeActivity: true,
};
```

---

## FUTURE ENHANCEMENTS

### Planned Features
1. **Real-time Updates** - WebSocket integration for live data
2. **Custom Date Ranges** - User-selectable time periods
3. **Drill-down Reports** - Click metrics for detailed views
4. **Email Alerts** - Automated notifications for critical metrics
5. **Comparison Mode** - Period-over-period comparisons
6. **Widget Layouts** - Drag-and-drop arrangement
7. **Data Aggregation Jobs** - Automated daily rollups

### Performance Improvements
1. **Query Optimization** - Materialized views for complex queries
2. **Caching Layer** - Redis caching for frequent queries
3. **Pagination** - Limit result sets for large datasets
4. **Lazy Loading** - Progressive data loading

---

## TROUBLESHOOTING

### Common Issues

#### Widget Shows "Failed to load..."
**Cause:** Database query error or RLS policy blocking access
**Solution:** 
1. Check browser console for error details
2. Verify admin user has `is_admin()` returning true
3. Check RLS policies on analytics tables

#### Metrics Show Zero
**Cause:** No analytics data collected or session not tracking
**Solution:**
1. Verify `AnalyticsProvider` wraps app in `App.tsx`
2. Check `user_sessions` table has records
3. Verify tracking hooks are enabled

#### Slow Performance
**Cause:** Missing indexes or large dataset
**Solution:**
1. Check database indexes exist
2. Consider implementing `analytics_daily_aggregates`
3. Reduce refetch intervals if needed

---

## CONTACT & MAINTENANCE

### Key Dependencies
- **React Query** (`@tanstack/react-query`) - Data fetching/caching
- **Recharts** (`recharts`) - Chart visualizations
- **Supabase** (`@supabase/supabase-js`) - Backend/database
- **Lucide React** (`lucide-react`) - Icons
- **ShadcN UI** - Component library (DO NOT MODIFY)

### Development Guidelines
- ✅ Can modify: Page components, DashboardWidgets, hooks, API functions
- ❌ Never modify: `src/components/ui/` directory (ShadcN components)
- ❌ Never modify: Core configuration files (see LOVABLE_AI_RULES.md)

---

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**Maintained By:** Development Team

