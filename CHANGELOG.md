# Changelog - The Ruths' Twisted Fairytale Halloween Bash

## v3.5 — Latest Updates: Network Dependencies, RSVP Email Fixes, and Documentation Updates

### 🔧 Network & Dependency Fixes - COMPLETED

#### Fixed
- **Network dependency tree issues**: Resolved dependency conflicts and optimization
- **RSVP email sending issues**: Fixed email delivery problems with proper error handling
- **NavBar component improvements**: Enhanced navigation with latest fixes and collision prevention
- **Documentation consistency**: Renamed Twisted-Pond-Tournament.md to Twisted-Pong-Tournament.md

#### Technical Improvements
- **Dependency optimization**: Cleaned up package dependencies and resolved conflicts
- **Email system reliability**: Improved RSVP email delivery with better error handling
- **UI stability**: Fixed navbar collision issues with flexbox layout
- **Code quality**: Enhanced component reliability and user experience

#### Files Modified
- ✅ `package.json` (dependency updates)
- ✅ `src/components/NavBar.tsx` (collision fixes)
- ✅ `docs/FUTURE-FEATURES/Twisted-Pong-Tournament.md` (naming consistency)
- ✅ Email system components (RSVP delivery fixes)

**Impact**: Improved system stability, better email delivery, and enhanced user experience with more reliable navigation.

---

## v3.4 — Complete Phase 6 Implementation: Notification UI, Modern Carousel, Release Management System, and Communication Package

### 🔔 Phase 6 Notification System - COMPLETED

#### Added
- **Notification Bell Icon**: Added to navbar with unread count badge (desktop & mobile)
- **Notification Dropdown**: Shows 5 recent notifications with mark as read functionality
- **Dedicated Notifications Page**: Complete `/notifications` page with All/Unread filtering
- **CRUD Operations**: Mark as read, mark all as read, delete notifications
- **Real-time Updates**: 30-second polling for unread count updates
- **Mobile Integration**: Bell icon works perfectly on mobile devices

#### Enhanced Components
- **NavBar**: Added notification bell with dropdown menu and unread count badge
- **Notifications Page**: Complete page with filtering, CRUD operations, and notification type icons
- **App Routing**: Added `/notifications` route for dedicated notifications page

#### User Experience
- **Intuitive Interface**: Easy access to all notifications with proper filtering
- **Performance**: Optimized queries with proper caching and React Query integration
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Mobile Responsive**: Seamless experience across all device sizes

#### Files Created/Modified
- ✅ `src/components/NavBar.tsx` (bell icon implementation)
- ✅ `src/pages/Notifications.tsx` (complete notifications page)
- ✅ `src/App.tsx` (route registration)

**Impact**: Users now have a complete notification experience with easy access to all notifications and full control over their notification preferences.

---

### 🎭 Vignettes Carousel Revamp - COMPLETED

#### Added
- **Modern Embla Carousel**: Professional carousel with 3D perspective effects
- **Center-focused Navigation**: Touch/swipe gestures with smooth animations
- **Autoplay with Pause**: Auto-cycles through vignettes with pause on hover
- **Lazy Loading**: Performance optimization with efficient image loading
- **Infinite Loop**: Seamless navigation without jarring transitions

#### Enhanced Components
- **VignettesCarousel**: Complete implementation with Embla carousel integration
- **Vignettes Page**: Updated to use new VignettesCarousel component
- **CSS 3D Effects**: Perspective transforms with rotateY for center emphasis

#### Technical Implementation
- **Packages**: embla-carousel-react@8.6.0, embla-carousel-autoplay@8.6.0, embla-carousel-class-names@8.6.0
- **Responsive Design**: Mobile (1 card), tablet (2 cards), desktop (3 cards)
- **Performance**: Lazy loading and proper cleanup for optimal performance
- **Accessibility**: Proper ARIA labels and keyboard navigation support

#### Files Created/Modified
- ✅ `src/components/VignettesCarousel.tsx` (complete implementation)
- ✅ `src/pages/Vignettes.tsx` (integrated VignettesCarousel)
- ✅ `src/index.css` (3D carousel styles)
- ✅ `package.json` (Embla dependencies)

**Impact**: Users now have a modern, engaging way to explore past vignettes with smooth animations and touch gestures.

---

### 🚀 Release Management System (RMS) - COMPLETED

#### Added
- **Complete Database Schema**: 5-table system with SemVer version tracking
- **Admin Interface**: Comprehensive composer, history, and timeline views
- **Email Integration**: Integrated with existing email system for announcements
- **Version Management**: Proper version comparison and suggestion logic
- **Admin Dashboard Integration**: RMS overview card and quick actions

