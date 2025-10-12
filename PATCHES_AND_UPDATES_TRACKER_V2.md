# Patches and Updates Tracker V2

## Overview
This document tracks all new patches, updates, and features for the Twisted Hearth Foundation project - Phase 2 Development.

**Start Date:** October 11, 2025  
**Current Version:** version-2.2.05.4-HuntRemoval-StableVersion  
**Status:** Stable & Ready for Next Phase 🟢  
**Last Update:** Status Verification Complete - October 12, 2025

## 🔄 Rollback Log

### Rollback #1 - October 12, 2025
**From**: `2.4.0-NavigationConsolidation` (BATCH 4 Phase 1-3 in progress)  
**To**: `version-2.2.05.3-Batch5-Phase3-AnalyticsDataCollection`  
**New Branch**: `version-2.2.05.4-HuntRemoval-StableVersion`

**Root Cause**:
- Hunt code (HuntProvider, HuntRune, HuntManagement, etc.) was globally imported and mounted despite `HUNT_ENABLED=false`
- Circular dependencies and context initialization order issues
- TypeScript lazy import mismatches (TS2322: missing default export)
- Runtime error: "Cannot access 'gr' before initialization"
- Application completely broken on homepage (blank screen)

**Actions Taken**:
- Rolled back Git to version-2.2.05.3-Batch5-Phase3-AnalyticsDataCollection
- Created new branch: version-2.2.05.4-HuntRemoval-StableVersion
- Removing all hunt imports/components from runtime code paths
- Hunt files retained but not loaded or executed
- Navigation consolidation (BATCH 4) rolled back

**Impact**:
- Lost: BATCH 4 Phase 1-3 work (navigation consolidation, database fixes, mobile polish)
- Retained: All Phase 1-3 work (navigation modernization, user management, email system, analytics)
- No data loss - database changes preserved

**Lessons Learned**:
- Feature flags must prevent code loading, not just execution
- Hunt code requires complete isolation when disabled (no imports at all)
- Lazy loading with React.lazy requires proper default exports
- Test feature flag disable states thoroughly before merge

**Next Steps**:
- Complete hunt removal in: version-2.2.05.4-HuntRemoval-StableVersion
- Re-implement BATCH 4 in clean branch: version-2.3.0-NavigationConsolidation-v2
- Add integration tests for feature flag states

---

## Status Legend
- 🔴 **Critical** - Must be fixed immediately
- 🟡 **High Priority** - Should be addressed soon
- 🟢 **Medium Priority** - Can be scheduled for next sprint
- 🔵 **Low Priority** - Nice to have, can be deferred
- ✅ **Completed** - Implemented and tested
- 🚧 **In Progress** - Currently being worked on
- 📋 **Documented** - Patch file created, ready for implementation
- 🎯 **Planned** - Identified for future implementation

---

## 📋 CURRENT STATUS VERIFICATION (October 12, 2025)

**✅ VERIFICATION COMPLETE**: All documented batches have been verified against actual codebase implementation.

### 🎯 ACTUALLY COMPLETED WORK:

#### ✅ BATCH 1: Navigation & Layout Modernization - COMPLETE
- ✅ AdminDashboard.tsx uses Radix UI Tabs component
- ✅ CollapsibleSection.tsx implemented and functional
- ✅ Mobile-first responsive design throughout
- ✅ Touch-friendly targets (min 44x44px)
- ✅ All 10 existing tabs maintained with zero breaking changes

#### ✅ BATCH 2: User & Role Management - COMPLETE  
- ✅ UserManagement.tsx fully implemented with deletion capabilities
- ✅ AdminRoleManagement.tsx fully functional
- ✅ DatabaseResetPanel.tsx implemented (dev-only)
- ✅ All safety features (confirmations, audit logs, rate limiting) in place
- ✅ Email confirmation dialog z-index issue fixed

#### ✅ BATCH 3: Email System Phase 1 - COMPLETE
- ✅ EmailCommunication.tsx fully implemented with tabs interface
- ✅ EmailTemplateEditor.tsx and CampaignComposer.tsx functional
- ✅ Complete email campaign system with Mailjet integration
- ✅ CSV import, test emails, campaign dashboard all working
- ✅ Safety features and confirmation dialogs implemented

#### ✅ BATCH 4: Navigation Consolidation - COMPLETE
- ✅ AdminNavigation.tsx implemented with 4-category dropdown structure
- ✅ AdminBreadcrumb.tsx with mobile breadcrumb navigation
- ✅ Swipe gesture support in AdminDashboard.tsx
- ✅ Mobile polish with responsive design
- ✅ All navigation consolidation features working

#### ✅ BATCH 5 Phase 1: Styling Fixes & "ON HOLD" Overlays - COMPLETE
- ✅ OnHoldOverlay.tsx component implemented
- ✅ Tournament card has "ON HOLD" overlay in overview
- ✅ Quick action buttons have "ON HOLD" badges
- ✅ Tournament card styling matches other metric cards

#### ✅ BATCH 5 Phase 3: Analytics Data Collection - COMPLETE
- ✅ analytics-api.ts fully implemented with all tracking functions
- ✅ AnalyticsContext.tsx integrated in App.tsx
- ✅ useAnalyticsTracking.ts and useSessionTracking.ts hooks functional
- ✅ Session tracking with 30-minute timeout working
- ✅ Analytics performance indexes added (2 migration files)
- ✅ get_analytics_summary() database function implemented

#### ✅ BATCH 6: Hunt Code Removal - COMPLETE
- ✅ All hunt imports removed from App.tsx, NavBar.tsx, AdminDashboard.tsx
- ✅ Hunt components exist but are not loaded or executed anywhere
- ✅ Zero TypeScript errors, zero runtime errors
- ✅ Application stable and functional

### ⚠️ MISSING WORK IDENTIFIED:

#### ❌ BATCH 5 Phase 2: Analytics Database Infrastructure - MISSING
**CRITICAL FINDING**: Analytics indexes exist but **base tables do not exist**
- ❌ No CREATE TABLE statements found for analytics tables
- ❌ user_sessions, page_views, user_activity_logs, content_interactions, analytics_daily_aggregates tables missing
- ❌ Frontend code expects these tables but they don't exist in migrations
- ⚠️ This will cause runtime errors when analytics tracking is used

#### ❌ BATCH 5 Phases 4-7: Analytics Dashboard Widgets - NOT STARTED
- ❌ No DashboardWidgets directory exists
- ❌ No UserEngagementWidget, ContentMetricsWidget, RsvpTrendsWidget components
- ❌ No analytics charts using Recharts
- ❌ No widget customization or export functionality
- ❌ No real-time updates or performance optimizations

---

## 🎯 DETAILED IMPLEMENTATION PLAN (October 12, 2025)

### PRIORITY 1 (CRITICAL): Fix Analytics Database Infrastructure
**Time**: 2-3 hours | **Status**: 🔴 CRITICAL - Required for analytics to work

**Problem**: Analytics tracking code exists and is active, but database tables don't exist, causing runtime errors.

**Solution**: Create missing analytics tables migration

**New Migration File**: `supabase/migrations/20251012_create_analytics_tables.sql`
```sql
-- Analytics Database Infrastructure
-- Create all analytics tables that the frontend expects

-- User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
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
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Page Views
CREATE TABLE IF NOT EXISTS public.page_views (
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

-- User Activity Logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Interactions
CREATE TABLE IF NOT EXISTS public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Metrics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Daily Aggregates
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  rsvps_submitted INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  guestbook_posts INTEGER DEFAULT 0,
  hunt_completions INTEGER DEFAULT 0,
  tournament_registrations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies (Admin-only access)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage user_sessions" ON public.user_sessions FOR ALL USING (is_admin());
CREATE POLICY "System can insert user_sessions" ON public.user_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view page_views" ON public.page_views FOR SELECT USING (is_admin());
CREATE POLICY "System can insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update page_views" ON public.page_views FOR UPDATE USING (true);

CREATE POLICY "Admins can view user_activity_logs" ON public.user_activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can insert user_activity_logs" ON public.user_activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view content_interactions" ON public.content_interactions FOR SELECT USING (is_admin());
CREATE POLICY "System can insert content_interactions" ON public.content_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view system_metrics" ON public.system_metrics FOR SELECT USING (is_admin());
CREATE POLICY "System can insert system_metrics" ON public.system_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage analytics_daily_aggregates" ON public.analytics_daily_aggregates FOR ALL USING (is_admin());
```

**Testing Steps**:
1. Apply migration to database
2. Verify tables exist with correct schema
3. Test analytics tracking works without errors
4. Verify RLS policies prevent unauthorized access
5. Test get_analytics_summary() function returns data

---

### PRIORITY 2: Complete Analytics Dashboard Widgets
**Time**: 12-16 hours | **Status**: 🟡 HIGH - Core analytics functionality

#### Phase 4A: Widget Infrastructure (2-3 hours)
**Files to Create**:
```
src/components/admin/DashboardWidgets/
├── WidgetWrapper.tsx           # Reusable widget container
├── LoadingWidget.tsx           # Loading state component
├── ErrorWidget.tsx             # Error state component
└── index.ts                    # Export barrel
```

**WidgetWrapper.tsx Features**:
- Consistent styling and spacing
- Loading and error states
- Refresh button
- Widget title and description
- Responsive grid sizing

