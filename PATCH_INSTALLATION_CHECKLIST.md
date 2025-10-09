# Patch Installation Checklist

Track your progress installing code review patches for the Twisted Hearth Foundation Event Platform.

## Status Legend
- ✅ **Applied** - Patch has been successfully installed
- [ ] **Pending** - Patch needs to be installed
- 🔄 **In Progress** - Currently working on this patch

---

## ✅ Already Applied

- [x] `01-critical-security-hardcoded-credentials.patch` - Removed hardcoded credentials
- [x] `01-high-supabase-hardcoded-client.patch` - Fixed hardcoded Supabase client
- [x] `PATCH-CR-01-vignette-schema.sql` - Added vignette database schema (25 TS errors fixed)
- [x] `PATCH-CR-02-input-validation.patch` - Added Zod validation to edge functions (2/3 functions: send-rsvp-confirmation, send-contribution-confirmation)

---

## 🔴 Critical Priority (Install First)

### [ ] `01-critical-performance-fix-gallery-loading.patch`
**Impact:** Fixes gallery image loading performance issues  
**Files:** 1 (MultiPreviewCarousel.tsx)  
**Action:** Optimizes image fetching and rendering

### [ ] `02-critical-resilience-add-error-boundaries.patch`
**Impact:** Prevents app crashes from rendering errors  
**Files:** 2 (ErrorBoundary.tsx, Gallery.tsx)  
**Action:** Wraps components in error boundaries

---

## 🟠 High Priority (Install Next)

### [ ] `02-high-security-server-client.patch`
**Impact:** Creates secure server-side Supabase client  
**Files:** 1 (new file: integrations/supabase/server.ts)  
**Action:** Adds admin client for edge functions

### [ ] `03-high-security-rls-policies.patch`
**Impact:** Strengthens Row Level Security on RSVPs  
**Files:** 1 (migration file)  
**Action:** Updates RLS policy to restrict access properly

### [ ] `04-high-security-edge-function-validation.patch`
**Impact:** Adds input validation to RSVP confirmation  
**Files:** 1 (send-rsvp-confirmation/index.ts)  
**Action:** Implements Zod schema validation

### [ ] `03-high-performance-fix-memory-leaks.patch`
**Impact:** Fixes memory leaks in image carousel  
**Files:** 1 (ImageCarousel.tsx)  
**Action:** Properly cleans up intervals on unmount

### [ ] `06-high-data-admin-selects.patch`
**Impact:** Optimizes database queries by selecting specific fields  
**Files:** 2 (AdminDashboard.tsx, tournament-api.ts)  
**Action:** Replaces `select('*')` with explicit columns

---

## 🟡 Medium Priority (Install When Ready)

### [ ] `02-medium-storage-user-prefix.patch`
**Impact:** Improves storage organization by user ID  
**Files:** 1 (Gallery.tsx)  
**Action:** Prefixes uploaded files with user ID

### [ ] `03-medium-dx-unify-supabase-client.patch`
**Impact:** Consolidates Supabase client imports  
**Files:** 1 (lib/supabase.ts)  
**Action:** Single source of truth for Supabase client

### [ ] `04-medium-perf-image-dimensions.patch`
**Impact:** Adds explicit image dimensions for better performance  
**Files:** 2 (Carousel.tsx, ImageCarousel.tsx)  
**Action:** Adds width/height/loading attributes

### [ ] `04-medium-ux-add-loading-states.patch`
**Impact:** Improves UX with loading skeletons  
**Files:** 1 (Gallery.tsx)  
**Action:** Adds skeleton placeholders during image loading

### [ ] `05-medium-db-indexes.patch`
**Impact:** Improves database query performance  
**Files:** 1 (new migration)  
**Action:** Creates indexes on commonly queried columns

### [ ] `05-medium-performance-console-logs.patch`
**Impact:** Removes console logs in production  
**Files:** 1 (lib/auth.tsx)  
**Action:** Replaces console.log with logger utility

### [ ] `06-medium-typescript-strict-mode.patch`
**Impact:** Enables strict TypeScript checks  
**Files:** 1 (tsconfig.json)  
**Action:** Turns on noImplicitAny, strictNullChecks, etc.

### [ ] `07-medium-env-example.patch`
**Impact:** Documents required environment variables  
**Files:** 1 (new file: .env.example)  
**Action:** Creates example env file

### [ ] `07-medium-ux-error-boundaries.patch`
**Impact:** Better error boundary placement  
**Files:** 1 (App.tsx)  
**Action:** Moves ErrorBoundary inside Suspense

### [ ] `08-medium-performance-bundle-splitting.patch`
**Impact:** Reduces bundle size with code splitting  
**Files:** 1 (vite.config.ts)  
**Action:** Splits admin, hunt, and gallery into separate chunks

---

## 🟢 Low Priority (Install Last)

### [ ] `09-low-accessibility-skip-links.patch`
**Impact:** Improves keyboard navigation accessibility  
**Files:** 1 (SkipLink.tsx)  
**Action:** Adds focus ring styles

### [ ] `10-low-performance-image-dimensions.patch`
**Impact:** Adds dimensions to hero video  
**Files:** 1 (HeroVideo.tsx)  
**Action:** Adds width/height to video element

### [ ] `11-low-dx-env-example.patch`
**Impact:** Comprehensive env example file  
**Files:** 1 (.env.example)  
**Action:** Documents all environment variables

### [ ] `12-low-dx-error-handling.patch`
**Impact:** Adds centralized logging utility  
**Files:** 1 (new file: lib/logger.ts)  
**Action:** Creates logger for consistent error handling

---

## Quick Application Guide

### For `.patch` files:
```bash
# Apply a single patch
git apply PATCHES/patch-name.patch

# Or manually copy changes from patch file
```

### For `.sql` files:
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL contents from the patch file
3. Run the query
4. Regenerate types: `npx supabase gen types typescript --project-id <your-id> > src/integrations/supabase/types.ts`

---

## Installation Order Recommendation

1. **Week 1:** All Critical patches (prevent security issues and crashes)
2. **Week 2:** High Priority patches (security hardening and performance)
3. **Week 3:** Medium Priority patches (code quality and UX improvements)
4. **Week 4:** Low Priority patches (polish and developer experience)

---

## Notes

- Test thoroughly after each patch installation
- Some patches may conflict if code has been modified
- Create a backup/commit before applying patches
- Regenerate TypeScript types after database migrations
- Review `CODE_REVIEW_FINDINGS.md` for detailed explanations of each patch

---

**Last Updated:** 2025-10-09  
**Total Patches:** 25  
**Applied:** 4  
**Remaining:** 21
