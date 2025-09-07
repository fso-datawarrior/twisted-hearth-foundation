# The Ruths' Twisted Fairytale Halloween Bash

A dark, immersive Halloween event website featuring twisted fairytale themes, interactive storytelling, and gothic design.

**Event Domain**: [partytillyou.rip](https://partytillyou.rip)
**Hosts**: Jamie & Kat Ruth  
**Event Date**: Saturday, October 18, 2025 — 7:00 PM (America/Denver)

## 🎭 Project Overview

This website serves as the digital gateway to an exclusive Halloween celebration where beloved fairytales meet contemporary darkness. Built with React, TypeScript, and Tailwind CSS, it features a comprehensive design system, multiple themed pages, and scaffolding for future interactive features.

## 🚀 Quick Start

### Development Server
```bash
npm install
npm run dev
```

### Production Preview
```bash
npm run build
npm run preview
```

## 🎨 Design System

### Color Palette (HSL)
All colors are defined as semantic tokens in `src/index.css`:

- **Core Theme**: 
  - `--bg`: Deep charcoal (#0B0B0C)
  - `--bg-2`: Midnight purple (#1A1F3A)  
  - `--ink`: Soft white (#EDEDED)

- **Fairytale Accents**:
  - `--accent-purple`: Enchanted purple (#3B1F4A)
  - `--accent-green`: Forest green (#3B6E47)
  - `--accent-red`: Blood red (#8B0000)
  - `--accent-gold`: Ancient gold (#C5A45D)

### Typography
- **Headings**: Cinzel Decorative (Gothic elegance)
- **Subheadings**: IM Fell English SC (Fairytale authenticity)  
- **Body Text**: Inter (Modern readability)

### Motion System
- Respects `prefers-reduced-motion`
- Subtle hover effects (glow, tilt, scale)
- Smooth transitions with `motion-safe` class

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── hunt/            # Scavenger hunt stubs (v2)
│   ├── NavBar.tsx       # Main navigation
│   ├── Footer.tsx       # Gothic footer with icons
│   ├── Card.tsx         # Multi-variant card component
│   ├── Carousel.tsx     # Accessible image carousel
│   ├── FormField.tsx    # Form input with validation
│   ├── HeroVideo.tsx    # Video/image hero section
│   └── Modal.tsx        # Accessible modal with focus trap
├── pages/               # Route components
│   ├── Index.tsx        # Home/Hero page
│   ├── About.tsx        # Theme explanation
│   ├── Vignettes.tsx    # Past event showcases
│   ├── Schedule.tsx     # Event timeline
│   ├── Costumes.tsx     # Inspiration gallery
│   ├── Feast.tsx        # Food & drinks info
│   ├── RSVP.tsx         # Registration form
│   ├── Gallery.tsx      # Photo gallery (placeholder)
│   ├── Discussion.tsx   # Guestbook (placeholder)
│   └── Contact.tsx      # Host information
├── lib/                 # Utilities and integrations
│   ├── utils.ts         # Tailwind utility function
│   ├── supabase.ts      # Backend client (v3)
│   └── mailjet.ts       # Email service (v3)
└── styles/
    └── index.css        # Design system tokens
```

## 🔒 Privacy & Security

### Critical Privacy Rule
**NEVER render physical addresses in client-side code.** Location details are provided only via server-side email after RSVP confirmation.

### Accessibility (WCAG 2.1 AA)
- Semantic HTML structure
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly
- Color contrast >= 4.5:1
- `prefers-reduced-motion` support

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components  
- **Routing**: React Router DOM (file-based structure)
- **State**: Lightweight React state (no global store yet)
- **Backend** (v3): Supabase integration planned
- **Email** (v3): Mailjet server-side integration planned

## 📋 Current Status - Scaffold v1

### ✅ Completed
- [x] Full design system with gothic fairytale theme
- [x] Responsive navigation with mobile menu
- [x] All 10 routes with themed content
- [x] Reusable component library
- [x] RSVP form with client-side validation
- [x] Accessibility features and focus management
- [x] Performance optimizations (font-display, lazy loading ready)
- [x] SEO meta tags and semantic HTML
- [x] Complete scavenger hunt system (15 secrets)
- [x] Error boundaries and Suspense fallbacks for resilience
- [x] Loading states for hero video, images, and form submissions
- [x] SPA navigation with React Router Links

### 🔄 TODO v2 - Interactive Features
- [ ] Scavenger hunt system (components stubbed in `src/components/hunt/`)
- [ ] Photo gallery with real images
- [ ] Interactive guestbook/discussion
- [ ] Advanced carousel functionality
- [ ] Animation refinements

### ✅ COMPLETE - Backend Integration
- [x] Supabase project setup and connection
- [x] RSVP → Database → Email automation pipeline
- [x] Mailjet server-side email templates with private address
- [x] Database tables (users, rsvps) with RLS policies
- [x] Security definer RPC function for atomic RSVP upserts

### 🔄 TODO - Advanced Features
- [ ] User authentication (if needed)
- [ ] Photo upload functionality
- [ ] Real-time guestbook

## 🔧 Quality & Resilience

### SPA Navigation
- **React Router Links**: All internal navigation uses `<Link>` components for instant client-side routing
- **No Page Reloads**: Seamless navigation preserves application state

### Error Handling
- **Error Boundaries**: React error boundaries catch and display friendly fallback UI
- **Suspense Fallbacks**: Graceful loading states for route changes and lazy-loaded components
- **Form Validation**: Client-side validation with loading states and error messaging

### Loading States
- **Hero Video**: Screen reader announcements and loading indicators until video metadata loads
- **Card Images**: Skeleton placeholders prevent layout shift during image loading
- **Form Submissions**: Button disabled state with "Submitting..." feedback during async operations

### Testing Error Boundaries
In development, you can test error boundaries by temporarily throwing an error in any component:
```tsx
// Temporary test code - remove after testing
throw new Error("Test error boundary");
```

## Scavenger Hunt

The site includes an interactive scavenger hunt with 15 hidden hints scattered across different pages. Players must discover these "runes" to unlock special rewards.

### Features
- **15 Hidden Hints**: Strategically placed across all pages with thematic positioning
- **Progress Tracking**: Persistent localStorage with floating progress chip after first discovery
- **Reward System**: Unlock congratulatory modal with special messages at completion
- **Accessibility**: Full keyboard navigation and screen reader support
- **Reduced Motion**: Respects user motion preferences

### Hunt Locations
- **Home (5 hints)**: Logo, moon, path, CTA, footer icon
- **Vignettes (4 hints)**: Each story card plus theme link
- **Costumes (2 hints)**: Header and preparation section
- **Feast (2 hints)**: Header and chopping board
- **Schedule (1 hint)**: Near event date
- **About (1 hint)**: Near signature/closing

### Developer Tools
In development mode, use `window.hunt.reset()` to clear all progress for testing.

## Motion & A11y Polish

The site includes advanced accessibility and motion features designed for an inclusive experience.

### Proximity-Based Hunt Reveals
- **Desktop**: Hunt runes are invisible until pointer comes within ~120px radius OR focused/hovered
- **Touch Devices**: Runes remain faint-visible for easy discovery
- **Debug Mode**: Set `VITE_HUNT_DEBUG=1` to force all runes visible during development
- **Found State**: Completed runes appear gold-tinted with enhanced visual feedback

### Section Reveal Animation
- **Intersection Observer**: Major content sections gently reveal as they scroll into view
- **Reduced Motion**: Sections appear instantly when motion preferences are disabled
- **Performance**: Uses efficient observer pattern with automatic cleanup

### Global Accessibility
- **Skip Link**: Keyboard users can jump directly to main content with tab + enter
- **Focus Management**: Consistent high-contrast focus rings across all interactive elements
- **Landmarks**: Proper semantic structure with `<main>` landmark and ARIA labels
- **Motion Safety**: All animations respect `prefers-reduced-motion` settings

## 🎯 Performance Targets

- **LCP**: < 2.5s (Large Contentful Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)  
- **INP**: < 200ms (Interaction to Next Paint)

## 📊 Verification Screenshots

Recommended verification points:
1. **Hero Section**: Dark video background with rotating teasers and unmute button
2. **Past Vignettes**: Interactive cards that open accessible modals with teaser images
3. **RSVP Form**: Validation working, gothic styling applied

## 🔮 Next Development Phase

When ready for v2, focus on:
1. Enable hunt system: Set `HUNT_ENABLED = true` in hunt components
2. Connect real image sources for gallery
3. Implement interactive storytelling elements
4. Add more sophisticated animations

## 📧 RSVP Pipeline (Production Ready)

The RSVP system is fully implemented with a secure server-side email flow:

### Architecture Flow
1. **Frontend Form** (`/rsvp`) → Validates input and calls backend
2. **Database RPC** (`public.submit_rsvp`) → Atomically upserts user + RSVP data
3. **Edge Function** (`send-rsvp-confirmation`) → Sends email with private address
4. **Email Delivery** → Mailjet sends confirmation with location details

### Database Schema
- `public.users` - User information (name, email)
- `public.rsvps` - RSVP details (guests, dietary, costume ideas, etc.)
- RLS policies enabled for security
- Atomic upserts via security definer function

### Privacy & Security
- **Private address** is stored only in server environment variables
- **Never exposed** in client code, UI, or browser
- Location details sent only via confirmation email
- RLS policies protect database access
- Adds anti-spam (honeypot + ≥1s timing guard), ICS calendar invite attachment, CORS allowlist, and idempotent submits. No physical address is ever rendered client-side.

### Deployment Setup
1. **SQL Migration**: Tables and RPC function already deployed
2. **Edge Function**: `supabase functions deploy send-rsvp-confirmation` 
3. **Environment Variables** (Set in Supabase Dashboard → Functions → Variables):
   ```
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_API_SECRET=your_mailjet_secret
   MAILJET_FROM_EMAIL=rsvp@partytillyou.rip
   MAILJET_FROM_NAME=Jamie & Kat Ruth
   PRIVATE_EVENT_ADDRESS=your_private_address
   ```

### Testing
- Use `.env.example` as template for local development
- Test RSVP flow end-to-end via `/rsvp` page
- Check Supabase logs for Edge Function execution

## 🔐 Authentication System

The project includes a magic link authentication system using Supabase Auth with a secure hash-based token flow.

### Authentication Flow

1. **Sign In** (`/auth`) → User enters email, receives magic link
2. **Magic Link Click** → Redirects to `/auth` with authentication tokens in URL hash
3. **Token Processing** (`AuthCallback.tsx`) → Extracts tokens from hash, creates session
4. **Session Management** (`AuthProvider`) → Maintains auth state across app
5. **Auto Redirect** → Authenticated users redirected to `/discussion`

### Technical Implementation

#### Hash-Based Token Parsing
Supabase returns authentication data in URL hash fragments (not query parameters):
```
https://domain.com/auth#access_token=xxx&refresh_token=yyy&expires_at=zzz
```

The `AuthCallback` component correctly parses these hash parameters:
```typescript
// Parse URL hash parameters (Supabase uses hash fragments)
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');
```

#### Session Management
- Uses Supabase's `onAuthStateChange` listener for real-time auth updates
- Maintains both `user` and `session` objects in React context
- Automatic token refresh handled by Supabase client
- Persistent auth state via localStorage

#### Error Handling
- Expired/used magic links → Clear error message with resend option
- Network failures → Graceful fallback with retry functionality
- Invalid tokens → Proper error display and redirect to sign-in

### Authentication Pages
- **`/auth`** - Main authentication page (sign in/sign up)
- **`/auth` (callback)** - Handles magic link redirects and token processing
- **`/discussion`** - Protected page requiring authentication

### Domain Migration for Authentication

When migrating to your custom domain, you MUST update Supabase authentication settings:

#### Step 1: Update Supabase Dashboard Settings
Go to [Supabase Dashboard → Authentication → Settings](https://supabase.com/dashboard/project/hsyyculqmeslhwiznjwh/auth/providers):

1. **Site URL**: Update to your new domain
   ```
   https://your-custom-domain.com
   ```

2. **Additional Redirect URLs**: Add both old and new domains during transition
   ```
   https://your-custom-domain.com/auth
   https://twisted-hearth-foundation.lovable.app/auth
   http://localhost:8080/auth
   ```

#### Step 2: Update Domain References in Code
The authentication system automatically uses `window.location.origin` so no code changes needed, but verify these files reference correct domains:

- `src/lib/auth.tsx` - Uses dynamic origin for redirects ✅
- `src/pages/AuthCallback.tsx` - Domain-agnostic hash parsing ✅
- `supabase/functions/send-rsvp-confirmation/index.ts` - Update CORS origins if needed

#### Step 3: Test Authentication Flow
1. Update Supabase settings
2. Deploy to your custom domain
3. Test complete flow:
   - Sign in at `https://your-domain.com/auth`
   - Click magic link in email
   - Verify redirect to `https://your-domain.com/auth` with tokens
   - Confirm successful authentication and redirect to `/discussion`

#### Step 4: Clean Up Old Redirect URLs
After successful migration, remove old Lovable domain from Supabase redirect URLs.

### Troubleshooting Authentication

**Blank Page on Magic Link Click**:
- Check Supabase redirect URLs include your domain + `/auth`
- Verify hash-based token parsing (not query parameters)

**Magic Link Goes to Wrong Domain**:
- Update Supabase Site URL to your custom domain
- Clear browser cache after DNS changes

**Authentication Fails After Domain Change**:
- Ensure CORS settings allow your new domain
- Check browser console for CORS or network errors
- Verify DNS propagation is complete

---

*"Not all who wander are lost... but some should be."*

**© 2024 Jamie & Kat Ruth. All twisted tales reserved.**