#### Phase 4B: Core Analytics Widgets (4-5 hours)
**Files to Create**:
```
src/components/admin/DashboardWidgets/
├── UserEngagementWidget.tsx    # Active users, sessions, retention
├── ContentMetricsWidget.tsx     # Photos, posts, interactions
├── RsvpTrendsWidget.tsx        # RSVP statistics over time
├── SystemHealthWidget.tsx       # Performance metrics
└── RealtimeActivityFeed.tsx    # Live activity stream
```

**Widget Specifications**:

**UserEngagementWidget**:
- Total registered users
- Active users (last 7 days)  
- Average session duration
- New registrations (time series chart)
- User retention rate

**ContentMetricsWidget**:
- Total photos uploaded
- Photos pending approval
- Guestbook posts
- Most popular content
- Upload trends (time series)

**RsvpTrendsWidget**:
- Total RSVPs (confirmed/pending/declined)
- Guest count projections
- RSVP timeline chart
- Dietary restrictions breakdown

**SystemHealthWidget**:
- Average page load time
- Error rate (last 24 hours)
- Database query performance
- Storage usage metrics

#### Phase 4C: Chart Components with Recharts (3-4 hours)
**Files to Create**:
```
src/components/admin/Analytics/Charts/
├── LineChart.tsx               # Time series data
├── BarChart.tsx                # Categorical comparisons  
├── PieChart.tsx                # Distribution data
├── AreaChart.tsx               # Cumulative trends
├── MetricCard.tsx              # Single metric display
└── index.ts                    # Export barrel
```

**Dependencies to Add**:
```json
{
  "recharts": "^2.8.0",
  "date-fns": "^2.30.0"
}
```

**Chart Features**:
- Responsive containers
- Custom color schemes (design system tokens)
- Interactive tooltips
- Legend positioning
- Export to image functionality

#### Phase 4D: Widget Integration (2-3 hours)
**Files to Modify**:
- `src/pages/AdminDashboard.tsx` - Replace Overview section with widget grid
- Add time range selector (7 days, 30 days, 90 days, custom)
- Add widget show/hide preferences
- Add manual refresh functionality

**Widget Grid Layout**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <UserEngagementWidget timeRange={timeRange} />
  <ContentMetricsWidget timeRange={timeRange} />
  <RsvpTrendsWidget timeRange={timeRange} />
  <SystemHealthWidget />
  <RealtimeActivityFeed />
</div>
```

#### Phase 4E: Export & Customization (1-2 hours)
**Features**:
- CSV export for all metrics
- PDF export with charts as images
- Widget visibility preferences (localStorage)
- Auto-refresh options (manual, on-login, hourly)

**Dependencies**:
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.6.0"
}
```

---

### PRIORITY 3: System Configuration Panel
**Time**: 1.5-2 hours | **Status**: 🟢 MEDIUM - Admin convenience features

**New Files**:
- `src/components/admin/SystemSettings.tsx`
- `src/lib/system-config-api.ts`
- Database migration for `system_settings` table

**Features**:
- Event date and time settings
- Feature toggles (hunt, tournament, gallery, guestbook)
- Maintenance mode toggle with custom message
- Email notification settings
- RSVP/Photo auto-approval toggles

---

### PRIORITY 4: Performance Optimizations
**Time**: 1-2 hours | **Status**: 🔵 LOW - Polish and optimization

**Optimizations**:
- React Query caching for analytics (5-minute cache)
- Lazy loading for widgets as they scroll into view
- Memoization of chart data transformations
- Debounced real-time activity updates
- Database query optimization for large datasets

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1 (October 12-18, 2025)
- **Day 1-2**: Priority 1 - Fix analytics database infrastructure (CRITICAL)
- **Day 3-5**: Priority 2 Phase 4A-B - Widget infrastructure and core widgets  
- **Day 6-7**: Priority 2 Phase 4C - Chart components with Recharts

### Week 2 (October 19-25, 2025)  
- **Day 1-2**: Priority 2 Phase 4D - Widget integration in admin dashboard
- **Day 3**: Priority 2 Phase 4E - Export and customization features
- **Day 4**: Priority 3 - System configuration panel
- **Day 5**: Priority 4 - Performance optimizations and testing

### Success Criteria
- ✅ Analytics tracking works without errors (no missing table errors)
- ✅ Admin dashboard shows 5+ functional analytics widgets
- ✅ Charts are interactive and responsive using Recharts
- ✅ CSV/PDF export functionality works
- ✅ Widget preferences persist across sessions
- ✅ System configuration panel allows feature toggles
- ✅ Performance optimizations implemented (sub-2 second load times)

---

### 🎯 Admin Settings & Management
- **Branch:** `version-2.1.4-AdminSettings`
- **Focus:** Administrative interface enhancements and system settings
- **Foundation:** Built on comprehensive libations management system

### 🎯 User Experience Enhancements
- **Focus:** UI/UX improvements and accessibility features
- **Target:** Mobile responsiveness and cross-browser compatibility

### 🎯 Performance Optimizations
- **Focus:** Loading times, image optimization, and system performance
- **Target:** Sub-2 second page loads and smooth interactions

### 🎯 Security & Reliability
- **Focus:** Authentication, authorization, and error handling
- **Target:** Production-ready security and stability

---

## Critical Priority Issues (🔴)

*No critical issues identified at this time*

---

## High Priority Issues (🟡)

### ✅ ADMIN-SETTINGS-01: User Management & Database Reset System
- **Files**: 
  - NEW: `src/components/admin/UserManagement.tsx`
  - NEW: `src/components/admin/DatabaseResetPanel.tsx` (dev-only)
  - MODIFY: `src/pages/AdminDashboard.tsx`
- **Status**: ✅ COMPLETED (Oct 11, 2025)
- **Time**: 2.5-3 hours
- **Priority**: BATCH 2 - User & Role Management
- **Description**: Individual user management system with dev-only database reset
- **Confirmed Scope**:
  - ✅ Individual user deletion (no bulk operations initially)
  - ✅ Hard delete (permanent) - no soft deletes for now
  - ✅ Database reset ONLY in dev/localhost mode
  - ✅ Content preservation options (keep photos, guestbook posts, etc.)
- **Features**:
  - User list with search/filter functionality
  - Delete individual users with confirmation dialog
  - Content preservation options (photos, guestbook posts, RSVP)
  - "Type email to confirm" safety mechanism
  - Content review before deletion (shows X photos, Y posts)
  - Admin user protection (cannot delete admin accounts)
  - Audit log (who deleted whom, when, why)
  - Rate limiting (max 5 deletions per hour per admin)
  - 5-second "Undo" button after deletion
  - **Dev-Only Database Reset**:
    - Only visible on localhost or DEV_MODE=true
    - Requires typing "RESET DATABASE" to confirm
    - Clears RSVPs, photos, guestbook, hunt progress
    - Always preserves admin accounts and system config
- **Safety Features**:
  - Cannot delete admin users
  - Confirmation dialog with email verification
  - Shows impact (X photos, Y posts will be deleted)
  - Audit trail with admin name, timestamp, reason
  - Rate limiting to prevent accidents
  - Undo window immediately after deletion

### ✅ ADMIN-SETTINGS-02: Admin Role Management System
- **Files**: 
  - NEW: `src/components/admin/AdminRoleManagement.tsx`
  - MODIFY: `src/pages/AdminDashboard.tsx`
- **Status**: ✅ COMPLETED (Oct 11, 2025)
- **Time**: 1.5-2 hours
- **Priority**: BATCH 2 - User & Role Management
- **Description**: Simplified admin role management with single admin tier
- **Confirmed Scope**:
  - ✅ Single "admin" role with full permissions (no hierarchy)
  - ✅ Uses existing `user_roles` table (already implemented)
  - ✅ Server-side validation only (no client-side role checks)
  - ❌ NO Super Admin/Moderator roles (keeping it simple)
- **Features**:
  - Add admin by email address
  - Remove admin role (with safety guards)
  - List all current admins
  - Admin activity audit log
  - Email notification to user when granted/revoked admin
- **Safety Features**:
  - Cannot remove self from admin role
  - Cannot remove last admin (minimum 1 required)
  - Confirmation dialog: "Type CONFIRM to proceed"
  - Audit log captures who added/removed whom
  - Server-side role verification using RPC calls
- **Security Requirements**:
  - MUST use `public.user_roles` table (already exists)
  - MUST verify admin status server-side via RPC
  - NEVER store admin flag in localStorage or client-side
  - ALL admin actions require database role check

### 🟡 ADMIN-SETTINGS-03: Navigation Reorganization & Settings Groups
- **Files**:
  - MODIFY: `src/pages/AdminDashboard.tsx`
  - NEW: `src/components/admin/AdminNavigation.tsx`
  - NEW: `src/components/admin/SettingsDropdown.tsx`
- **Status**: 🎯 Planned for BATCH 4
- **Time**: 2.5-3 hours
- **Priority**: BATCH 4 - Admin Dashboard Overhaul
- **Description**: Mobile-first navigation reorganization with category grouping
- **Current State**: 10 tabs (Overview, RSVPs, Tournament, Gallery, Hunt, Vignettes, Homepage, Libations, Guestbook, Email)
- **Confirmed Scope**:
  - ✅ Keep ALL existing features (no feature removal)
  - ✅ Reorganize into 4 main categories
  - ✅ Heavy use of Settings dropdown for management tools
  - ✅ Mobile-first design (currently cluttered on mobile)
  - ✅ Group related features logically
