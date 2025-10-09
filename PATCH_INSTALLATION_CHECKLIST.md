# Patch Installation Checklist

Track your progress installing code review patches for the Twisted Hearth Foundation Event Platform.

## Status Legend
- ✅ **Applied** - Patch has been successfully installed
- [ ] **Pending** - Patch needs to be installed
- 🔄 **In Progress** - Currently working on this patch

---

## ✅ Already Applied

- [x] `00-critical-react-duplication-fix.patch` - Fixed React hook null errors from duplicate instances (UNPLANNED)
- [x] `01-critical-security-hardcoded-credentials.patch` - Removed hardcoded credentials
- [x] `01-high-supabase-hardcoded-client.patch` - Fixed hardcoded Supabase client
- [x] `PATCH-CR-01-vignette-schema.sql` - Added vignette database schema (25 TS errors fixed)
- [x] `PATCH-CR-02-input-validation.patch` - Added Zod validation to all 3 edge functions
- [x] `01-critical-performance-fix-gallery-loading.patch` - Optimized gallery image loading
- [x] `02-critical-resilience-add-error-boundaries.patch` - Added error boundaries to Gallery
- [x] `07-medium-ux-error-boundaries.patch` - Fixed ErrorBoundary/Suspense order in App.tsx
- [x] `02-high-security-server-client.patch` - Created secure server-side Supabase client (server.ts)
- [x] `03-high-security-rls-policies.patch` - Strengthened Row Level Security on RSVPs table
- [x] `04-high-security-edge-function-validation.patch` - Input validation (included in PATCH-CR-02)
- [x] `03-high-performance-fix-memory-leaks.patch` - Fixed memory leaks in ImageCarousel.tsx
- [x] `06-high-data-admin-selects.patch` - Optimized database queries with selective fields
- [x] `02-medium-storage-user-prefix.patch` - Prefixed uploads with user ID in Gallery.tsx
- [x] `12-low-dx-error-handling.patch` - Created centralized logger utility (lib/logger.ts)
- [x] `05-medium-performance-console-logs.patch` - Replaced console.logs with logger in auth.tsx

---

## 🔴 Critical Priority (Install First)

*All critical patches have been applied!*

---

## 🟠 High Priority (Install Next)

*All high priority patches have been applied!*

---

## 🟡 Medium Priority (Install When Ready)

### [x] `03-medium-dx-unify-supabase-client.patch`
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

### [x] `05-medium-performance-console-logs.patch`
**Impact:** Removes console logs in production  
**Files:** 1 (lib/auth.tsx)  
**Action:** Replaces console.log with logger utility

### [ ] `06-medium-typescript-strict-mode.patch`
**Impact:** Enables strict TypeScript checks  
**Files:** 1 (tsconfig.json)  
**Action:** Turns on noImplicitAny, strictNullChecks, etc.

### [x] `07-medium-env-example.patch`
**Impact:** Documents required environment variables  
**Files:** 1 (new file: .env.example)  
**Action:** Creates example env file


### [ ] `08-medium-performance-bundle-splitting.patch`
**Impact:** Reduces bundle size with code splitting  
**Files:** 1 (vite.config.ts)  
**Action:** Splits admin, hunt, and gallery into separate chunks

---

## 🟢 Low Priority (Install Last)

### [x] `09-low-accessibility-skip-links.patch`
**Impact:** Improves keyboard navigation accessibility  
**Files:** 1 (SkipLink.tsx)  
**Action:** Adds focus ring styles

### [ ] `10-low-performance-image-dimensions.patch`
**Impact:** Adds dimensions to hero video  
**Files:** 1 (HeroVideo.tsx)  
**Action:** Adds width/height to video element

### [x] `11-low-dx-env-example.patch`
**Impact:** Comprehensive env example file  
**Files:** 1 (.env.example)  
**Action:** Documents all environment variables

### [x] `12-low-dx-error-handling.patch`
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
**Total Patches:** 26 (25 planned + 1 unplanned critical fix)  
**Applied:** 20  
**Remaining:** 6
