# Changelog - The Ruths' Twisted Fairytale Halloween Bash

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