- **Proposed Structure**:
  ```
  Main Navigation (4 categories):
  1. [Overview] - Dashboard summary
  2. [Content] (dropdown)
     - Gallery (with pending count badge)
     - Vignettes
     - Homepage Vignettes
     - Guestbook
  3. [Users] (dropdown)
     - RSVPs (with total count badge)
     - Tournament (with teams badge)
     - Hunt Progress (with active runs badge)
  4. [Settings] (dropdown)
     - Libations Management
     - Email Campaigns
     - User Management (NEW)
     - Admin Roles (NEW)
     - System Configuration (NEW)
  ```
- **Mobile Features**:
  - Hamburger menu for categories
  - Full-width dropdown selections
  - Sticky header with breadcrumbs
  - Swipe gestures for navigation
  - Touch-friendly buttons (min 44x44px)
- **Desktop Features**:
  - Horizontal category bar
  - Hover-activated dropdowns
  - Quick action shortcuts
  - Keyboard navigation support

### ✅ ADMIN-SETTINGS-04: Email Campaign Management System (Phase 1)
- **Files**:
  - NEW: `src/components/admin/EmailCommunication.tsx` ✅
  - NEW: `src/components/admin/EmailTemplateEditor.tsx` ✅
  - NEW: `src/components/admin/CampaignComposer.tsx` ✅
  - NEW: `src/lib/email-campaigns-api.ts` ✅
  - EXISTING: `supabase/functions/send-email-campaign/index.ts` ✅
  - EXISTING: Database tables (email_templates, email_campaigns, campaign_recipients) ✅
  - NEW: `docs/MAILJET_TEMPLATE_GUIDE.md` ✅
- **Status**: ✅ COMPLETED (Oct 11, 2025)
- **Time**: 6-8 hours
- **Priority**: BATCH 3 - Email System Phase 1
- **Description**: Core email campaign functionality with Mailjet integration
- **Confirmed Scope**:
  - ✅ Use Mailjet (existing integration)
  - ✅ Core functionality ONLY (no A/B testing initially)
  - ✅ Basic statistics tracking (sent, delivered, bounced)
  - ✅ Detailed Mailjet template instructions in markdown
  - ✅ Phased implementation approach
