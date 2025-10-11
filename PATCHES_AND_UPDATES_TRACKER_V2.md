# Patches and Updates Tracker V2

## Overview
This document tracks all new patches, updates, and features for the Twisted Hearth Foundation project - Phase 2 Development.

**Start Date:** October 11, 2025  
**Current Version:** 2.1.4-AdminSettings  
**Status:** Active Development 🚧

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

### 🟡 ADMIN-SETTINGS-01: User Management & Database Reset System
- **Files**: 
  - NEW: `src/components/admin/UserManagement.tsx`
  - NEW: `src/components/admin/DatabaseResetPanel.tsx` (dev-only)
  - NEW: `src/lib/user-management-api.ts`
  - NEW: `src/lib/database-reset-api.ts`
  - MODIFY: `src/pages/AdminDashboard.tsx`
- **Status**: 🎯 Planned
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

### 🟡 ADMIN-SETTINGS-02: Admin Role Management System
- **Files**: 
  - NEW: `src/components/admin/AdminRoleManagement.tsx`
  - NEW: `src/lib/admin-roles-api.ts`
  - MODIFY: `src/pages/AdminDashboard.tsx`
- **Status**: 🎯 Planned
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
- **Status**: 🎯 Planned
- **Time**: 2.5-3 hours
- **Priority**: BATCH 1 - Foundation & Navigation
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

### 🟡 ADMIN-SETTINGS-04: Email Campaign Management System (Phase 1)
- **Files**:
  - NEW: `src/components/admin/EmailCampaigns.tsx`
  - NEW: `src/components/admin/EmailTemplateEditor.tsx`
  - NEW: `src/components/admin/CampaignComposer.tsx`
  - NEW: `src/components/admin/RecipientListManager.tsx`
  - NEW: `src/lib/email-campaigns-api.ts`
  - NEW: `supabase/functions/send-email-campaign/index.ts`
  - NEW: Database migrations for email tables
  - NEW: `docs/MAILJET_TEMPLATE_GUIDE.md`
- **Status**: 🎯 Planned
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

*Items will be moved here as they are completed*

---

## Implementation Batches (REVISED)

### 🎯 BATCH 1: Foundation & Navigation (5-6 hours)
**Goal**: Clean, organized admin interface with feature flags
**Priority**: HIGHEST - Unblocks all future work
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

### 🎯 BATCH 4: Polish & Performance (FUTURE)
**Goal**: UI enhancements and performance optimization
**Priority**: LOW - Nice to have, can be deferred

7. **PERFORMANCE-01**: Image Optimization System (2-3 hours)
8. **UX-ENHANCEMENT-01**: Enhanced Loading States (3-4 hours)
   - Note: Consider integrating loading states into features as they're built
9. **FEATURE-REQUEST-01**: Advanced Search & Filtering (4-5 hours)
10. **FEATURE-REQUEST-02**: Analytics Dashboard (5-6 hours)

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
- 🎯 3 Core Implementation Batches (15-19 hours total)
- 🎯 Navigation Reorganization (mobile-first)
- 🎯 Admin Role & User Management
- 🎯 Email Campaign System (Phase 1 - core features)
- 🎯 System Configuration & Feature Flags
- 🎯 Production-Ready Admin System

**Phase 2 Implementation Timeline:**
- **Week 1**: Batch 1 (Foundation & Navigation) - 5-6 hours
- **Week 1-2**: Batch 2 (User & Role Management) - 4-5 hours
- **Week 2**: Batch 3 (Email System Phase 1) - 6-8 hours
- **Total Estimated Time**: 15-19 hours

**Confirmed Scope Decisions:**
- ✅ Single admin role (no hierarchy)
- ✅ Hard user deletes (no soft deletes initially)
- ✅ Dev-only database reset
- ✅ Mailjet for email campaigns
- ✅ Core email features only (no A/B testing Phase 1)
- ✅ Mobile-first navigation redesign
- ✅ All existing features preserved

---

*Last Updated: October 11, 2025*  
*Maintained by: Development Team*  
*Version: 2.1 - REVISED PLAN*