#### Database Enhancements
- **System Releases Table**: Main release metadata with version tracking
- **Release Features Table**: New features per release
- **Release API Changes Table**: API modifications tracking
- **Release Changes Table**: Generic changes (UI, bugs, improvements)
- **Release Notes Table**: Technical and additional notes
- **RLS Policies**: Admins (CRUD), Public (read deployed), Users (no modify)
- **Helper Functions**: get_latest_release(), get_release_full(), archive_release(), publish_release()

#### Admin Components
- **ReleaseManagement**: List view with filters, search, and quick stats
- **ReleaseComposer**: Form with 10 dynamic sections for creating/editing releases
- **ReleaseHistory**: Timeline view with comparison tool and export functionality
- **VersionBadge**: Status badge helper component with proper color coding

#### Technical Implementation
- **Version Utilities**: Complete SemVer implementation with parseVersion(), suggestNextVersion(), compareVersions(), formatVersion()
- **Release API**: Full CRUD operations with fetchReleases(), createReleaseDraft(), updateRelease(), publishRelease(), archiveRelease(), sendReleaseEmail()
- **Admin Integration**: System dropdown in AdminNavigation, RMS overview card in AdminDashboard
- **Email Template**: Updated system-update.html with RMS variable support

#### Files Created/Modified
- ✅ `supabase/migrations/20251021181417_2b259ef9-289b-4cd7-affa-c938c39ee5c8.sql` (RMS schema)
- ✅ `src/lib/version-utils.ts` (SemVer utilities)
- ✅ `src/lib/release-api.ts` (RMS API)
- ✅ `src/components/admin/ReleaseManagement.tsx` (list view)
- ✅ `src/components/admin/ReleaseComposer.tsx` (form with 10 sections)
- ✅ `src/components/admin/ReleaseHistory.tsx` (timeline view)
- ✅ `src/components/admin/VersionBadge.tsx` (status badge)
- ✅ `src/components/admin/AdminNavigation.tsx` (System dropdown)
- ✅ `src/pages/AdminDashboard.tsx` (RMS integration)
- ✅ `src/integrations/supabase/types.ts` (RMS types)
- ✅ `email-templates/07-system-update.html` (RMS variables)

**Impact**: Admins now have professional-grade tools for tracking releases, communicating updates to users, and maintaining version history.

---

### 📧 Release Announcement Emails - COMPLETED

#### Added
- **Admin Technical Summary**: Comprehensive technical documentation of all phases (1-6) plus RMS
- **User-Facing Announcement**: Friendly, non-technical announcement highlighting new features
- **Distribution Ready**: Both emails formatted and ready for immediate use

#### Content Coverage
- **Technical Summary**: Database changes, file statistics, implementation timeline, security enhancements
- **User Announcement**: Notifications, mobile improvements, RSVP options, carousel enhancements
- **Professional Presentation**: Proper formatting with emojis, support links, and clear benefits

#### Files Created
- ✅ `docs/ADMIN_TECHNICAL_SUMMARY_v3.0.4.md` (technical documentation)
- ✅ `docs/USER_ANNOUNCEMENT_v3.0.4.md` (user announcement)

**Impact**: Complete communication package ready for announcing all updates to both technical team and end users.

---

## v3.3 — Comprehensive Notification System: database triggers, email notifications, user preferences

### 🔔 Notification System Implementation

#### Added
- **Complete Notification Infrastructure**: Full database schema with notifications table, extended preferences, helper functions, and RLS policies
- **NotificationSettings Component**: Comprehensive UI with 7 notification preference toggles (in-app, email types)
- **Email Notification Edge Function**: Robust Mailjet integration with preference checking and beautiful HTML templates
- **Automatic Triggers**: Notifications fire automatically on guestbook replies, photo reactions, and RSVP confirmations
- **Settings Integration**: Added 4th "Notifications" tab to UserSettings page with Bell icon

#### Database Enhancements
- **Notifications Table**: Complete schema with id, user_id, type, title, message, link, is_read, created_at, metadata
- **Extended Preferences**: Added 5 new columns to notification_preferences (email_on_comment, email_on_reply, email_on_reaction, email_on_rsvp_update, email_on_admin_announcement)
- **Helper Functions**: create_notification(), mark_notification_read(), mark_all_notifications_read(), get_unread_notification_count()
- **Trigger Functions**: notify_on_guestbook_reply(), notify_on_photo_reaction(), notify_on_rsvp_update()
- **Security**: Proper RLS policies ensuring users only see their own notifications, admins see all
- **Performance**: Optimized indexes for fast notification queries

#### User Experience
- **Preference Management**: Users can control 7 different notification types through intuitive settings interface
- **Email Templates**: Professional dark-themed HTML emails with action buttons and preference management links
- **Automatic Notifications**: Users receive timely notifications about comments, reactions, and RSVP updates
- **Settings UI**: Beautiful card-based layout with proper icons and loading states

