# Changelog - The Ruths' Twisted Fairytale Halloween Bash

## v3.3 — Analytics Infrastructure: Comprehensive tracking system with 6 tables, 4 functions, and daily aggregation

### 📊 Analytics Database Infrastructure

#### Added
- **Analytics Database Infrastructure** (2025-01-12)
  - 6 new analytics tables for comprehensive tracking:
    - `user_activity_logs`: Track all user actions (RSVP, gallery, guestbook, hunt, tournament, admin)
    - `page_views`: Monitor page navigation and time on page
    - `user_sessions`: Session tracking with device/browser info
    - `content_interactions`: Detailed content engagement metrics
    - `system_metrics`: System performance and health monitoring
    - `analytics_daily_aggregates`: Pre-computed daily statistics
  - 4 new database functions:
    - `track_activity()`: Log user actions
    - `track_page_view()`: Record page visits
    - `get_analytics_dashboard()`: Admin-only analytics retrieval
    - `aggregate_daily_stats()`: Daily metric computation
  - Row-Level Security policies for all analytics tables
  - Automated daily aggregation cron job (1 AM UTC)
  - Comprehensive indexes for query optimization

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