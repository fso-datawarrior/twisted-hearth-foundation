# Patches and Updates Tracker V3

## Overview
This document tracks Phase 3 development for the Twisted Hearth Foundation project, focusing on planned features and enhancements for the admin system and user experience.

**Start Date:** October 11, 2025  
**Current Version:** 2.2.01-AdminBatchPatch-01-FoundationAndNavigation  
**Status:** Planning Phase 📋

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

## 📊 Quick Summary

**Total Planned Items**: 10 major features across 4 batches  
**Estimated Timeline**: 36-47 hours (approximately 5-6 weeks at 8 hours/week)  
**Current Focus**: Batch 1 - Foundation & Navigation

### Phase 3 Priorities
1. **BATCH 1**: Foundation & Navigation (5-6 hours) - Mobile-first admin redesign
2. **BATCH 2**: User & Role Management (4-5 hours) - Security & user administration
3. **BATCH 3**: Email Campaign System (6-8 hours) - Marketing communications
4. **BATCH 4**: Modern Analytics Dashboard (21-28 hours) - Comprehensive metrics & insights

---

## Critical Priority Issues (🔴)

*No critical issues identified at this time*

---

## High Priority Issues (🟡)

### 🟡 ADMIN-SETTINGS-01: User Management & Database Reset System
- **Status**: 🎯 Planned
- **Priority**: BATCH 2 - User & Role Management
- **Time Estimate**: 2.5-3 hours
- **Dependencies**: BATCH 1 (navigation must be in place)

**Files to Create/Modify**:
- NEW: `src/components/admin/UserManagement.tsx`
- NEW: `src/components/admin/DatabaseResetPanel.tsx` (dev-only)
- NEW: `src/lib/user-management-api.ts`
- NEW: `src/lib/database-reset-api.ts`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Confirmed Scope**:
- ✅ Individual user deletion (no bulk operations initially)
- ✅ Hard delete (permanent) - no soft deletes for now
- ✅ Database reset ONLY in dev/localhost mode
- ✅ Content preservation options (keep photos, guestbook posts, etc.)

**Core Features**:
- User list with search/filter functionality
- Delete individual users with confirmation dialog
- Content preservation options (photos, guestbook posts, RSVP)
- "Type email to confirm" safety mechanism
- Content review before deletion (shows X photos, Y posts)
- Admin user protection (cannot delete admin accounts)
- Audit log (who deleted whom, when, why)
- Rate limiting (max 5 deletions per hour per admin)
- 5-second "Undo" button after deletion

**Dev-Only Database Reset**:
- Only visible on localhost or DEV_MODE=true
- Requires typing "RESET DATABASE" to confirm
- Clears RSVPs, photos, guestbook, hunt progress
- Always preserves admin accounts and system config

**Safety Features**:
- Cannot delete admin users
- Confirmation dialog with email verification
- Shows impact (X photos, Y posts will be deleted)
- Audit trail with admin name, timestamp, reason
- Rate limiting to prevent accidents
- Undo window immediately after deletion

---

### 🟡 ADMIN-SETTINGS-02: Admin Role Management System
- **Status**: 🎯 Planned
- **Priority**: BATCH 2 - User & Role Management
- **Time Estimate**: 1.5-2 hours
- **Dependencies**: BATCH 1 (navigation must be in place)

**Files to Create/Modify**:
- NEW: `src/components/admin/AdminRoleManagement.tsx`
- NEW: `src/lib/admin-roles-api.ts`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Confirmed Scope**:
- ✅ Single "admin" role with full permissions (no hierarchy)
- ✅ Uses existing `user_roles` table (already implemented)
- ✅ Server-side validation only (no client-side role checks)
- ❌ NO Super Admin/Moderator roles (keeping it simple)

**Core Features**:
- Add admin by email address
- Remove admin role (with safety guards)
- List all current admins
- Admin activity audit log
- Email notification to user when granted/revoked admin

**Safety Features**:
- Cannot remove self from admin role
- Cannot remove last admin (minimum 1 required)
- Confirmation dialog: "Type CONFIRM to proceed"
- Audit log captures who added/removed whom
- Server-side role verification using RPC calls