#### Technical Implementation
- **Edge Function**: send-notification-email with comprehensive error handling and CORS support
- **TypeScript Types**: Complete type definitions for notifications and extended preferences
- **Database Migration**: Safe migration strategy preserving existing data while adding new functionality
- **Integration**: Seamless integration with existing Settings page and user authentication

#### Files Created/Modified
- ✅ `supabase/migrations/20251021025507_468b22c3-c7ba-4d2f-9afd-5af9f64cb11d.sql` (240 lines)
- ✅ `src/components/settings/NotificationSettings.tsx` (325 lines)
- ✅ `src/pages/UserSettings.tsx` (13 lines modified)
- ✅ `supabase/functions/send-notification-email/index.ts` (184 lines)
- ✅ `src/integrations/supabase/types.ts` (74 lines added)

**Impact**: Users now receive timely notifications about comments, reactions, and RSVP updates while maintaining full control over their notification preferences through an intuitive settings interface.

---

## v3.2 — Motion & accessibility polish: proximity-based hunt reveals, section animations, skip link, global focus ring.

### 🎨 Motion & Accessibility Enhancements

#### Added
- **Proximity-Based Hunt Reveals**: Hunt runes now invisible until pointer is within ~120px (desktop) or faint-visible (touch)
- **Section Reveal Animations**: Major content sections gently animate into view using Intersection Observer
- **Skip Link**: Keyboard users can jump directly to main content with tab + enter
- **Global Focus Ring**: Consistent high-contrast focus indicators across all interactive elements
- **Motion Safety**: All animations respect `prefers-reduced-motion` user preferences

#### Enhanced Components
- **HuntHintTrigger**: Complete rewrite with proximity detection, aria-pressed states, and gold tinting for found runes
- **Index Page**: Added section reveal animations to vignettes, preparation, and CTA sections
- **CSS Animation System**: New `reveal` classes with rise-fade keyframes and motion-reduce fallbacks

#### New Hooks
- **use-proximity**: Detects pointer distance for stealthy hunt rune reveals on desktop
- **use-reveal**: Intersection Observer hook for scroll-triggered section animations

#### Accessibility Improvements
- **Proper Landmarks**: Main content wrapped with `<main id="main">` for skip link targeting
- **Enhanced ARIA**: Hunt runes announce pressed state to screen readers
- **Keyboard Navigation**: All interactive elements properly focusable with consistent styling
- **Debug Mode**: Set `VITE_HUNT_DEBUG=1` to force hunt runes visible during development

#### Technical Enhancements
- **Passive Event Listeners**: Optimized pointer tracking with passive scroll handling
- **Performance**: Efficient cleanup of observers and event listeners
- **Reduced Motion**: Comprehensive support for motion preferences across all animations

## v3.1 — SPA links, ErrorBoundary + Suspense, loading states (hero/images/forms), SEO meta tags

### 🔧 Code Quality & Resilience Improvements

#### Added
- **Error Boundaries**: Created ErrorBoundary component to catch runtime errors and display friendly fallback UI
- **Suspense Fallbacks**: Added React Suspense wrapper with loading states for future code-splitting
- **Loading States**: Enhanced user experience with loading indicators for hero video, card images, and form submissions
- **SPA Navigation**: Replaced all internal `<a href>` links with React Router `<Link>` components for instant navigation
- **Comprehensive SEO**: Added complete meta tags (keywords, Open Graph, Twitter Card) without physical address exposure

#### Enhanced Components
- **HeroVideo**: Added aria-busy state and screen reader announcements for loading states
- **Card**: Implemented image loading state with skeleton placeholder to prevent layout shift
- **RSVP Form**: Added submission loading state with disabled button and "Submitting..." feedback
- **App**: Wrapped entire application with ErrorBoundary and Suspense for better error handling

#### Technical Improvements
- **Type Safety**: Added proper async handling for form submissions with error states
- **Accessibility**: Loading states announced to screen readers, proper aria-busy attributes
- **Performance**: Image loading optimizations with lazy loading and proper dimensions
- **User Experience**: No more page reloads on internal navigation, graceful error recovery

#### SEO Enhancements
- **Meta Tags**: Complete Open Graph and Twitter Card metadata
- **Structured Data**: Maintained existing JSON-LD Event schema
- **Social Sharing**: Proper image and description for social media previews
- **Privacy Compliant**: All meta tags exclude physical address information

## v3 — Scavenger Hunt v1: 15 hints, progress chip, reward modal, localStorage persistence

- Implemented complete scavenger hunt system with 15 hidden triggers across all pages
- Added HuntProvider context with localStorage persistence and progress tracking
- Created HuntHintTrigger interactive component with keyboard accessibility 
- Built floating progress chip and detailed progress panel with reset function
- Added reward modal with confetti animation and random congratulatory messages
- Placed hunt triggers strategically: Home (5), Vignettes (4), Costumes (2), Feast (2), Schedule (1), About (1)
- Full keyboard support, reduced-motion compliance, and focus management
- Dev tools: window.hunt.reset() for testing, DEV-only reset button in progress panel

