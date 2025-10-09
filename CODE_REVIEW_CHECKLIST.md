# CODE REVIEW CHECKLIST

## How to Use This Checklist

Each item is mapped to a specific finding (CR-##) from CODE_REVIEW_FINDINGS.md. Check off items as you verify fixes.

**Priority Legend**:
- 🔴 **CRITICAL** - Must fix immediately (blocks deployment)
- 🟠 **HIGH** - Fix within 1 week (security/performance)
- 🟡 **MEDIUM** - Fix within 2-3 weeks (quality/UX)
- 🟢 **LOW** - Fix when convenient (maintenance)

---

## Phase 1: Critical Build Fixes (Week 1)

### CR-01: Vignettes Database Schema 🔴

- [ ] Run PATCH-CR-01-vignette-schema.sql migration
- [ ] Verify `past_vignettes` table created successfully
- [ ] Verify `photos.is_vignette_selected` column added
- [ ] Test `manage_vignette` RPC function (create)
- [ ] Test `manage_vignette` RPC function (update)
- [ ] Test `manage_vignette` RPC function (delete)
- [ ] Test `manage_vignette` RPC function (reorder)
- [ ] Test `get_active_vignettes` RPC function
- [ ] Test `toggle_vignette_selection` RPC function
- [ ] Verify RLS policies block non-admin access
- [ ] Test admin can create vignettes via UI
- [ ] Test vignettes display correctly on public page
- [ ] Regenerate Supabase types: `npx supabase gen types typescript`
- [ ] Verify TypeScript compilation succeeds
- [ ] Test vignette photo selection in admin panel
- [ ] Verify no console errors related to vignettes

**Success Criteria**: ✅ Vignette feature fully functional, no TypeScript errors

---

## Phase 2: Security Hardening (Week 1-2)

### CR-02: Input Validation 🔴

- [ ] Apply PATCH-CR-02-input-validation.patch
- [ ] Install Zod in edge functions: Add to import_map.json
- [ ] Test send-rsvp-confirmation with valid input
- [ ] Test send-rsvp-confirmation with invalid email
- [ ] Test send-rsvp-confirmation with missing name
- [ ] Test send-rsvp-confirmation with XSS payload
- [ ] Test send-rsvp-confirmation with oversized input
- [ ] Test send-bulk-email with 0 recipients (should fail)
- [ ] Test send-bulk-email with 101 recipients (should fail)
- [ ] Test send-bulk-email with malformed HTML
- [ ] Test send-contribution-confirmation validation
- [ ] Verify validation errors return 400 status
- [ ] Verify validation errors include helpful messages
- [ ] Check edge function logs for validation errors

**Success Criteria**: ✅ All edge functions reject invalid input, return descriptive errors

---

### CR-05: RLS Policy Review 🟠

- [ ] Review guestbook policies - verify user isolation
- [ ] Review guestbook_reactions policies - test toggle reactions
- [ ] Review guestbook_replies policies - test reply permissions
- [ ] Review guestbook_reports policies - verify admin-only view
- [ ] Review hunt_hints policies - verify public can view active
- [ ] Review hunt_progress policies - verify user can only see own
- [ ] Review hunt_rewards policies - verify user can only claim own
- [ ] Review hunt_runs policies - verify user can only update own
- [ ] Review photo_emoji_reactions policies - test reactions
- [ ] Review photo_reactions policies - test like/unlike
- [ ] Review photos policies - verify approved photos visible
- [ ] Review photos policies - verify user can delete own only
- [ ] Review potluck_items policies - verify soft delete works
- [ ] Review profiles policies - verify public read, self-write
- [ ] Review rsvps policies - verify user can only see own RSVP
- [ ] Review rsvps policies - verify admin can see all RSVPs
- [ ] Review tournament tables - verify admin-only management
- [ ] Review user_roles policies - verify admin-only access
- [ ] Test with non-admin user - verify can't access admin data
- [ ] Test with admin user - verify can access all data
- [ ] Test user A can't delete user B's content
- [ ] Test user A can't view user B's pending photos

**Success Criteria**: ✅ All RLS policies enforce proper data isolation

---

### CR-06: Storage Bucket Policies 🟠

- [ ] Review gallery bucket RLS policies in Supabase dashboard
- [ ] Verify users can only upload to `user-uploads/{user_id}/` paths
- [ ] Test user A can't delete user B's photos from storage
- [ ] Test anonymous users can't upload photos
- [ ] Verify signed URL generation requires authentication
- [ ] Test signed URLs expire after 3600 seconds
- [ ] Verify old signed URLs become invalid
- [ ] Test file size limits work (if configured)
- [ ] Test file type restrictions work (images only)
- [ ] Review if 1-hour expiry is appropriate for your use case

**Success Criteria**: ✅ Storage bucket enforces user isolation, signed URLs work correctly

---

### CR-07: Error Boundaries 🟠

- [ ] Apply PATCH-CR-07-error-boundaries.patch
- [ ] Wrap Gallery page in ErrorBoundary
- [ ] Wrap Admin Dashboard in ErrorBoundary
- [ ] Wrap Vignettes page in ErrorBoundary
- [ ] Test error boundary catches photo loading failure
- [ ] Test error boundary catches database query failure
- [ ] Test error boundary shows user-friendly message
- [ ] Test error boundary provides "Try Again" button
- [ ] Verify error boundaries log to console in development
- [ ] Verify error boundaries don't expose sensitive data
- [ ] Test nested error boundaries work correctly
- [ ] Verify error boundaries don't prevent other components from rendering

**Success Criteria**: ✅ Error boundaries prevent white screens, provide recovery

---

## Phase 3: Code Quality (Week 2)

### CR-03: Remove `any` Types 🟠

- [ ] Apply PATCH-CR-03-type-safety.patch
- [ ] Create proper `Post` interface for guestbook posts
- [ ] Create `ErrorWithMessage` type for error handling
- [ ] Create `UserProgress` interface for hunt management
- [ ] Fix error handling in AuthModal.tsx (4 locations)
- [ ] Fix error handling in use-hunt.ts (2 locations)
- [ ] Fix sort function in HuntManagement.tsx
- [ ] Fix posts state type in Discussion.tsx
- [ ] Fix displayVignettes type in Vignettes.tsx
- [ ] Replace RPC `as any` casts with proper types
- [ ] Update photo update handlers to use specific types
- [ ] Add proper typing to callback functions
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Verify zero `any` types remain (except unavoidable)

**Success Criteria**: ✅ <5 `any` types in entire codebase, all documented

---

### CR-04: Remove Console Logs 🟠

- [ ] Apply PATCH-CR-04-logger-utility.patch
- [ ] Create src/lib/logger.ts utility
- [ ] Replace console.log with logger.debug in auth.tsx (24 locations)
- [ ] Replace console.log in AuthCallback.tsx
- [ ] Replace console.log in AdminContext.tsx
- [ ] Replace console.error with logger.error across codebase
- [ ] Replace console.warn with logger.warn
- [ ] Keep structured logging in edge functions (production-safe)
- [ ] Verify logger only outputs in development mode
- [ ] Test logger.error sends to telemetry (if configured)
- [ ] Search codebase: `git grep "console\\.log"` (should be empty)
- [ ] Search codebase: `git grep "console\\.error"` (should be minimal)
- [ ] Verify no sensitive data logged

**Success Criteria**: ✅ Zero console.log statements, logger utility in use

---

### CR-08: TypeScript Strict Mode 🟡

- [ ] Apply PATCH-CR-08-typescript-strict.patch
- [ ] Enable `strictNullChecks: true`
- [ ] Fix null/undefined errors in affected files
- [ ] Enable `noImplicitAny: true`
- [ ] Add explicit types to functions without return types
- [ ] Enable `noUnusedLocals: true`
- [ ] Remove or use unused variables
- [ ] Enable `noUnusedParameters: true`
- [ ] Add underscore prefix to unused parameters
- [ ] Run `npm run type-check` - verify zero errors
- [ ] Test application still works with strict mode
- [ ] Update CI/CD to fail on TypeScript errors

**Success Criteria**: ✅ TypeScript strict mode enabled, zero compilation errors

---

## Phase 4: Performance (Week 2-3)

### CR-11: Image Optimization 🟡

- [ ] Apply PATCH-CR-11-image-optimization.patch
- [ ] Add width/height to all images in ImageCarousel
- [ ] Add loading="lazy" to gallery images
- [ ] Add loading="eager" to hero/above-fold images
- [ ] Test images don't cause layout shift (CLS)
- [ ] Add error handling to all image components
- [ ] Use placeholder image on load failure
- [ ] Test lazy loading works on mobile
- [ ] Verify images load progressively
- [ ] Run Lighthouse audit - verify improved CLS
- [ ] Consider adding responsive srcset (optional)

**Success Criteria**: ✅ Lighthouse CLS < 0.1, all images have dimensions

---

### CR-12: Bundle Size Optimization 🟡

- [ ] Apply PATCH-CR-12-bundle-optimization.patch
- [ ] Separate three.js/vanta into separate chunk
- [ ] Verify lazy loading of admin dashboard
- [ ] Verify lazy loading of 3D background components
- [ ] Run `npm run build` - check chunk sizes
- [ ] Main chunk should be < 200KB
- [ ] Verify code splitting works in production
- [ ] Test lazy-loaded routes load correctly
- [ ] Run Lighthouse audit - verify improved score
- [ ] Use `npx vite-bundle-visualizer` to analyze

**Success Criteria**: ✅ Main bundle < 200KB, vendor chunks properly split

---

### CR-13: Loading States 🟡

- [ ] Apply PATCH-CR-13-loading-states.patch
- [ ] Add loading state to Gallery photo fetch
- [ ] Create skeleton loader component
- [ ] Add loading state to Admin dashboard queries
- [ ] Add loading state to Vignette management
- [ ] Add loading indicator to form submissions
- [ ] Test loading states appear on slow connections
- [ ] Verify loading states don't flash on fast connections
- [ ] Add optimistic updates to mutations (optional)
- [ ] Test loading states with React DevTools

**Success Criteria**: ✅ All async operations show loading feedback

---

## Phase 5: User Experience (Week 3)

### CR-09: Error Handling Standardization 🟡

- [ ] Apply PATCH-CR-09-error-handling.patch
- [ ] Create standardized error handler utility
- [ ] Standardize toast error messages
- [ ] Add retry mechanism for failed requests
- [ ] Test error recovery flows
- [ ] Verify all errors show user-friendly messages
- [ ] Test network failure scenarios
- [ ] Test authentication errors
- [ ] Test validation errors
- [ ] Verify no silent failures

**Success Criteria**: ✅ Consistent error UX across application

---

### CR-10: Accessibility Improvements 🟡

- [ ] Apply PATCH-CR-10-accessibility.patch
- [ ] Add aria-label to icon-only buttons
- [ ] Add proper form labels (not just placeholders)
- [ ] Test skip links work (already exists)
- [ ] Add landmark roles to major sections
- [ ] Test keyboard navigation through forms
- [ ] Test focus management in modals
- [ ] Verify focus trap in modal dialogs
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Run aXe DevTools accessibility audit
- [ ] Fix color contrast issues (if any)
- [ ] Test keyboard-only navigation
- [ ] Verify tab order makes sense

**Success Criteria**: ✅ WCAG AA compliance, zero critical aXe violations

---

## Phase 6: Supabase Best Practices (Week 3)

### CR-14: Supabase Linter Fixes 🟡

- [ ] Add `SET search_path = public` to all database functions
- [ ] Update has_role function
- [ ] Update is_admin function
- [ ] Update check_admin_status function
- [ ] Update all RPC functions with security definer
- [ ] Configure OTP expiry in Supabase Auth settings
- [ ] Reduce OTP lifetime to < 24 hours
- [ ] Enable leaked password protection in Auth settings
- [ ] Run `npx supabase db lint` - verify zero warnings
- [ ] Test functions still work after search_path addition
- [ ] Test OTP with shorter expiry

**Success Criteria**: ✅ Zero Supabase linter warnings

---

## Phase 7: Documentation & Testing (Week 4)

### CR-15: Documentation 🟢

- [ ] Update README.md with project overview
- [ ] Document environment variables in .env.example
- [ ] Add setup instructions for new developers
- [ ] Document database schema in docs/
- [ ] Document API endpoints (RPC functions)
- [ ] Document edge functions usage
- [ ] Add deployment guide
- [ ] Create CONTRIBUTING.md
- [ ] Add JSDoc comments to complex functions
- [ ] Document component props with TypeScript
- [ ] Create architecture diagram
- [ ] Document authentication flow

**Success Criteria**: ✅ New developer can set up project in < 30 minutes

---

### CR-16: Testing Infrastructure 🟢

- [ ] Install Vitest: `npm install -D vitest @testing-library/react`
- [ ] Create vitest.config.ts
- [ ] Set up test environment
- [ ] Create __tests__ directory structure
- [ ] Write auth flow tests
- [ ] Write RSVP submission tests
- [ ] Write gallery upload tests
- [ ] Write admin access control tests
- [ ] Test RLS policies (supabase/tests/*.sql already exist)
- [ ] Run tests: `npm test`
- [ ] Add test coverage reporting
- [ ] Aim for >70% coverage on critical paths

**Success Criteria**: ✅ Critical paths have test coverage

---

### CR-17: Code Formatting 🟢

- [ ] Install Prettier: `npm install -D prettier`
- [ ] Create .prettierrc configuration
- [ ] Run Prettier on all files: `npx prettier --write .`
- [ ] Set up pre-commit hook (optional)
- [ ] Configure ESLint to work with Prettier
- [ ] Fix any ESLint errors
- [ ] Ensure consistent indentation (2 spaces)
- [ ] Ensure consistent quote style (single quotes)
- [ ] Configure editor to format on save

**Success Criteria**: ✅ Consistent code style across project

---

### CR-18: Development Utilities 🟢

- [ ] Logger utility already created (CR-04)
- [ ] Add development mode toggle (already exists)
- [ ] Create database seed script (optional)
- [ ] Create mock data generators (optional)
- [ ] Add performance monitoring utilities (optional)
- [ ] Create debugging utilities (optional)

**Success Criteria**: ✅ Developer experience improved

---

## Final Verification

### Build & Deploy
- [ ] `npm run build` - succeeds without errors
- [ ] `npm run type-check` - zero TypeScript errors
- [ ] `npm run lint` - zero ESLint errors
- [ ] Deploy to staging environment
- [ ] Test all critical paths in staging
- [ ] Run smoke tests
- [ ] Deploy to production

### Security Verification
- [ ] Run security audit: `npm audit`
- [ ] Fix high/critical vulnerabilities
- [ ] Run Supabase linter: `npx supabase db lint`
- [ ] Test RLS policies with different user roles
- [ ] Verify no secrets in codebase: `git secrets --scan`
- [ ] Test storage bucket permissions
- [ ] Verify edge function authentication

### Performance Verification
- [ ] Run Lighthouse audit on production
- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 95
- [ ] SEO score > 90
- [ ] Verify Core Web Vitals pass
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### User Acceptance
- [ ] Test all user flows end-to-end
- [ ] RSVP submission and confirmation
- [ ] Photo upload and approval
- [ ] Gallery browsing
- [ ] Guestbook posting
- [ ] Hunt participation
- [ ] Admin dashboard management
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify all error states work
- [ ] Verify all loading states work

---

## Rollback Plan

If issues arise after deployment:

### Immediate Rollback
- [ ] Revert to previous Git commit: `git revert <commit>`
- [ ] Redeploy previous version
- [ ] Notify users of temporary rollback

### Partial Rollback
- [ ] Identify problematic patch
- [ ] Revert specific patch only
- [ ] Test isolated change
- [ ] Redeploy

### Database Rollback
- [ ] Restore database from backup (if schema changes)
- [ ] Run rollback migration (if provided)
- [ ] Verify data integrity
- [ ] Test application

---

## Sign-off

**Developer**: _________________ Date: _______  
**QA/Tester**: _________________ Date: _______  
**Security Review**: ____________ Date: _______  
**Product Owner**: ______________ Date: _______  

---

## Notes

Use this space for additional notes, issues encountered, or deviations from the plan:

```
[Add notes here]
```