**Security Requirements**:
- MUST use `public.user_roles` table (already exists)
- MUST verify admin status server-side via RPC
- NEVER store admin flag in localStorage or client-side
- ALL admin actions require database role check

---

### 🟡 ADMIN-SETTINGS-03: Navigation Reorganization & Settings Groups
- **Status**: 🎯 Planned
- **Priority**: BATCH 1 - Foundation & Navigation
- **Time Estimate**: 2.5-3 hours
- **Dependencies**: None (foundational work)

**Files to Create/Modify**:
- MODIFY: `src/pages/AdminDashboard.tsx`
- NEW: `src/components/admin/AdminNavigation.tsx`
- NEW: `src/components/admin/SettingsDropdown.tsx`

**Current State**: 10 tabs (Overview, RSVPs, Tournament, Gallery, Hunt, Vignettes, Homepage, Libations, Guestbook, Email)

**Confirmed Scope**:
- ✅ Keep ALL existing features (no feature removal)
- ✅ Reorganize into 4 main categories
- ✅ Heavy use of Settings dropdown for management tools
- ✅ Mobile-first design (currently cluttered on mobile)
- ✅ Group related features logically

**Proposed Structure**:
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

**Mobile Features**:
- Hamburger menu for categories
- Full-width dropdown selections
- Sticky header with breadcrumbs
- Swipe gestures for navigation
- Touch-friendly buttons (min 44x44px)

**Desktop Features**:
- Horizontal category bar
- Hover-activated dropdowns
- Quick action shortcuts
- Keyboard navigation support

---

### 🟡 ADMIN-SETTINGS-04: Email Campaign Management System (Phase 1)
- **Status**: 🎯 Planned
- **Priority**: BATCH 3 - Email System Phase 1
- **Time Estimate**: 6-8 hours
- **Dependencies**: BATCH 1 (needs to be in Settings menu)

**Files to Create/Modify**:
- NEW: `src/components/admin/EmailCampaigns.tsx`
- NEW: `src/components/admin/EmailTemplateEditor.tsx`
- NEW: `src/components/admin/CampaignComposer.tsx`
- NEW: `src/components/admin/RecipientListManager.tsx`
- NEW: `src/lib/email-campaigns-api.ts`
- NEW: `supabase/functions/send-email-campaign/index.ts`
- NEW: Database migrations for email tables
- NEW: `docs/MAILJET_TEMPLATE_GUIDE.md`

**Confirmed Scope**:
- ✅ Use Mailjet (existing integration)
- ✅ Core functionality ONLY (no A/B testing initially)
- ✅ Basic statistics tracking (sent, delivered, bounced)
- ✅ Detailed Mailjet template instructions in markdown
- ✅ Phased implementation approach

**Phase 1 Features (Current Implementation)**:

**Template Management**:
- Create/edit email templates
- Rich text editor (TipTap or similar)
- Variable insertion ({{name}}, {{rsvp_status}}, etc.)
- Live preview pane
- Save as draft
- Mobile-responsive preview