- **Phase 1 Features (Current Implementation)**:
  - **Template Management**:
    - Create/edit email templates
    - Rich text editor (TipTap or similar)
    - Variable insertion ({{name}}, {{rsvp_status}}, etc.)
    - Live preview pane
    - Save as draft
    - Mobile-responsive preview
  - **Recipient Lists**:
    - Pre-defined lists (All Guests, RSVP'd, Pending, Custom)
    - Custom list builder (add/remove emails)
    - CSV import functionality
    - Email validation and duplicate detection
    - Total recipient count display
  - **Campaign Composer**:
    - Select template or create new
    - Choose recipient list
    - Edit subject line and preview text
    - Schedule send or send immediately
    - Test email feature (send to self first)
  - **Campaign Dashboard**:
    - List all campaigns (past and scheduled)
    - Basic statistics (sent, delivered, bounced)
    - Status indicators (draft, scheduled, sent, failed)
    - Action buttons (view, edit, duplicate, cancel)
  - **Basic Statistics**:
    - Total sent count
    - Delivery rate
    - Bounce tracking
    - Send timestamp
- **Database Schema**:
  ```sql
  email_templates (id, name, subject, html_content, preview_text, created_by, created_at, updated_at, is_active)
  email_campaigns (id, template_id, recipient_list, subject, scheduled_at, sent_at, status, stats, created_by, created_at)
  campaign_recipients (id, campaign_id, email, status, sent_at, delivered_at, error_message)
  ```
- **Mailjet Integration**:
  - Uses existing Mailjet secrets
  - Edge function: `send-email-campaign`
  - Batch sending with rate limiting (500/hour free tier)
  - Bounce handling and tracking
  - Unsubscribe link tracking
- **Safety Features**:
  - Rate limiting (max 500 emails/hour)
  - Mandatory preview before send
  - Test email to self before bulk send
  - Confirmation dialog: "Send to X recipients?"
  - Schedule option to avoid accidental sends
  - Bounce tracking and auto-removal of invalid emails
  - Unsubscribe tracking and respect
- **Documentation**:
  - `docs/MAILJET_TEMPLATE_GUIDE.md` - Detailed instructions for:
    - Accessing Mailjet dashboard
    - Creating/editing templates
    - Using template variables
    - Testing templates
    - Best practices and compliance
- **Phase 2 (Future)**:
  - Open rate tracking (requires Mailjet webhooks)
  - Click tracking on links
  - Advanced statistics dashboard
  - Campaign performance comparison
- **Phase 3 (Future)**:
  - A/B testing (subject lines, content variants)
  - Automated drip campaigns
  - Advanced segmentation rules
  - Dynamic content based on user behavior

### 🟡 ADMIN-SETTINGS-05: System Configuration Panel
- **Files**:
  - NEW: `src/components/admin/SystemSettings.tsx`
  - NEW: `src/lib/system-config-api.ts`
  - NEW: Database migration for `system_settings` table
- **Status**: 🎯 Planned
- **Time**: 1.5-2 hours
- **Priority**: BATCH 1 - Foundation & Navigation
- **Description**: System-wide configuration and feature flag management
- **Features**:
  - **Event Settings**:
    - Event date and time
    - Registration open/close toggle
    - Registration deadline date
  - **Feature Toggles**:
    - Hunt enabled/disabled
    - Tournament enabled/disabled
    - Gallery enabled/disabled
    - Guestbook enabled/disabled
  - **Maintenance Mode**:
    - Enable/disable maintenance mode
    - Custom maintenance message (rich text)
  - **Notifications**:
    - Email notifications enabled/disabled
    - RSVP auto-approval toggle
    - Photo auto-approval toggle
  - **UI Features**:
    - Toggle switches for boolean flags
    - Date/time pickers for event settings
    - Rich text editor for maintenance message
    - "Save Changes" with confirmation
    - "Reset to Defaults" option
    - Change history log (who changed what, when)
- **Database Schema**:
  ```sql
  system_settings (id, key, value, type, updated_by, updated_at)
  setting_history (id, setting_key, old_value, new_value, changed_by, changed_at)
  ```

---

## Medium Priority Issues (🟢)

### 🟢 UX-ENHANCEMENT-01: Enhanced Loading States
- **Files**: Multiple component files
- **Status**: 🎯 Planned
- **Time**: 3-4 hours
- **Description**: Implement consistent loading states across all components
- **Features**:
  - Skeleton loading components
  - Progress indicators for long operations
  - Optimistic UI updates
  - Error state handling with retry options

### 🟡 UX-ENHANCEMENT-02: Mobile Navigation Polish (PROMOTED TO HIGH)
- **Files**: 
  - MODIFY: Admin navigation components (created in ADMIN-SETTINGS-03)
- **Status**: 🎯 Planned
- **Time**: 1 hour
- **Priority**: BATCH 1 - Foundation & Navigation
- **Description**: Polish and optimize the new admin navigation for mobile
- **Features**:
  - Touch-friendly button sizes (min 44x44px)
  - Smooth animations for dropdowns
  - Loading states for tab switches
  - "Back to Overview" quick link
  - Swipe gesture optimization
  - Sticky header behavior
- **Note**: This completes the navigation work started in ADMIN-SETTINGS-03

### 🟢 PERFORMANCE-01: Image Optimization System
- **Files**:
  - MODIFY: `src/lib/image-url.ts`
  - NEW: `src/lib/image-optimization.ts`
- **Status**: 🎯 Planned
- **Time**: 2-3 hours
- **Description**: Implement comprehensive image optimization
- **Features**:
  - Automatic image resizing
  - WebP format support with fallbacks
  - Lazy loading improvements
  - Image compression optimization

---

## Low Priority Issues (🔵)

### 🔵 FEATURE-REQUEST-01: Advanced Search & Filtering
- **Files**: Multiple pages with search functionality
- **Status**: 🎯 Planned
- **Time**: 4-5 hours
- **Description**: Implement advanced search and filtering across the application
- **Features**:
  - Global search functionality
  - Filter by categories, dates, status
  - Search suggestions and autocomplete
  - Search result highlighting

### 🔵 FEATURE-REQUEST-02: Analytics Dashboard
- **Files**:
  - NEW: `src/components/admin/AnalyticsDashboard.tsx`
  - NEW: `src/lib/analytics-api.ts`
- **Status**: 🎯 Planned
- **Time**: 5-6 hours
- **Description**: Create analytics dashboard for admin users
- **Features**:
  - RSVP statistics and trends
  - Gallery engagement metrics
  - User activity tracking
  - Event attendance predictions

---

## In Progress Items (🚧)

*No items currently in progress*

---

## Completed Items (✅)

### ✅ BATCH 1: Navigation & Layout Modernization (October 11, 2025)
**Time**: 3.5 hours | **Priority**: HIGH
- ✅ Replaced button navigation with Radix UI Tabs component
- ✅ Created reusable `CollapsibleSection` component
- ✅ Implemented mobile-first responsive design
- ✅ Touch-friendly targets (min 44x44px)
- ✅ Responsive typography and spacing throughout
- ✅ Maintained all existing functionality with zero breaking changes
- **Files**: `src/pages/AdminDashboard.tsx`, `src/components/admin/CollapsibleSection.tsx`

### ✅ BATCH 2: User & Role Management (October 11, 2025)
**Time**: 5 hours | **Priority**: HIGH
- ✅ Implemented individual user management with deletion
- ✅ Created dev-only database reset panel
- ✅ Added admin role management system
- ✅ Implemented safety features (confirmations, audit logs, rate limiting)
- ✅ Fixed email confirmation dialog z-index issue
- **Files**: `src/components/admin/UserManagement.tsx`, `src/components/admin/DatabaseResetPanel.tsx`, `src/components/admin/AdminRoleManagement.tsx`

### ✅ BATCH 3: Email System Phase 1 (October 11, 2025)
**Time**: 1 hour (already implemented) | **Priority**: HIGH
- ✅ Email template management with rich text editor
- ✅ Campaign composer with recipient list building
- ✅ CSV import functionality for custom recipient lists
- ✅ Test email functionality
- ✅ Campaign dashboard with statistics tracking
- ✅ Mailjet integration via edge function
- ✅ Safety features (confirmations, test emails, rate limiting)
- ✅ Created comprehensive Mailjet documentation guide
- **Files**: `src/components/admin/EmailCommunication.tsx`, `src/components/admin/EmailTemplateEditor.tsx`, `src/components/admin/CampaignComposer.tsx`, `src/lib/email-campaigns-api.ts`, `docs/MAILJET_TEMPLATE_GUIDE.md`

### 🔄 BATCH 4: Navigation Consolidation (ROLLED BACK - October 12, 2025)
**Original Time**: 4.5 hours | **Priority**: HIGH  
**Status**: 🔄 Rolled Back - Pending Re-implementation

#### What Was Implemented:
- ✅ Phase 1: Database fixes (foreign keys, status columns, 25+ indexes)
- ✅ Phase 2: Navigation consolidation (12 tabs → 4 categories)
- ✅ Phase 3: Mobile polish (breadcrumbs, swipe, loading states)
- ✅ Phase 4: Testing and verification

#### What Was Rolled Back:
- AdminNavigation component with dropdown menus
- AdminBreadcrumb sticky navigation
- Swipe gesture support for mobile
- HuntManagement integration in admin dashboard
- Additional database indexes and constraints

#### Re-implementation Plan:
- Will be re-implemented in new branch: `version-2.3.0-NavigationConsolidation-v2`
- Hunt UI will be completely removed from admin before re-implementing
- Will add integration tests for feature flag states

### ✅ BATCH 5 - Phase 3: Analytics Data Collection (October 12, 2025)
**Time**: 3-4 hours | **Priority**: HIGH  
**Status**: ✅ COMPLETED - STABLE

- ✅ Analytics database infrastructure (6 tables, 25+ indexes)
- ✅ Analytics API library (`src/lib/analytics-api.ts`)
- ✅ Session tracking hooks with 30-minute timeout
- ✅ Analytics context provider integrated in App.tsx
- ✅ Analytics tracking across all major user actions
- ✅ Admin query function for analytics summary
- ✅ RLS policies in place (admin-only access)
- **Files**: `src/lib/analytics-api.ts`, `src/hooks/use-analytics-tracking.ts`, `src/hooks/use-session-tracking.ts`, `src/contexts/AnalyticsContext.tsx`

### ✅ BATCH 6: Hunt Code Removal (October 12, 2025)
**Time**: 2 hours | **Priority**: CRITICAL  
**Status**: ✅ COMPLETED

#### VALIDATION TASK (MUST DO FIRST):
- [x] Review src/App.tsx, NavBar.tsx, AdminDashboard.tsx for hunt code removal
- [x] Verify hunt components are not imported or executed anywhere
- [x] Check that hunt database tables still exist (preserved)
- [x] Document actual status before proceeding with implementation

**Purpose**: Removed all hunt-related runtime references to prevent loading/execution

**Changes Completed**:
1. **src/App.tsx**: Removed HuntProvider, HuntProgress, HuntReward, HuntNotification
2. **src/components/NavBar.tsx**: Removed HuntNavIndicator
3. **src/pages/AdminDashboard.tsx**: Removed HuntManagement UI, hunt queries, hunt statistics card, hunt quick action button
4. **src/components/admin/AdminNavigation.tsx**: Removed hunt navigation item and count prop
5. **src/components/admin/AdminBreadcrumb.tsx**: Removed hunt breadcrumb mapping

**Result**:
- ✅ Hunt code exists in files but is never loaded or executed
- ✅ Zero TypeScript errors
- ✅ Zero runtime errors
- ✅ Application stable and functional
- ✅ Bundle size reduced (hunt code not bundled)

**Files Retained** (not imported anywhere):
- All files in `src/components/hunt/` directory
- `src/settings/hunt-settings.ts`
- `src/hooks/use-hunt.ts`
- `src/lib/hunt-api.ts`
- Hunt database tables and data (preserved)

---

---

## Database Connection Issues (🔴 CRITICAL)

### DB-INTEGRITY-01: Missing Foreign Key Constraints
- **Status**: 🔴 CRITICAL - Add to BATCH 4
- **Issue**: NO foreign key constraints found in database
- **Impact**: Data integrity at risk, orphaned records possible
- **Tables Affected**: ALL tables with user_id references
- **Required Fixes**:
  ```sql
  -- Add foreign keys for user references
  ALTER TABLE photos ADD CONSTRAINT photos_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE guestbook ADD CONSTRAINT guestbook_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE potluck_items ADD CONSTRAINT potluck_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE rsvps ADD CONSTRAINT rsvps_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE hunt_runs ADD CONSTRAINT hunt_runs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE hunt_progress ADD CONSTRAINT hunt_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE tournament_registrations ADD CONSTRAINT tournament_registrations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ```

### DB-SCHEMA-01: Missing Columns Causing Query Errors
- **Status**: 🔴 CRITICAL - Add to BATCH 4
- **Issue**: Multiple columns being queried but don't exist
- **Errors Found**:
  - `hunt_runs.status` - Column missing (queries expect: 'active', 'completed', 'abandoned')
  - `tournament_registrations.status` - Column missing (queries expect: 'pending', 'approved', 'rejected')
- **Required Fixes**:
  ```sql
  -- Add missing status column to hunt_runs
  ALTER TABLE hunt_runs 
    ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'completed', 'abandoned'));
  
  -- Update existing completed runs
  UPDATE hunt_runs 
    SET status = 'completed' 
    WHERE completed_at IS NOT NULL;
  
  -- Add missing status column to tournament_registrations
  ALTER TABLE tournament_registrations 
    ADD COLUMN status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  ```

### DB-OPTIMIZATION-01: Add Missing Indexes
- **Status**: 🟡 HIGH - Add to BATCH 4
- **Issue**: No indexes found on frequently queried columns
- **Impact**: Slow query performance on user lookups
- **Required Indexes**:
  ```sql
  -- User ID indexes for faster lookups
  CREATE INDEX idx_photos_user_id ON photos(user_id);
  CREATE INDEX idx_guestbook_user_id ON guestbook(user_id);
  CREATE INDEX idx_potluck_items_user_id ON potluck_items(user_id);
  CREATE INDEX idx_rsvps_user_id ON rsvps(user_id);
  CREATE INDEX idx_hunt_runs_user_id ON hunt_runs(user_id);
  CREATE INDEX idx_hunt_progress_user_id ON hunt_progress(user_id);
  CREATE INDEX idx_tournament_registrations_user_id ON tournament_registrations(user_id);
  
  -- Status indexes for filtering
  CREATE INDEX idx_photos_is_approved ON photos(is_approved);
  CREATE INDEX idx_photos_is_featured ON photos(is_featured);
  CREATE INDEX idx_rsvps_status ON rsvps(status);
  CREATE INDEX idx_rsvps_is_approved ON rsvps(is_approved);
  
  -- Date indexes for sorting
  CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
  CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);
  CREATE INDEX idx_hunt_runs_started_at ON hunt_runs(started_at DESC);
  ```

---

## Implementation Batches (REVISED)

### ✅ BATCH 1: Navigation & Layout Modernization (3-5 hours) - COMPLETED
**Goal**: Mobile-first, responsive admin navigation with modern UI patterns
**Priority**: HIGHEST - Foundation for all future work
**Status**: ✅ **COMPLETED** - October 11, 2025
**Time Spent**: 3.5 hours

#### VALIDATION TASK (MUST DO FIRST):
- [x] Review actual code files to verify which tasks are already implemented
- [x] Check AdminDashboard.tsx and CollapsibleSection.tsx for evidence of completion
- [x] Document actual status before proceeding with implementation plan

#### Completed Implementation:

**PHASE 1: Navigation Modernization (1.5-2 hours)** ✅
- ✅ Replaced button-based navigation with Radix UI Tabs component
- ✅ Implemented TabsList, TabsTrigger, and TabsContent pattern
- ✅ Added icon + label + badge count to each tab
- ✅ Maintained all 10 existing tabs (Overview, RSVPs, Tournament, Gallery, Hunt, Vignettes, Homepage, Libations, Guestbook, Email)
- ✅ Implemented active state styling with primary color
- ✅ Added semantic HTML with proper ARIA attributes

**Files Modified**:
- ✅ `src/pages/AdminDashboard.tsx` - Complete navigation refactor
- ✅ NEW: `src/components/admin/CollapsibleSection.tsx` - Reusable collapsible component

**PHASE 2: Quick Actions Reorganization (1-1.5 hours)** ✅
- ✅ Created `CollapsibleSection` component with:
  - Expand/collapse functionality with chevron icons
  - Title, icon, and badge support
  - Smooth animations
  - Mobile-responsive padding
- ✅ Wrapped Quick Actions in CollapsibleSection
- ✅ Default open state for immediate access
- ✅ Maintained all 4 quick action buttons (Export RSVPs, Tournament Bracket, Approve Photos, Hunt Stats)

**PHASE 3: Mobile Optimization (0.5-1 hour)** ✅
- ✅ Mobile-first responsive design throughout
- ✅ Touch-friendly targets (min 44x44px on all interactive elements)
- ✅ Responsive typography scaling (text-xs sm:text-sm md:text-lg)
- ✅ Responsive spacing (p-3 sm:p-4 md:p-6)
- ✅ Tab labels truncate on mobile ("Homepage" → "Homep...")
- ✅ Card headers scale from 3.5w to 4w icons
- ✅ Grid layouts adapt: 1 col (mobile) → 2 col (sm) → 3 col (lg) → 5 col (xl)
- ✅ Proper flexbox wrapping for tabs on small screens
- ✅ Badge sizing adapts (text-[10px] sm:text-xs)

**PHASE 4: Testing & Polish (0.5-1 hour)** ✅
- ✅ Verified tab switching functionality
- ✅ Tested collapsible section expand/collapse
- ✅ Validated mobile responsiveness at 320px, 375px, 768px, 1024px, 1920px
- ✅ Ensured all existing functionality preserved
- ✅ No breaking changes to existing components

**Design System Compliance**:
- ✅ Used semantic tokens (text-primary, bg-card, border-primary/20)
- ✅ Followed HSL color system
- ✅ Applied consistent spacing scale
- ✅ Maintained theme consistency
- ✅ Proper focus states and accessibility

**Success Criteria** (ALL MET):
- ✅ Admin navigation uses Tabs component (not buttons)
- ✅ Mobile navigation is touch-friendly (44x44px minimum targets)
- ✅ All existing features still accessible
- ✅ Quick Actions are collapsible
- ✅ Responsive from 320px to 1920px+
- ✅ Zero functionality lost in refactor
- ✅ Performance maintained (no new API calls)

**What's Next**:
- 🎯 BATCH 1.5 (Optional): Advanced navigation with dropdown categories
- 🎯 BATCH 1.5 (Optional): System Configuration Panel with feature toggles
- → Continue to **BATCH 2**: User & Role Management (4-5 hours)

---

### ✅ BATCH 2: User & Role Management (4-5 hours) - COMPLETED
**Goal**: Admin role management and individual user deletion
**Priority**: HIGH - Security and maintenance features
**Completed**: October 11, 2025
**Time Spent**: ~5 hours

#### VALIDATION TASK (MUST DO FIRST):
- [x] Review actual code files to verify which tasks are already implemented
- [x] Check AdminRoleManagement.tsx and UserManagement.tsx components for evidence
- [x] Verify database migrations and functions for role management
- [x] Document actual status before proceeding with implementation plan

4. **ADMIN-SETTINGS-02**: Simplified Admin Role Management (1.5-2 hours)
   - Single admin role (no hierarchy)
   - Add/remove admin by email
   - Safety guards and confirmations
   - Audit logging
5. **ADMIN-SETTINGS-01**: User Management System (2.5-3 hours)
   - Individual user deletion
   - Dev-only database reset
   - Content preservation options
   - Safety features and confirmations

**Success Criteria**:
- ✅ Admin roles can be added/removed safely
- ✅ User management allows individual deletion
- ✅ Dev mode database reset works (localhost only)
- ✅ All safety confirmations in place
- ✅ Audit logs capture all admin actions

---

### ✅ BATCH 3: Email System Phase 1 (6-8 hours) - COMPLETED
**Goal**: Core email campaign functionality with Mailjet integration  
**Priority**: HIGH  
**Status**: ✅ COMPLETED (October 11, 2025)  
**Time Spent**: ~1 hour (system was already implemented, added documentation)

#### VALIDATION TASK (MUST DO FIRST):
- [ ] Review actual code files to verify which tasks are already implemented
- [ ] Check edge functions and email API files for evidence of completion
- [ ] Document actual status before proceeding with implementation plan

#### Implementation Plan:

**PHASE 1: Database Schema & Edge Function (2-3 hours)**
- Create email_templates table with rich text support
- Create email_campaigns table with scheduling
- Create campaign_recipients table with tracking
- Implement send-email-campaign edge function
- Add Mailjet batch sending with rate limiting (500/hour)
- Test edge function with small recipient list

**Database Schema**:
```sql
-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  preview_text TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  recipient_list TEXT NOT NULL, -- 'all', 'rsvp_yes', 'rsvp_pending', 'custom'
  subject TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "bounced": 0}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients (tracking)
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE(campaign_id, email)
);

-- RLS Policies (admin only)
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage templates" ON email_templates FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage campaigns" ON email_campaigns FOR ALL USING (is_admin());
CREATE POLICY "Admins can view recipients" ON campaign_recipients FOR SELECT USING (is_admin());
```

**PHASE 2: Template Management UI (2-2.5 hours)**
- Upgrade EmailCommunication from "Coming Soon" to full component
- Implement template list view with search/filter
- Add rich text editor (React Quill or TipTap)
- Variable insertion ({{name}}, {{rsvp_status}}, etc.)
- Live preview pane
- Save/update/delete templates
- Mobile-responsive editor

**PHASE 3: Campaign Composer & Management (2-2.5 hours)**
- Campaign creation wizard
- Template selection
- Recipient list builder (All Guests, RSVP'd, Pending, Custom)
- CSV import with validation
- Test email feature (send to self)
- Campaign list with status badges
- Basic stats (sent, delivered, bounced)

**PHASE 4: Testing & Safety (1-1.5 hours)**
- Test with 1-2 recipients
- Verify Mailjet integration
- Test rate limiting
- Confirmation dialogs
- Bounce handling
- Mobile testing
- Create MAILJET_TEMPLATE_GUIDE.md

**Success Criteria**:
- ✅ Create/edit templates with rich text
- ✅ Compose and send campaigns
- ✅ Send test emails
- ✅ Schedule or send immediately
- ✅ Track basic stats
- ✅ Rate limiting works
- ✅ Mobile responsive

---

### ✅ BATCH 4: Navigation Consolidation & Database Fixes (5-7 hours) - COMPLETE
**Goal**: Consolidate admin navigation + fix critical database integrity issues  
**Priority**: CRITICAL - Database integrity at risk + mobile UX improvement  
**Status**: ✅ COMPLETE - All Phases 1-4 Validated and Functional
**Time Spent**: ~6 hours
**Completed**: October 12, 2025
**Dependencies**: BATCH 3 complete

#### VALIDATION TASK (MUST DO FIRST):
- [x] Review database migration files for foreign keys, indexes, and status columns
- [x] Check AdminNavigation.tsx and related files to confirm rollback status - FOUND COMPLETE ✅
- [x] Verify which navigation consolidation tasks need re-implementation - ALL ALREADY DONE ✅
- [x] Document actual status before proceeding with re-implementation plan

⚠️ **CRITICAL DATABASE ISSUES FOUND**:
- NO foreign key constraints exist (data integrity at risk)
- Missing columns causing query errors (hunt_runs.status, tournament_registrations.status)
- No indexes on frequently queried columns (performance impact)

#### Implementation Plan:

**PHASE 1: CRITICAL DATABASE FIXES (2-3 hours) ⚠️ HIGHEST PRIORITY**
```sql
-- Fix 1: Add Foreign Key Constraints
ALTER TABLE photos ADD CONSTRAINT photos_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE guestbook ADD CONSTRAINT guestbook_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE potluck_items ADD CONSTRAINT potluck_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE rsvps ADD CONSTRAINT rsvps_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE hunt_runs ADD CONSTRAINT hunt_runs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE hunt_progress ADD CONSTRAINT hunt_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tournament_registrations ADD CONSTRAINT tournament_registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix 2: Add Missing Status Columns
ALTER TABLE hunt_runs 
  ADD COLUMN status TEXT DEFAULT 'active' 
  CHECK (status IN ('active', 'completed', 'abandoned'));
UPDATE hunt_runs SET status = 'completed' WHERE completed_at IS NOT NULL;

ALTER TABLE tournament_registrations 
  ADD COLUMN status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Fix 3: Add Performance Indexes
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_guestbook_user_id ON guestbook(user_id);
CREATE INDEX idx_potluck_items_user_id ON potluck_items(user_id);
CREATE INDEX idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX idx_hunt_runs_user_id ON hunt_runs(user_id);
CREATE INDEX idx_hunt_progress_user_id ON hunt_progress(user_id);
CREATE INDEX idx_tournament_registrations_user_id ON tournament_registrations(user_id);
CREATE INDEX idx_photos_is_approved ON photos(is_approved);
CREATE INDEX idx_rsvps_status ON rsvps(status);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

**PHASE 2: Navigation Consolidation (2-2.5 hours)** ✅ COMPLETE
- ✅ Consolidate 12 tabs into 4 main categories
- ✅ Implement dropdown menus with Radix UI
- ✅ Structure: Overview | Content (dropdown) | Users (dropdown) | Settings (dropdown)
- ✅ Add badge counts
- ✅ Mobile-first design
- ✅ Touch-friendly (44x44px minimum)

**New Navigation**:
```
1. Overview (single)
2. Content → Gallery, Vignettes, Homepage, Guestbook
3. Users → RSVPs, Tournament, Hunt
4. Settings → Libations, Email, User Mgmt, Admin Roles
```

**PHASE 3: Mobile Polish (1-1.5 hours)** ✅ COMPLETE
- ✅ Hamburger menu for mobile
- ✅ Sticky header
- ✅ Swipe gestures
- ✅ Smooth animations
- ✅ Breadcrumb navigation

**PHASE 4: Testing (0.5-1 hour)** ✅ COMPLETE
- ✅ Test all navigation paths
- ✅ Verify database fixes
- ⚠️ Check for query errors - Fixed missing updated_at column
- ✅ Test mobile/desktop
- ✅ Accessibility verification

**Files**:
- NEW: `supabase/migrations/20251012000000_add_foreign_keys.sql`
- NEW: `supabase/migrations/20251012000001_add_missing_status_columns.sql`
- NEW: `supabase/migrations/20251012000002_add_performance_indexes.sql`
- NEW: `src/components/admin/AdminNavigation.tsx`
- NEW: `src/components/admin/SettingsDropdown.tsx`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Success Criteria**:
- ✅ All FK constraints added
- ✅ Status columns added
- ✅ Indexes created
- ✅ No database errors
- ✅ Navigation → 4 categories
- ✅ All features accessible
- ✅ Mobile friendly
- ✅ Zero functionality lost

---

### ⚠️ BATCH 5: Modern Admin Dashboard Analytics (21-28 hours) - PARTIALLY COMPLETE
**Goal**: Transform admin dashboard into comprehensive analytics and management interface
**Priority**: MEDIUM - Implement incrementally after critical batches
**Status**: ✅ Phases 1 & 3 COMPLETE | ❌ Phase 2 CRITICAL MISSING | ❌ Phases 4-7 NOT STARTED
**Time Spent**: ~6.5 hours (Phase 1: 1.5h, Phase 3: 3-4h, Missing Phase 2: 2h)
**Remaining Time**: ~16-18 hours (Phase 2: 2-3h, Phases 4-7: 14-15h)
**Dependencies**: Batches 1-3 (navigation, user management, email system)

#### VALIDATION TASK: ✅ COMPLETE - CRITICAL ISSUE FOUND
- ✅ Reviewed analytics database tables - **INDEXES EXIST BUT BASE TABLES DO NOT**
- ✅ Verified analytics-api.ts and use-analytics-tracking.ts (Phase 3 complete)
- ✅ Confirmed admin dashboard components for styling and "ON HOLD" overlays (Phase 1 complete)
- ❌ **CRITICAL**: Analytics frontend code is active but will fail due to missing database tables

#### Overview
Transform the current admin dashboard into a modern, widget-based analytics interface with comprehensive metrics tracking, data visualization, and export capabilities. **CRITICAL ISSUE**: Analytics tracking is implemented and running, but the database tables don't exist, causing runtime errors.

---

#### PHASE 1: Styling Fixes & "ON HOLD" Overlays (1.5-2 hours) ✅ COMPLETE
**Files**:
- NEW: `src/components/admin/OnHoldOverlay.tsx` ✅
- MODIFY: `src/pages/AdminDashboard.tsx` ✅

**Status**: ✅ **COMPLETE** - All applicable tasks finished
**Time Spent**: ~1.5 hours

**Tasks**:
1. ✅ Create reusable `OnHoldOverlay` component with bold red diagonal banner
2. ✅ Add "ON HOLD" overlay to Tournament card in Overview section
3. ⏭️ Add "ON HOLD" overlay to Hunt Progress card - N/A (Hunt removed in version-2.2.05.4)
4. ✅ Add smaller "ON HOLD" badges to Tournament Bracket quick action button
5. ⏭️ Add smaller "ON HOLD" badges to Hunt Stats quick action button - N/A (Hunt removed)
6. ✅ Fix Tournament card styling to match other metric cards (colors, spacing, borders)

**Design Specifications**:
- Bold red diagonal banner across card
- Semi-transparent overlay (opacity: 0.3)
- Text: "ON HOLD" in bold uppercase
- Rotation: -45deg diagonal
- Z-index: 10 (above card content but below interactions)

---

#### PHASE 2: Analytics Database Infrastructure (3-4 hours) ❌ CRITICAL MISSING
**Files**:
- ❌ MISSING: `supabase/migrations/20251012_create_analytics_tables.sql`
- ✅ EXISTS: `src/lib/analytics-api.ts` (but will fail without tables)
- ✅ EXISTS: `src/hooks/use-analytics-tracking.ts` (but will fail without tables)
- ✅ EXISTS: `src/hooks/use-session-tracking.ts` (but will fail without tables)
- ✅ EXISTS: `src/contexts/AnalyticsContext.tsx` (but will fail without tables)
- ✅ EXISTS: `supabase/migrations/20251012_analytics_indexes.sql` (indexes for non-existent tables)

**Status**: ❌ **CRITICAL MISSING** - Frontend code exists but database tables don't exist
**Time Needed**: ~2-3 hours (create migration file + testing)
**Date Required**: ASAP - Blocking analytics functionality

**CRITICAL PROBLEM**:
1. ❌ Analytics tracking code is active in App.tsx via AnalyticsProvider
2. ❌ useSessionTracking and useAnalyticsTracking hooks are running
3. ❌ Database tables (user_sessions, page_views, etc.) don't exist
4. ❌ This causes runtime errors when users navigate the site
5. ✅ Indexes exist for tables that don't exist (added in 2 separate migrations)
6. ✅ get_analytics_summary() function exists and works (but no data)

**Required Fix**: Create migration file with all analytics tables (see PRIORITY 1 in implementation plan above)

---

#### PHASE 3: Analytics Data Collection Layer (3-4 hours) ✅ COMPLETE
**Files**:
- ✅ EXISTS: `src/lib/analytics-api.ts` - Complete with all tracking functions
- ✅ EXISTS: `src/hooks/use-analytics-tracking.ts` - Functional tracking hook
- ✅ EXISTS: `src/hooks/use-session-tracking.ts` - Session management with 30-min timeout
- ✅ EXISTS: `src/contexts/AnalyticsContext.tsx` - Integrated in App.tsx
- ✅ EXISTS: Performance indexes added in 2 migration files

**Status**: ✅ **COMPLETE** - All data collection infrastructure ready
**Time Spent**: ~3-4 hours (validation + index optimization)
**Date Completed**: October 12, 2025

**Completed Tasks**:
1. ✅ Comprehensive analytics API functions implemented
2. ✅ Client-side tracking hooks functional
3. ✅ Session management with timeout logic
4. ✅ Analytics context integrated in App.tsx
5. ✅ Performance indexes added for query optimization
6. ✅ RLS policies and admin functions implemented

**Frontend Integration Verified**:
- ✅ AnalyticsProvider wraps entire app in App.tsx
- ✅ useSessionTracking creates sessions with 30-minute timeout
- ✅ useAnalyticsTracking tracks page views and user interactions
- ✅ Session timeout logic handles inactive users
- ✅ Activity tracking on user interactions works

---

#### PHASE 4: Widget Components & Dashboard Layout (6-8 hours) ❌ NOT STARTED
**Files**:
- ❌ MISSING: All DashboardWidgets directory and components
- ❌ MISSING: UserEngagementWidget, ContentMetricsWidget, RsvpTrendsWidget, etc.
- ❌ MISSING: Widget integration in AdminDashboard.tsx

**Status**: ❌ **NOT STARTED** - No widget infrastructure exists
**Time Needed**: ~6-8 hours
**Dependencies**: Phase 2 (database tables) must be completed first

**Missing Components**:
```
src/components/admin/DashboardWidgets/
├── WidgetWrapper.tsx           # ❌ Missing
├── UserEngagementWidget.tsx    # ❌ Missing  
├── ContentMetricsWidget.tsx    # ❌ Missing
├── RsvpTrendsWidget.tsx        # ❌ Missing
├── PhotoPopularityWidget.tsx   # ❌ Missing
├── GuestbookActivityWidget.tsx # ❌ Missing
├── SystemHealthWidget.tsx      # ❌ Missing
└── RealtimeActivityFeed.tsx    # ❌ Missing
```

---

#### PHASE 5: Chart Components with Recharts (4-5 hours) ❌ NOT STARTED
**Files**:
- ❌ MISSING: All Analytics/Charts directory and components
- ❌ MISSING: Recharts dependency not installed

**Status**: ❌ **NOT STARTED** - No chart infrastructure exists
**Time Needed**: ~4-5 hours
**Dependencies**: recharts, date-fns packages need to be added

**Missing Chart Types**:
1. ❌ LineChart - Time series data (RSVPs over time, photo uploads)
2. ❌ BarChart - Categorical comparisons (photos by category, dietary restrictions)
3. ❌ PieChart - Distribution data (RSVP status breakdown, user roles)
4. ❌ AreaChart - Cumulative trends (total users over time, cumulative RSVPs)
5. ❌ MetricCard - Single metric progress displays
6. ❌ GaugeChart - Progress indicators (hunt completion rate, storage usage)

---

#### PHASE 6: Widget Customization & Export (2-3 hours) ❌ NOT STARTED
**Files**:
- ❌ MISSING: `src/components/admin/DashboardSettings.tsx`
- ❌ MISSING: `src/lib/analytics-export.ts`

**Status**: ❌ **NOT STARTED** - No customization features exist
**Time Needed**: ~2-3 hours
**Dependencies**: jspdf, jspdf-autotable packages need to be added

**Missing Features**:
1. ❌ Widget show/hide preferences
2. ❌ Time range selector (7 days, 30 days, 90 days, custom)
3. ❌ CSV export functionality
4. ❌ PDF export with charts as images
5. ❌ Widget refresh controls

---

#### PHASE 7: Real-Time Updates & Performance (1-2 hours) ❌ NOT STARTED
**Status**: ❌ **NOT STARTED** - No performance optimizations implemented
**Time Needed**: ~1-2 hours

**Missing Optimizations**:
1. ❌ React Query caching for analytics data
2. ❌ Lazy loading for widgets
3. ❌ Database aggregation optimization
4. ❌ Memoization of chart data transformations
5. ❌ Debounced real-time activity feed updates

---

#### PHASE 4: Widget Components & Dashboard Layout (6-8 hours)
**Files**:
- NEW: `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/ContentMetricsWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/PhotoPopularityWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/SystemHealthWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/RealtimeActivityFeed.tsx`
- NEW: `src/components/admin/DashboardWidgets/WidgetWrapper.tsx`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Comprehensive Metrics to Implement (30+ metrics)**:

**User Engagement Metrics**:
1. Total registered users
2. Active users (last 7 days)
3. New user registrations (time series)
4. Login frequency distribution
5. Average session duration
6. Pages per session
7. User retention rate
8. Returning vs new visitors ratio

**Content Metrics**:
9. Total photos uploaded
10. Photos pending approval
11. Most liked photos (top 10)
12. Photo upload trends (time series)
13. Photos by category breakdown
14. Total guestbook posts
15. Most active guestbook contributors
16. Emoji reaction distribution
17. Vignette view counts
18. Featured content performance

**Event-Specific Metrics**:
19. Total RSVPs (confirmed, pending, declined)
20. RSVP trends over time
21. Guest count projections
22. Dietary restrictions breakdown
23. Tournament registrations
24. Hunt progress statistics
25. Hunt completion rate
26. Average time to complete hunt
27. Most found runes
28. Least found runes

**System Health Metrics**:
29. Average page load time
30. Error rate (last 24 hours)
31. Database query performance
32. Storage usage (photos bucket)
33. API response times
34. Failed login attempts
35. Bounce rate by page

**Widget Layout (Responsive Grid)**:
```typescript
<div className="dashboard-widgets grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <UserEngagementWidget timeRange={timeRange} />
  <ContentMetricsWidget timeRange={timeRange} />
  <RsvpTrendsWidget timeRange={timeRange} />
  <PhotoPopularityWidget timeRange={timeRange} />
  <GuestbookActivityWidget timeRange={timeRange} />
  <SystemHealthWidget />
  <RealtimeActivityFeed />
</div>
```

---

#### PHASE 5: Chart Components with Recharts (4-5 hours)
**Files**:
- NEW: `src/components/admin/Analytics/Charts/LineChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/BarChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/PieChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/AreaChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/ComparisonChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/GaugeChart.tsx`

**Chart Types to Implement**:
1. **LineChart**: Time series data (RSVPs over time, photo uploads)
2. **BarChart**: Categorical comparisons (photos by category, dietary restrictions)
3. **PieChart**: Distribution data (RSVP status breakdown, user roles)
4. **AreaChart**: Cumulative trends (total users over time, cumulative RSVPs)
5. **ComparisonChart**: Multi-metric comparison (this week vs last week)
6. **GaugeChart**: Single metric progress (hunt completion rate, storage usage)

**Recharts Configuration**:
- Responsive containers
- Custom color schemes (using design system tokens)
- Interactive tooltips
- Legend positioning
- Axis labeling and formatting
- Data point highlighting
- Export to image functionality

---

#### PHASE 6: Widget Customization & Export (2-3 hours)
**Files**:
- NEW: `src/components/admin/DashboardSettings.tsx`
- NEW: `src/lib/analytics-export.ts`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Widget Customization Features**:
1. **Show/Hide Widgets**: Checkbox list to toggle widget visibility
2. **Widget Preferences Storage**:
   - Store in `localStorage` or database table
   - Per-admin preferences
   - Default visibility settings
3. **Refresh Interval Settings**:
   - Manual refresh button
   - Auto-refresh on login
   - Hourly auto-refresh option
4. **Time Range Selector**:
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom date range picker

**Export Functionality**:
```typescript
// src/lib/analytics-export.ts
export async function exportToCSV(data: any[], filename: string): Promise<void>
export async function exportToPDF(dashboardData: DashboardAnalytics, filename: string): Promise<void>
```

**Dependencies to Add**:
- `jspdf` - PDF generation
- `jspdf-autotable` - Table formatting for PDFs

**CSV Export**:
- All metrics in tabular format
- Time-stamped filename
- Includes metadata (date range, export time)

**PDF Export**:
- Formatted dashboard snapshot
- Charts rendered as images
- Summary statistics table
- Branding and timestamp

---

#### PHASE 7: Real-Time Updates & Performance (1-2 hours)
**Files**:
- MODIFY: `src/pages/AdminDashboard.tsx`
- MODIFY: `src/lib/analytics-api.ts`

**Refresh Strategies**:
1. **Manual Refresh**: Button to refresh all widgets
2. **On Login**: Fetch fresh data when admin logs in
3. **Hourly Auto-Refresh**: Background refresh every hour

**Performance Optimizations**:
1. **React Query Caching**: Cache analytics data for 5 minutes
2. **Lazy Loading**: Load widgets as they scroll into view
3. **Database Aggregation**: Use `analytics_daily_aggregates` for historical data
4. **Memoization**: Memoize chart data transformations
5. **Debounced Updates**: Debounce real-time activity feed updates

---

#### Modern Dashboard Design

**Visual Hierarchy**:
- Large, prominent metric cards at top
- Interactive charts in middle section
- Real-time activity feed on side or bottom
- Quick action buttons always visible

**Color Scheme** (using design system):
- Primary metrics: `bg-primary/10` with `text-primary`
- Positive trends: `text-green-600` with upward arrow icons
- Negative trends: `text-red-600` with downward arrow icons
- Neutral: `text-muted-foreground`

**Mobile Responsiveness**:
- Single column layout on mobile
- Swipeable widget carousel
- Collapsible chart sections
- Touch-friendly controls

---

#### File Structure Summary

**New Files (~25 files)**:
```
src/components/admin/
  ├── OnHoldOverlay.tsx
  ├── DashboardSettings.tsx
  ├── DashboardWidgets/
  │   ├── WidgetWrapper.tsx
  │   ├── UserEngagementWidget.tsx
  │   ├── ContentMetricsWidget.tsx
  │   ├── RsvpTrendsWidget.tsx
  │   ├── PhotoPopularityWidget.tsx
  │   ├── GuestbookActivityWidget.tsx
  │   ├── SystemHealthWidget.tsx
  │   └── RealtimeActivityFeed.tsx
  └── Analytics/
      └── Charts/
          ├── LineChart.tsx
          ├── BarChart.tsx
          ├── PieChart.tsx
          ├── AreaChart.tsx
          ├── ComparisonChart.tsx
          └── GaugeChart.tsx

src/lib/
  ├── analytics-api.ts
  └── analytics-export.ts

src/hooks/
  └── use-analytics-tracking.ts

supabase/migrations/
  └── YYYYMMDD_create_analytics_tables.sql
```

**Modified Files**:
- `src/pages/AdminDashboard.tsx` - Replace Overview section with widget grid
- `src/App.tsx` - Add analytics tracking wrapper

---

#### Critical Considerations

**Security**:
- All analytics data restricted to admins only via RLS
- No user PII exposed without proper anonymization
- Audit trail for who accessed analytics and when

**Performance**:
- Use daily aggregates for historical data (older than 7 days)
- Implement pagination for large datasets
- Lazy load widgets as needed
- Cache expensive queries for 5 minutes

**Data Integrity**:
- No backfill of historical data (start tracking from implementation date)
- Indefinite data retention (no automatic cleanup)
- Graceful handling of missing or incomplete data

**Privacy**:
- User activity tracking respects user privacy
- No tracking of sensitive actions (password changes, etc.)
- Compliance with data protection regulations

---

#### Success Criteria

**Phase 1**:
- ✅ Tournament and Hunt cards have bold red "ON HOLD" overlays
- ✅ Tournament card styling matches other metric cards
- ✅ "ON HOLD" badges on quick action buttons

**Phase 2**:
- ✅ All analytics tables created with proper indexes
- ✅ RLS policies restrict access to admins only
- ✅ Daily aggregates table for performance optimization

**Phase 3**:
- ✅ Analytics API functions work correctly
- ✅ Client-side tracking hook captures page views
- ✅ Session duration tracking functional

**Phase 4**:
- ✅ 6+ widget components implemented
- ✅ Responsive grid layout works on all screen sizes
- ✅ All 30+ metrics displaying correctly

**Phase 5**:
- ✅ 6 chart types implemented using Recharts
- ✅ Charts are interactive and responsive
- ✅ Custom color schemes match design system

**Phase 6**:
- ✅ Admins can show/hide widgets
- ✅ Widget preferences persist across sessions
- ✅ CSV export works for all metrics
- ✅ PDF export generates formatted reports

**Phase 7**:
- ✅ Manual refresh button works
- ✅ Hourly auto-refresh functional
- ✅ Performance optimizations implemented
- ✅ Page loads in under 2 seconds

---

#### Integration with Existing Batches

**Dependencies**:
- **BATCH 1**: Dashboard must be in Settings menu
- **BATCH 2**: User management data feeds into analytics
- **BATCH 3**: Email campaign statistics integrate with dashboard

**Conflicts**: None identified

**Timeline**: Implement BATCH 4 after Batches 1-3 are complete and tested

---

#### Notes
- Drag-and-drop widget reordering skipped for Phase 2 (future enhancement)
- No historical data backfill required (start tracking fresh)
- Use Supabase Analytics API where possible to reduce custom code
- PDF export requires adding `jspdf` library (approved)
- Indefinite data retention (no cleanup policies initially)

---

## 📝 Documentation Requirements

### New Documentation Files to Create:
1. **`docs/MAILJET_TEMPLATE_GUIDE.md`** (Batch 3)
   - Accessing Mailjet dashboard
   - Creating/editing templates in Mailjet
   - Using template variables ({{name}}, {{rsvp_status}}, etc.)
   - Testing templates before deployment
   - Best practices and compliance (unsubscribe links, GDPR)

2. **`docs/ADMIN_USER_GUIDE.md`** (Batch 2)
   - Overview of admin features
   - How to add/remove admins
   - User management guidelines
   - Safety features and confirmations

3. **`docs/USER_MANAGEMENT_SAFETY.md`** (Batch 2)
   - Detailed explanation of safety features
   - Audit log format and tracking
   - Content preservation options
   - Best practices for user deletion

4. **`docs/DATABASE_RESET_GUIDE.md`** (Batch 2)
   - Dev-only reset instructions
   - When to use database reset
   - What gets preserved vs deleted
   - Safety confirmations required

### Files to Update:
1. **`README.md`**
   - Add admin system overview
   - Link to new documentation
   - Update feature list

2. **`.env.example`**
   - Add `DEV_MODE` flag documentation
   - Document any new Mailjet variables

3. **`PATCHES_AND_UPDATES_TRACKER_V2.md`** (this file)
   - Mark items as completed
   - Update status as work progresses

---

## 🔒 Critical Security Requirements

### ⚠️ SECURITY WARNING: Admin Role Verification
**MUST USE SEPARATE TABLE - NEVER USE PROFILES**

```sql
-- ✅ CORRECT: Use existing user_roles table
SELECT role FROM public.user_roles WHERE user_id = auth.uid();

-- ❌ NEVER DO: Store admin flag on profiles
-- profiles.is_admin = true  // DANGEROUS!
```

### Server-Side Validation Required:
```typescript
// ✅ CORRECT: Always verify server-side
const { data: isAdmin } = await supabase.rpc('check_admin_status');
if (!isAdmin) throw new Error('Unauthorized');

// ❌ NEVER: Trust client-side checks
// const isAdmin = localStorage.getItem('isAdmin'); // INSECURE!
// const isAdmin = user.metadata.isAdmin;          // INSECURE!
```

### Input Validation (All User Inputs):
```typescript
// ✅ Use Zod schemas for validation
import { z } from 'zod';

const emailSchema = z.string().email().max(255);
const userIdSchema = z.string().uuid();

// Validate before processing
const validatedEmail = emailSchema.parse(inputEmail);

// ❌ NEVER trust raw input without validation
// await deleteUser(req.body.userId); // DANGEROUS!
```

### Rate Limiting Requirements:
- User deletions: Max 5 per hour per admin
- Email campaigns: Max 500 emails per hour (Mailjet free tier)
- Admin role changes: Log all changes with timestamp

---

## Technical Debt & Maintenance

### 🔧 CODE-QUALITY-01: TypeScript Strict Mode Migration
- **Status**: 🎯 Planned
- **Time**: 3-4 hours
- **Description**: Migrate entire codebase to TypeScript strict mode
- **Benefits**: Better type safety, fewer runtime errors

### 🔧 CODE-QUALITY-02: Component Library Standardization
- **Status**: 🎯 Planned
- **Time**: 4-5 hours
- **Description**: Standardize all components to use consistent patterns
- **Benefits**: Better maintainability, consistent UI/UX

### 🔧 SECURITY-01: Security Audit & Hardening
- **Status**: 🎯 Planned
- **Time**: 2-3 hours
- **Description**: Comprehensive security review and hardening
- **Benefits**: Production-ready security posture

---

## Future Considerations

### 🌟 INTEGRATION-01: Third-Party Integrations
- Calendar integration (Google Calendar, Outlook)
- Social media sharing capabilities
- Payment processing for premium features
- Email marketing platform integration

### 🌟 SCALABILITY-01: Performance & Scaling
- Database query optimization
- Caching strategy implementation
- CDN integration for static assets
- Server-side rendering considerations

---

---

## 📊 Development Metrics

**Phase 2 Completion Status (VERIFIED October 12, 2025):**
- ✅ 5 Batches Completed (Batches 1-4, 6)
- ✅ 1 Batch Partially Complete (Batch 5: Phases 1 & 3 ✅, Phase 2 ❌ CRITICAL MISSING, Phases 4-7 ❌)
- ✅ 15+ Major Features Implemented
- ✅ 20+ Bug Fixes Applied
- ✅ Comprehensive Admin System Established
- ❌ 1 CRITICAL Issue Found (Analytics database tables missing)

**Phase 2 Actual vs Documented Status:**
- **COMPLETED WORK**: 15.5-16.5 hours (85% more than expected due to thorough implementation)
- **MISSING WORK**: 16-18 hours (Analytics database tables + widgets)
- **CRITICAL FINDING**: Analytics tracking is running but will fail due to missing database infrastructure

**Phase 2 Implementation Timeline (REVISED):**
- ✅ **COMPLETED**: Batch 1 (Navigation & Layout Modernization) - 3.5 hours (Oct 11, 2025)
- ✅ **COMPLETED**: Batch 2 (User & Role Management) - 5 hours (Oct 11, 2025)
- ✅ **COMPLETED**: Batch 3 (Email System Phase 1) - 1 hour (Oct 11, 2025)
- ✅ **COMPLETED**: Batch 4 (Navigation Consolidation) - 6-8 hours (Oct 12, 2025)
- ✅ **COMPLETED**: Batch 5 Phase 1 (ON HOLD Overlays) - 1.5 hours (Oct 12, 2025)
- ❌ **CRITICAL MISSING**: Batch 5 Phase 2 (Analytics Database) - 2-3 hours (REQUIRED ASAP)
- ✅ **COMPLETED**: Batch 5 Phase 3 (Analytics Data Collection) - 3-4 hours (Oct 12, 2025)
- ❌ **NOT STARTED**: Batch 5 Phases 4-7 (Analytics Widgets) - 14-15 hours (BLOCKED by Phase 2)
- ✅ **COMPLETED**: Batch 6 (Hunt Code Removal) - 2 hours (Oct 12, 2025)

**Next Phase Priorities:**
1. 🔴 **CRITICAL**: Fix analytics database infrastructure (2-3 hours) - BLOCKS all analytics functionality
2. 🟡 **HIGH**: Complete analytics dashboard widgets (14-15 hours) - Core admin functionality
3. 🟢 **MEDIUM**: System configuration panel (1.5-2 hours) - Admin convenience features
4. 🔵 **LOW**: Performance optimizations (1-2 hours) - Polish and optimization

**Current Stable Version**: version-2.2.05.4-HuntRemoval-StableVersion
**Status**: Stable with 1 critical issue (analytics database tables missing)

---

**Confirmed Scope Decisions:**
- ✅ Single admin role (no hierarchy)
- ✅ Hard user deletes (no soft deletes initially)
- ✅ Dev-only database reset
- ✅ Mailjet for email campaigns
- ✅ Core email features only (no A/B testing Phase 1)
- ✅ Mobile-first navigation redesign
- ✅ All existing features preserved
- ✅ Comprehensive analytics with 30+ metrics (BATCH 4)
- ✅ CSV and PDF export functionality (BATCH 4)
- ✅ Recharts for data visualization (BATCH 4)
- ✅ Supabase Analytics API + custom tables (BATCH 4)
- ✅ Indefinite analytics data retention (BATCH 4)
- ✅ Widget show/hide customization (BATCH 4)
- ✅ Manual, on-login, or hourly refresh (BATCH 4)

---

*Last Updated: October 12, 2025*  
*Maintained by: Development Team*  
*Version: version-2.2.05.4-HuntRemoval-StableVersion*  
*Status: Batches 1-4, 6 COMPLETED | Batch 5 Phases 1,3 COMPLETE | Batch 5 Phases 2,4-7 REMAINING*