## v2.1 — Centralized event date & updated to Oct 18, 2025; added JSON-LD Event metadata

### 📅 Event Date Centralization

#### Added
- **Centralized Event Configuration**: Created `src/lib/event.ts` with official date helpers and timezone support
- **Dynamic Date Display**: All pages now use standardized date formatting functions
- **SEO Enhancement**: Added JSON-LD Event structured data to index.html with proper schema markup
- **Official Event Date**: Saturday, October 18, 2025 at 7:00 PM (America/Denver timezone)

#### Updated
- **Index Page**: Replaced hard-coded "October 31st, 2024" with dynamic date formatting
- **RSVP Page**: Updated event details section to use centralized date helpers
- **Vignettes Page**: Updated year reference from 2024 to 2025 for current event
- **README**: Added official event date information to project overview

#### Technical Details
- Date helpers support proper timezone handling (America/Denver)
- Internationalization-ready date formatting with Intl.DateTimeFormat
- Privacy maintained: no physical address in client-side code or structured data
- All date references now use single source of truth from event config

## [2.0.0] - 2024-10-31

### Added
- Hero video with autoplay, muted controls, and unmute button
- Rotating teaser lines beneath hero tagline (4 atmospheric one-liners, 4.5s intervals)
- Past Vignettes section with 3 interactive cards (Goldilocks, Jack & Beanstalk, Snow White)
- Accessible modal system for vignette teasers with focus management and keyboard navigation
- Generated placeholder images for all vignettes (thumb and teaser versions)
- Hero poster image and video placeholder references
- Enhanced accessibility with proper ARIA labels and reduced motion support
- Caption track placeholder for hero video
- Improved text shadows and visual effects for hero overlay

### Enhanced
- HeroVideo component with video controls and reduced-motion fallbacks
- Modal component with better focus trap and keyboard navigation
- Index page restructured with new Past Vignettes section
- CSS improvements for gothic atmosphere and reduced motion support

## [1.0.0] - 2024-10-31

### 🎭 Initial Scaffold Release

**Foundation & Site Architecture Completed**

#### ✨ Features Added
- **Complete Design System**: Gothic fairytale theme with dark palette, custom fonts (Cinzel Decorative, IM Fell English SC, Inter)
- **Full Route Structure**: 10 themed pages with React Router DOM integration
- **Responsive Navigation**: Sticky navbar with mobile menu and accessibility features
- **Component Library**: Reusable Card, Carousel, Modal, FormField, HeroVideo components
- **RSVP System**: Complete form with client-side validation (backend integration v3)
- **Accessibility Compliance**: WCAG 2.1 AA standards, keyboard navigation, focus management
- **Performance Optimization**: Font loading with swap, semantic HTML structure

#### 🎨 Design System
- **Colors**: HSL-based semantic tokens for gothic fairytale aesthetic
- **Typography**: Three-tier font hierarchy for thematic consistency
- **Motion**: Respect for `prefers-reduced-motion` with subtle hover effects
- **Components**: shadcn/ui integration with custom gothic variants

#### 📄 Pages Implemented
- `/` - Hero landing with interactive storytelling preview
- `/about` - Theme explanation and host introductions
- `/vignettes` - Past event showcases with teaser cards
- `/schedule` - Detailed event timeline with activity descriptions
- `/costumes` - Inspiration gallery with carousel and contest info
- `/feast` - Potluck guidelines and signature cocktail menu
- `/rsvp` - Registration form with validation and mock submission
- `/gallery` - Photo showcase placeholder with coming soon messaging
- `/discussion` - Guestbook placeholder for community interaction
- `/contact` - Host information with privacy-compliant design

#### 🛡️ Privacy & Security
- **Location Privacy**: Physical address never exposed in client-side code
- **Form Validation**: Client-side validation with proper error handling
- **Accessibility**: Full keyboard navigation and screen reader support

#### 🔮 Future Scaffolding
- **Hunt System**: Component stubs created for v2 scavenger hunt feature
- **Backend Prep**: Supabase and Mailjet integration points established
- **Email System**: Template structure defined for RSVP automation

#### 📦 Technical Stack
- React 18 + TypeScript + Vite
- Tailwind CSS with custom design tokens
- shadcn/ui component library
- React Router DOM for routing
- Fully responsive and accessible design

### 🔄 Next Milestones

**v3 - Backend Integration**
- Supabase database connection
- RSVP → Database → Email automation
- Mailjet server-side email templates
- Location details injection (server-side only)

---
*"Every great story begins with a foundation... ours is built in shadows and code."*