**Recipient Lists**:
- Pre-defined lists (All Guests, RSVP'd, Pending, Custom)
- Custom list builder (add/remove emails)
- CSV import functionality
- Email validation and duplicate detection
- Total recipient count display

**Campaign Composer**:
- Select template or create new
- Choose recipient list
- Edit subject line and preview text
- Schedule send or send immediately
- Test email feature (send to self first)

**Campaign Dashboard**:
- List all campaigns (past and scheduled)
- Basic statistics (sent, delivered, bounced)
- Status indicators (draft, scheduled, sent, failed)
- Action buttons (view, edit, duplicate, cancel)

**Basic Statistics**:
- Total sent count
- Delivery rate
- Bounce tracking
- Send timestamp

**Database Schema**:
```sql
email_templates (
  id, name, subject, html_content, preview_text, 
  created_by, created_at, updated_at, is_active
)

email_campaigns (
  id, template_id, recipient_list, subject, 
  scheduled_at, sent_at, status, stats, 
  created_by, created_at
)

campaign_recipients (
  id, campaign_id, email, status, 
  sent_at, delivered_at, error_message
)
```

**Mailjet Integration**:
- Uses existing Mailjet secrets
- Edge function: `send-email-campaign`
- Batch sending with rate limiting (500/hour free tier)
- Bounce handling and tracking
- Unsubscribe link tracking

**Safety Features**:
- Rate limiting (max 500 emails/hour)
- Mandatory preview before send
- Test email to self before bulk send
- Confirmation dialog: "Send to X recipients?"
- Schedule option to avoid accidental sends
- Bounce tracking and auto-removal of invalid emails
- Unsubscribe tracking and respect

**Documentation**:
`docs/MAILJET_TEMPLATE_GUIDE.md` - Detailed instructions for:
- Accessing Mailjet dashboard
- Creating/editing templates
- Using template variables
- Testing templates
- Best practices and compliance

**Phase 2 (Future)**:
- Open rate tracking (requires Mailjet webhooks)
- Click tracking on links
- Advanced statistics dashboard
- Campaign performance comparison

**Phase 3 (Future)**:
- A/B testing (subject lines, content variants)
- Automated drip campaigns
- Advanced segmentation rules
- Dynamic content based on user behavior

---

### 🟡 ADMIN-SETTINGS-05: System Configuration Panel
- **Status**: 🎯 Planned
- **Priority**: BATCH 1 - Foundation & Navigation
- **Time Estimate**: 1.5-2 hours
- **Dependencies**: None (foundational work)

**Files to Create/Modify**:
- NEW: `src/components/admin/SystemSettings.tsx`
- NEW: `src/lib/system-config-api.ts`
- NEW: Database migration for `system_settings` table

**Core Features**:

**Event Settings**:
- Event date and time
- Registration open/close toggle
- Registration deadline date

**Feature Toggles**:
- Hunt enabled/disabled
- Tournament enabled/disabled
- Gallery enabled/disabled
- Guestbook enabled/disabled

**Maintenance Mode**:
- Enable/disable maintenance mode
- Custom maintenance message (rich text)

**Notifications**:
- Email notifications enabled/disabled
- RSVP auto-approval toggle
- Photo auto-approval toggle

**UI Features**:
- Toggle switches for boolean flags
- Date/time pickers for event settings
- Rich text editor for maintenance message
- "Save Changes" with confirmation
- "Reset to Defaults" option
- Change history log (who changed what, when)

**Database Schema**:
```sql
system_settings (
  id, key, value, type, 
  updated_by, updated_at
)

setting_history (
  id, setting_key, old_value, new_value, 
  changed_by, changed_at
)
```

---

## Medium Priority Issues (🟢)

### 🟢 UX-ENHANCEMENT-01: Enhanced Loading States
- **Status**: 🎯 Planned
- **Time Estimate**: 3-4 hours
- **Priority**: Post-BATCH 3

**Files to Modify**: Multiple component files

**Core Features**:
- Skeleton loading components
- Progress indicators for long operations
- Optimistic UI updates
- Error state handling with retry options

---

### 🟢 UX-ENHANCEMENT-02: Mobile Navigation Polish
- **Status**: 🎯 Planned (PROMOTED TO HIGH)
- **Priority**: BATCH 1 - Foundation & Navigation
- **Time Estimate**: 1 hour
- **Dependencies**: ADMIN-SETTINGS-03 (completes that work)

**Files to Modify**:
- MODIFY: Admin navigation components (created in ADMIN-SETTINGS-03)

**Core Features**:
- Touch-friendly button sizes (min 44x44px)
- Smooth animations for dropdowns
- Loading states for tab switches
- "Back to Overview" quick link
- Swipe gesture optimization
- Sticky header behavior

**Note**: This completes the navigation work started in ADMIN-SETTINGS-03

---

### 🟢 PERFORMANCE-01: Image Optimization System
- **Status**: 🎯 Planned
- **Time Estimate**: 2-3 hours
- **Priority**: Post-BATCH 3

**Files to Create/Modify**:
- MODIFY: `src/lib/image-url.ts`
- NEW: `src/lib/image-optimization.ts`

**Core Features**:
- Automatic image resizing
- WebP format support with fallbacks
- Lazy loading improvements
- Image compression optimization

---

## Low Priority Issues (🔵)

### 🔵 FEATURE-REQUEST-01: Advanced Search & Filtering
- **Status**: 🎯 Planned
- **Time Estimate**: 4-5 hours
- **Priority**: Future enhancement

**Files to Modify**: Multiple pages with search functionality

**Core Features**:
- Global search functionality
- Filter by categories, dates, status
- Search suggestions and autocomplete
- Search result highlighting

---

### 🔵 FEATURE-REQUEST-02: Analytics Dashboard (Subsumed by BATCH 4)
- **Status**: ⚠️ Replaced by BATCH 4 - Modern Admin Dashboard Overhaul
- **Note**: This feature has been significantly expanded and moved to BATCH 4

---

## 🎯 BATCH 4: Modern Admin Dashboard Overhaul (21-28 hours)

**Goal**: Transform admin dashboard into comprehensive analytics and management interface  
**Priority**: MEDIUM - Implement after Batches 1-3  
**Dependencies**: Batches 1-3 (navigation, user management, email system)

### Overview
Transform the current admin dashboard into a modern, widget-based analytics interface with comprehensive metrics tracking, data visualization, and export capabilities. This includes fixing styling inconsistencies, adding "ON HOLD" indicators for disabled features, and implementing a complete analytics system.

---

### PHASE 1: Styling Fixes & "ON HOLD" Overlays (1.5-2 hours)
- **Status**: 🎯 Planned

**Files to Create/Modify**:
- NEW: `src/components/admin/OnHoldOverlay.tsx`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Tasks**:
1. Create reusable `OnHoldOverlay` component with bold red diagonal banner
2. Add "ON HOLD" overlay to Tournament card in Overview section
3. Add "ON HOLD" overlay to Hunt Progress card in Overview section
4. Add smaller "ON HOLD" badges to Tournament Bracket quick action button
5. Add smaller "ON HOLD" badges to Hunt Stats quick action button
6. Fix Tournament card styling to match other metric cards (colors, spacing, borders)

**Design Specifications**:
- Bold red diagonal banner across card
- Semi-transparent overlay (opacity: 0.3)
- Text: "ON HOLD" in bold uppercase
- Rotation: -45deg diagonal
- Z-index: 10 (above card content but below interactions)

---

### PHASE 2: Analytics Database Infrastructure (3-4 hours)
- **Status**: 🎯 Planned

**Files to Create**:
- NEW: `supabase/migrations/YYYYMMDD_create_analytics_tables.sql`

**Database Schema**:

**User Activity Tracking**:
```sql
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'photo_upload', 'rsvp', etc.
  page_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Page View Tracking**:
```sql
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  session_id UUID,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**User Session Tracking**:
```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views_count INTEGER DEFAULT 0,
  metadata JSONB
);
```

**Content Interaction Tracking**:
```sql
CREATE TABLE public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'photo', 'guestbook_post', 'vignette', etc.
  content_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**System Performance Metrics**:
```sql
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'db_query_time', 'page_load_time', etc.
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Analytics Daily Aggregates** (for performance):
```sql
CREATE TABLE public.analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_session_duration NUMERIC,
  total_rsvps INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  total_guestbook_posts INTEGER DEFAULT 0,
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes for Performance**:
```sql
CREATE INDEX idx_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_content_interactions_user_id ON public.content_interactions(user_id);
CREATE INDEX idx_content_interactions_content ON public.content_interactions(content_type, content_id);
```

**RLS Policies**:
- All analytics tables are admin-only
- System can insert for all users
- Only admins can query data

---

### PHASE 3: Analytics Data Collection Layer (3-4 hours)
- **Status**: 🎯 Planned

**Files to Create/Modify**:
- NEW: `src/lib/analytics-api.ts`
- NEW: `src/hooks/use-analytics-tracking.ts`
- MODIFY: `src/App.tsx`

**Core API Functions**:
```typescript
export async function getAnalyticsDashboard(timeRange: TimeRange): Promise<DashboardAnalytics>
export async function getUserEngagementMetrics(timeRange: TimeRange): Promise<EngagementMetrics>
export async function getContentMetrics(timeRange: TimeRange): Promise<ContentMetrics>
export async function getEventMetrics(timeRange: TimeRange): Promise<EventMetrics>
export async function getSystemHealthMetrics(timeRange: TimeRange): Promise<SystemMetrics>
export async function trackPageView(pagePath: string, metadata?: any): Promise<void>
export async function trackUserActivity(activityType: string, metadata?: any): Promise<void>
export async function exportAnalyticsData(format: 'csv' | 'pdf', timeRange: TimeRange): Promise<Blob>
```

---

### PHASE 4: Widget Components & Dashboard Layout (6-8 hours)
- **Status**: 🎯 Planned

**Files to Create**:
- NEW: `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/ContentMetricsWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/PhotoPopularityWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/GuestbookActivityWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/SystemHealthWidget.tsx`
- NEW: `src/components/admin/DashboardWidgets/RealtimeActivityFeed.tsx`
- NEW: `src/components/admin/DashboardWidgets/WidgetWrapper.tsx`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Comprehensive Metrics (30+ total)**:

**User Engagement (8 metrics)**:
1. Total registered users
2. Active users (last 7 days)
3. New user registrations (time series)
4. Login frequency distribution
5. Average session duration
6. Pages per session
7. User retention rate
8. Returning vs new visitors ratio

**Content (10 metrics)**:
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

**Event-Specific (10 metrics)**:
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

**System Health (7 metrics)**:
29. Average page load time
30. Error rate (last 24 hours)
31. Database query performance
32. Storage usage (photos bucket)
33. API response times
34. Failed login attempts
35. Bounce rate by page

---

### PHASE 5: Chart Components with Recharts (4-5 hours)
- **Status**: 🎯 Planned

**Files to Create**:
- NEW: `src/components/admin/Analytics/Charts/LineChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/BarChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/PieChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/AreaChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/ComparisonChart.tsx`
- NEW: `src/components/admin/Analytics/Charts/GaugeChart.tsx`

**Chart Types**:
1. **LineChart**: Time series data (RSVPs over time, photo uploads)
2. **BarChart**: Categorical comparisons (photos by category)
3. **PieChart**: Distribution data (RSVP status breakdown)
4. **AreaChart**: Cumulative trends (total users over time)
5. **ComparisonChart**: Multi-metric comparison (week vs week)
6. **GaugeChart**: Single metric progress (hunt completion rate)

**Recharts Configuration**:
- Responsive containers
- Custom color schemes (using design system tokens)
- Interactive tooltips
- Legend positioning
- Axis labeling and formatting
- Data point highlighting
- Export to image functionality

---

### PHASE 6: Widget Customization & Export (2-3 hours)
- **Status**: 🎯 Planned

**Files to Create/Modify**:
- NEW: `src/components/admin/DashboardSettings.tsx`
- NEW: `src/lib/analytics-export.ts`
- MODIFY: `src/pages/AdminDashboard.tsx`

**Widget Customization Features**:
1. Show/Hide Widgets: Checkbox list to toggle visibility
2. Widget Preferences Storage: Per-admin preferences
3. Refresh Interval Settings: Manual/auto-refresh options
4. Time Range Selector: 7/30/90 days or custom range

**Export Functionality**:
- CSV export: All metrics in tabular format
- PDF export: Formatted dashboard snapshot with charts

**Dependencies to Add**:
- `jspdf` - PDF generation
- `jspdf-autotable` - Table formatting for PDFs

---

### PHASE 7: Real-Time Updates & Performance (1-2 hours)
- **Status**: 🎯 Planned

**Files to Modify**:
- MODIFY: `src/pages/AdminDashboard.tsx`
- MODIFY: `src/lib/analytics-api.ts`

**Refresh Strategies**:
1. Manual Refresh: Button to refresh all widgets
2. On Login: Fetch fresh data when admin logs in
3. Hourly Auto-Refresh: Background refresh every hour

**Performance Optimizations**:
1. React Query Caching: Cache analytics data for 5 minutes
2. Lazy Loading: Load widgets as they scroll into view
3. Database Aggregation: Use daily aggregates for historical data
4. Memoization: Memoize chart data transformations
5. Debounced Updates: Debounce real-time activity feed updates

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

---

## 📊 Implementation Batches & Timeline

### 🎯 BATCH 1: Foundation & Navigation (5-6 hours)
**Goal**: Clean, organized admin interface with feature flags  
**Priority**: HIGHEST - Unblocks all future work  
**Dependencies**: None

**Tasks**:
1. **ADMIN-SETTINGS-03**: Navigation Reorganization (2.5-3 hours)
   - 4 main categories with dropdowns
   - Mobile-first design
   - Settings grouping

2. **ADMIN-SETTINGS-05**: System Configuration Panel (1.5-2 hours)
   - Feature toggles
   - Event settings
   - Maintenance mode

3. **UX-ENHANCEMENT-02**: Mobile Navigation Polish (1 hour)
   - Touch-friendly optimizations
   - Smooth animations
   - Loading states

**Success Criteria**:
- ✅ Admin navigation has 4 main categories
- ✅ Settings dropdown contains 5+ items
- ✅ Mobile navigation is touch-friendly (44x44px targets)
- ✅ System config allows feature toggles
- ✅ All existing features still accessible

---

### 🎯 BATCH 2: User & Role Management (4-5 hours)
**Goal**: Admin role management and individual user deletion  
**Priority**: HIGH - Security and maintenance features  
**Dependencies**: Batch 1 (navigation must be in place)

**Tasks**:
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

### 🎯 BATCH 3: Email System Phase 1 (6-8 hours)
**Goal**: Core email campaign functionality with Mailjet  
**Priority**: MEDIUM - High value but can be phased  
**Dependencies**: Batch 1 (needs to be in Settings menu)

**Tasks**:
6. **ADMIN-SETTINGS-04**: Email Campaign System (6-8 hours)
   - Template management with rich text editor
   - Recipient list builder
   - Campaign composer
   - Basic statistics (sent, delivered, bounced)
   - Mailjet integration
   - Documentation: `docs/MAILJET_TEMPLATE_GUIDE.md`

**Success Criteria**:
- ✅ Email templates can be created/edited
- ✅ Campaigns can be sent to recipient lists
- ✅ Basic statistics are tracked
- ✅ Mailjet documentation is complete
- ✅ Test emails work correctly
- ✅ Safety features prevent accidental sends

---

### 🎯 BATCH 4: Modern Admin Dashboard Overhaul (21-28 hours)
**Goal**: Transform admin dashboard into comprehensive analytics interface  
**Priority**: MEDIUM - Implement after Batches 1-3  
**Dependencies**: Batches 1-3 (navigation, user management, email system)

**Tasks**:
7. **PHASE 1**: Styling Fixes & "ON HOLD" Overlays (1.5-2 hours)
8. **PHASE 2**: Analytics Database Infrastructure (3-4 hours)
9. **PHASE 3**: Analytics Data Collection Layer (3-4 hours)
10. **PHASE 4**: Widget Components & Dashboard Layout (6-8 hours)
11. **PHASE 5**: Chart Components with Recharts (4-5 hours)
12. **PHASE 6**: Widget Customization & Export (2-3 hours)
13. **PHASE 7**: Real-Time Updates & Performance (1-2 hours)

**Success Criteria**:
- ✅ Tournament and Hunt cards have "ON HOLD" overlays
- ✅ All analytics tables created with proper indexes
- ✅ Analytics API functions work correctly
- ✅ 6+ widget components implemented
- ✅ 6 chart types implemented using Recharts
- ✅ Admins can show/hide widgets
- ✅ CSV and PDF export work
- ✅ Manual refresh and auto-refresh functional
- ✅ Page loads in under 2 seconds

---

## 📈 Development Metrics

**Phase 2 Completion Status**:
- ✅ Libations Management System Completed
- ✅ Enhanced Gallery Features Implemented
- ✅ Admin Dashboard Improvements Applied
- ✅ Performance Optimizations Verified
- ✅ Database Indexes Created
- ✅ Bundle Splitting Configured

**Phase 3 Goals (PLANNED)**:
- 🎯 4 Implementation Batches (36-47 hours total)
- 🎯 Navigation Reorganization (mobile-first)
- 🎯 Admin Role & User Management
- 🎯 Email Campaign System (Phase 1 - core features)
- 🎯 Modern Analytics Dashboard with 30+ metrics
- 🎯 System Configuration & Feature Flags
- 🎯 Production-Ready Admin System

**Phase 3 Implementation Timeline**:
- **Week 1**: Batch 1 (Foundation & Navigation) - 5-6 hours
- **Week 1-2**: Batch 2 (User & Role Management) - 4-5 hours
- **Week 2-3**: Batch 3 (Email System Phase 1) - 6-8 hours
- **Week 3-6**: Batch 4 (Modern Admin Dashboard Overhaul) - 21-28 hours
- **Total Estimated Time**: 36-47 hours

**Confirmed Scope Decisions**:
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

## 📋 Concise Overview - What's Left To Do

### Immediate Next Steps (BATCH 1 - Start Here)
1. **Navigation Reorganization** (2.5-3 hours)
   - Condense 10 tabs into 4 categories
   - Create dropdown navigation components
   - Implement mobile-first design

2. **System Configuration Panel** (1.5-2 hours)
   - Build feature toggle interface
   - Create maintenance mode controls
   - Add event settings management

3. **Mobile Navigation Polish** (1 hour)
   - Add touch-friendly interactions
   - Implement smooth animations
   - Add loading states

**Total: 5-6 hours** | **Ready to start immediately**

---

### Security & User Management (BATCH 2 - After BATCH 1)
1. **Admin Role Management** (1.5-2 hours)
   - Add/remove admin by email
   - Build audit log system
   - Implement safety confirmations

2. **User Management System** (2.5-3 hours)
   - Individual user deletion interface
   - Dev-only database reset panel
   - Content preservation options

**Total: 4-5 hours** | **Depends on BATCH 1 navigation**

---

### Email Marketing (BATCH 3 - After BATCH 1)
1. **Email Campaign System** (6-8 hours)
   - Template editor with rich text
   - Recipient list management
   - Campaign scheduler
   - Basic statistics dashboard
   - Mailjet integration
   - Write comprehensive documentation

**Total: 6-8 hours** | **Depends on BATCH 1 navigation**

---

### Analytics & Insights (BATCH 4 - After BATCHES 1-3)
1. **Styling Fixes** (1.5-2 hours)
   - "ON HOLD" overlays for disabled features
   - Fix Tournament card styling

2. **Analytics Infrastructure** (3-4 hours)
   - Create 6 database tables
   - Add indexes and RLS policies

3. **Data Collection** (3-4 hours)
   - Build analytics API
   - Create tracking hooks
   - Integrate with App.tsx

4. **Dashboard Widgets** (6-8 hours)
   - Build 7+ widget components
   - Implement 30+ metrics
   - Create responsive grid layout

5. **Chart Visualizations** (4-5 hours)
   - Implement 6 chart types with Recharts
   - Add interactive features
   - Style with design system

6. **Export & Customization** (2-3 hours)
   - Build CSV export
   - Build PDF export
   - Add widget show/hide controls

7. **Performance & Real-Time** (1-2 hours)
   - Add refresh strategies
   - Implement caching
   - Add lazy loading

**Total: 21-28 hours** | **Depends on BATCHES 1-3**

---

## 🎯 Detailed Overview - Complete Phase 3 Roadmap

### What We're Building
Phase 3 transforms the admin dashboard from a basic management interface into a **comprehensive event management platform** with:
- **Mobile-first navigation** that makes all features easily accessible on any device
- **User & role management** with enterprise-grade security and safety features
- **Email marketing system** for guest communications and campaigns
- **Analytics dashboard** with 30+ metrics, data visualizations, and export capabilities

### Why These Features Matter

**Navigation Reorganization** (BATCH 1):
- Current: 10 tabs overflow on mobile devices, difficult to navigate
- Solution: 4 organized categories with logical grouping
- Impact: Faster admin workflows, better mobile experience, easier to find features

**System Configuration** (BATCH 1):
- Current: Feature flags hardcoded, maintenance requires code changes
- Solution: Admin-controlled toggles and settings
- Impact: Non-technical admins can manage system, faster feature rollout

**Admin Role Management** (BATCH 2):
- Current: Manual database edits to grant admin access
- Solution: Email-based admin invitation system with audit logs
- Impact: Secure, trackable admin access management

**User Management** (BATCH 2):
- Current: Cannot remove users or reset test data
- Solution: Safe user deletion with content preservation options
- Impact: Clean up test accounts, manage user base, reset dev database

**Email Campaigns** (BATCH 3):
- Current: Manual emails to guests, no tracking
- Solution: Professional email campaign system with templates
- Impact: Automated guest communications, better engagement tracking

**Analytics Dashboard** (BATCH 4):
- Current: Basic counts, no insights or trends
- Solution: 30+ metrics with charts, trends, and export
- Impact: Data-driven decisions, understand guest behavior, optimize event

### Technical Approach

**Architecture Decisions**:
- React Query for data fetching and caching
- Recharts for data visualization
- Zod for input validation
- RLS policies for security
- Edge functions for email sending

**Performance Strategy**:
- Lazy load analytics widgets
- Cache data for 5 minutes
- Use daily aggregates for historical data
- Optimize database queries with proper indexes

**Security Strategy**:
- Server-side admin verification only
- Rate limiting on destructive actions
- Audit logs for all admin actions
- Confirmation dialogs with typed verification
- Content impact preview before deletion

### Dependencies & Blockers

**No Blockers**:
- All infrastructure exists (Supabase, Mailjet, React Query)
- Database schema allows for new tables
- Component library (shadcn/ui) provides all UI components
- Recharts library compatible with React 18

**External Dependencies**:
- Mailjet API (already integrated)
- Supabase RLS policies (pattern established)
- React Query (already in use)

**Internal Dependencies**:
- BATCH 2 depends on BATCH 1 (navigation structure)
- BATCH 3 depends on BATCH 1 (Settings menu)
- BATCH 4 depends on BATCHES 1-3 (data sources)

### Risk Assessment

**Low Risk**:
- Navigation reorganization (UI restructuring only)
- System configuration (new feature, no breaking changes)
- Email campaigns (isolated feature, existing Mailjet integration)

**Medium Risk**:
- User deletion (requires careful testing, undo feature)
- Admin role management (security-critical, needs thorough testing)

**High Risk**:
- Analytics tracking (performance impact if not optimized)
- Database reset (destructive, dev-only safety required)

**Mitigation Strategies**:
- Comprehensive testing for user deletion
- Multiple safety confirmations for destructive actions
- Performance monitoring for analytics
- Dev-only flag for database reset
- Audit logs for all admin actions

---

## 🚀 Getting Started

### To Begin BATCH 1:
1. Review current AdminDashboard.tsx structure
2. Design 4-category navigation mockup
3. Create AdminNavigation.tsx component
4. Create SettingsDropdown.tsx component
5. Update AdminDashboard.tsx to use new navigation
6. Create SystemSettings.tsx component
7. Create system_settings database table
8. Test on mobile devices
9. Polish animations and interactions

### Prerequisites:
- Current codebase up-to-date on branch `version-2.2.01-AdminBatchPatch-01-FoundationAndNavigation`
- Node.js and dependencies installed
- Supabase project access
- Local development environment configured

---

*Last Updated: October 11, 2025*  
*Maintained by: Development Team*  
*Version: 3.0 - Phase 3 Planning Document*  
*Status: Ready for Implementation*

