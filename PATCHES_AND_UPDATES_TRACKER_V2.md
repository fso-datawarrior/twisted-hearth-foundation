# Patches and Updates Tracker V2

## Overview
This document tracks all new patches, updates, and features for the Twisted Hearth Foundation project - Phase 2 Development.

**Start Date:** October 11, 2025  
**Current Version:** version-2.2.05.4-HuntRemoval-StableVersion  
**Status:** Rollback & Cleanup 🔄  
**Last Update:** Hunt Code Removal - October 12, 2025

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

## Phase 2 Development Focus Areas

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

### 🚧 BATCH 4: Navigation Consolidation & Database Fixes (5-7 hours) ⚠️ CRITICAL
**Goal**: Consolidate admin navigation + fix critical database integrity issues  
**Priority**: CRITICAL - Database integrity at risk + mobile UX improvement  
**Status**: 🎯 Planned - INCLUDES CRITICAL DATABASE FIXES  
**Dependencies**: BATCH 3 complete

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

**PHASE 2: Navigation Consolidation (2-2.5 hours)**
- Consolidate 12 tabs into 4 main categories
- Implement dropdown menus with Radix UI
- Structure: Overview | Content (dropdown) | Users (dropdown) | Settings (dropdown)
- Add badge counts
- Mobile-first design
- Touch-friendly (44x44px minimum)

**New Navigation**:
```
1. Overview (single)
2. Content → Gallery, Vignettes, Homepage, Guestbook
3. Users → RSVPs, Tournament, Hunt
4. Settings → Libations, Email, User Mgmt, Admin Roles
```

**PHASE 3: Mobile Polish (1-1.5 hours)**
- Hamburger menu for mobile
- Sticky header
- Swipe gestures
- Smooth animations
- Breadcrumb navigation

**PHASE 4: Testing (0.5-1 hour)**
- Test all navigation paths
- Verify database fixes
- Check for query errors
- Test mobile/desktop
- Accessibility verification

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

### 🎯 BATCH 5: Modern Admin Dashboard Analytics (DEFERRED - ORIGINAL BATCH 4)
**Goal**: Transform admin dashboard into comprehensive analytics and management interface
**Priority**: MEDIUM - Implement after Batches 1-3
**Dependencies**: Batches 1-3 (navigation, user management, email system)

#### Overview
Transform the current admin dashboard into a modern, widget-based analytics interface with comprehensive metrics tracking, data visualization, and export capabilities. This includes fixing styling inconsistencies, adding "ON HOLD" indicators for disabled features, and implementing a complete analytics system.

---

#### PHASE 1: Styling Fixes & "ON HOLD" Overlays (1.5-2 hours)
**Files**:
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

#### PHASE 2: Analytics Database Infrastructure (3-4 hours)
**Files**:
- NEW: `supabase/migrations/YYYYMMDD_create_analytics_tables.sql`

**Database Schema**:
```sql
-- User Activity Tracking
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'photo_upload', 'rsvp', 'guestbook_post', etc.
  page_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page View Tracking
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  session_id UUID,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Session Tracking
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views_count INTEGER DEFAULT 0,
  metadata JSONB
);

-- Content Interaction Tracking
CREATE TABLE public.content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'photo', 'guestbook_post', 'vignette', etc.
  content_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Performance Metrics
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'db_query_time', 'page_load_time', 'error_rate', etc.
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Daily Aggregates (for performance)
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

-- Indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_content_interactions_user_id ON public.content_interactions(user_id);
CREATE INDEX idx_content_interactions_content ON public.content_interactions(content_type, content_id);
```

**RLS Policies**:
```sql
-- Analytics tables are admin-only
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- Admin-only access to analytics
CREATE POLICY "Admins can view all analytics"
  ON public.user_activity_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert analytics"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true); -- System can log for all users

-- Repeat for all analytics tables
```

---

#### PHASE 3: Analytics Data Collection Layer (3-4 hours)
**Files**:
- NEW: `src/lib/analytics-api.ts`
- NEW: `src/hooks/use-analytics-tracking.ts`
- MODIFY: `src/App.tsx`

**`src/lib/analytics-api.ts`**:
```typescript
// Comprehensive analytics API functions
export async function getAnalyticsDashboard(timeRange: TimeRange): Promise<DashboardAnalytics>
export async function getUserEngagementMetrics(timeRange: TimeRange): Promise<EngagementMetrics>
export async function getContentMetrics(timeRange: TimeRange): Promise<ContentMetrics>
export async function getEventMetrics(timeRange: TimeRange): Promise<EventMetrics>
export async function getSystemHealthMetrics(timeRange: TimeRange): Promise<SystemMetrics>
export async function trackPageView(pagePath: string, metadata?: any): Promise<void>
export async function trackUserActivity(activityType: string, metadata?: any): Promise<void>
export async function exportAnalyticsData(format: 'csv' | 'pdf', timeRange: TimeRange): Promise<Blob>
```

**`src/hooks/use-analytics-tracking.ts`**:
```typescript
// Client-side analytics tracking hook
export function useAnalyticsTracking() {
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    // Track page views
    trackPageView(location.pathname);
    
    // Track session duration
    const sessionStart = Date.now();
    return () => {
      const duration = Date.now() - sessionStart;
      trackSessionEnd(duration);
    };
  }, [location.pathname, user]);
  
  return {
    trackEvent: (eventType: string, metadata?: any) => trackUserActivity(eventType, metadata),
  };
}
```

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

**Phase 1 Completion:**
- ✅ 4 Batches Completed
- ✅ 7 Major Features Implemented
- ✅ 15+ Bug Fixes Applied
- ✅ Comprehensive Patch System Established
- ✅ Libations Management System Completed

**Phase 2 Goals (REVISED):**
- 🎯 4 Implementation Batches (36-47 hours total)
- 🎯 Navigation Reorganization (mobile-first)
- 🎯 Admin Role & User Management
- 🎯 Email Campaign System (Phase 1 - core features)
- 🎯 Modern Analytics Dashboard with comprehensive metrics
- 🎯 System Configuration & Feature Flags
- 🎯 Production-Ready Admin System

**Phase 2 Implementation Timeline:**
- ✅ **COMPLETED**: Batch 1 (Navigation & Layout Modernization) - 3.5 hours (Oct 11, 2025)
- ✅ **COMPLETED**: Batch 2 (User & Role Management) - 5 hours (Oct 11, 2025)
- ✅ **COMPLETED**: Batch 3 (Email System Phase 1) - 1 hour (Oct 11, 2025) [System already implemented, added documentation]
- 🔄 **ROLLED BACK**: Batch 4 (Navigation Consolidation & DB Fixes) - Awaiting re-implementation in clean branch
- ✅ **COMPLETED**: Batch 5 Phase 3 (Analytics Data Collection) - 3-4 hours (Oct 12, 2025)
- ✅ **COMPLETED**: Batch 6 (Hunt Code Removal) - 2 hours (Oct 12, 2025)
- 🎯 **NEXT**: Re-implement Batch 4 in new branch (version-2.3.0-NavigationConsolidation-v2)
- **Total Completed Time**: 14.5-15.5 hours across Batches 1-3, 5, 6
- **Current Stable Version**: version-2.2.05.4-HuntRemoval-StableVersion

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
*Status: Batches 1-3, 5-6 COMPLETED | Batch 4 rolled back, awaiting re-implementation*
