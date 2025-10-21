# CODE REVIEW ACTION CHECKLIST

## 🔐 SECURITY (CRITICAL - Address First)

### Supabase RLS & Auth
- [ ] **#01** - Apply analytics RLS patch to prevent data poisoning (`PATCHES/01-critical-rls-fix-analytics-data-poisoning.patch`)
- [ ] **#02** - Enable JWT verification on all Edge Functions (`PATCHES/02-critical-auth-enable-jwt-verification.patch`)
- [ ] **#03** - Add admin role check to send-email-campaign function (`PATCHES/03-critical-functions-add-admin-auth-check.patch`)
- [ ] **#04** - Scope profile SELECT policies to self+admin (`PATCHES/04-high-rls-scope-profile-reads.patch`)
- [ ] **#05** - Require authentication for support_reports table and support-screenshots bucket
- [ ] **#22** - Scope tournament table SELECT policies to participants only
- [ ] **#23** - Restrict email campaign recipient INSERT/UPDATE to admin role only

### Edge Functions Security
- [ ] **#06** - Restrict CORS to production domains (partytillyou.rip, twisted-tale.lovable.app)
- [ ] **#10** - Add JWT user validation in send-notification-email function
- [ ] **#11** - Add Zod input validation to send-friend-invitation function
- [ ] **#12** - Add date validation to daily-analytics-aggregation function
- [ ] **#20** - Implement rate limiting on support-report and email endpoints (10 req/hr per user)

### Environment & Secrets
- [ ] **#16** - Add `.env` to `.gitignore` and remove from git history
- [ ] **#16** - Verify no service role keys or API secrets committed to git history
- [ ] **#24** - Remove dev mode authentication in production builds (add `import.meta.env.PROD` check)

---

## ⚡ PERFORMANCE

### Bundle Optimization
- [ ] **#13** - Implement vendor chunk splitting in Vite config (`PATCHES/13-medium-performance-vendor-chunk-splitting.patch`)
- [ ] **#14** - Remove `chunkSizeWarningLimit: 1000` override; address warnings properly
- [ ] **#19** - Install `vite-bundle-visualizer` and analyze current bundle size
- [ ] **#19** - Set bundle size budgets in `vite.config.ts` (main < 200KB, vendor < 400KB, total < 1MB)

### Image & Asset Strategy
- [ ] **#15** - Implement responsive images with Supabase Storage transformations (width params)
- [ ] **#15** - Add `loading="lazy"` to all below-the-fold images
- [ ] **#15** - Convert hero images to WebP/AVIF formats

### Measurement & Monitoring
- [ ] **#21** - Add Lighthouse CI GitHub Action to run on PRs
- [ ] **#21** - Set Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Run `npm run build` and measure baseline bundle size (document in METRICS_BEFORE_AFTER.md)

---

## ♿ ACCESSIBILITY

### Keyboard & Screen Reader
- [ ] Manual test: Verify all interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Manual test: Test with screen reader (VoiceOver/NVDA) on 3 key pages (Index, RSVP, Gallery)
- [ ] Verify skip link works (focus jumps to main content on Enter)

### Color & Motion
- [ ] Verify color contrast meets WCAG AA (use Lighthouse accessibility score)
- [ ] Test `prefers-reduced-motion` is respected in animations (Framer Motion animations)

---

## 🧪 TESTING & OBSERVABILITY

### Test Infrastructure
- [ ] **#09** - Install Vitest and testing dependencies (`npm install -D vitest @vitest/ui @testing-library/react`)
- [ ] **#09** - Create `vitest.config.ts` and test setup file
- [ ] **#09** - Add `"test": "vitest"` script to package.json

### Critical Tests (Minimum)
- [ ] **#09** - Write auth flow test (sign in with OTP, sign out)
- [ ] **#09** - Write RLS policy test (verify users cannot read other users' profiles)
- [ ] **#09** - Write RLS policy test (verify users cannot insert analytics for other users)
- [ ] **#09** - Write integration test for RSVP submission
- [ ] Add GitHub Actions workflow to run `npm test` on PRs

### Error Reporting
- [ ] **#18** - Add error telemetry to ErrorBoundary component (log to Supabase `error_logs` table)
- [ ] **#17** - Remove PII from auth debug logs (email addresses, user_metadata)
- [ ] Verify console-capture is enabled in production and logs are accessible in admin dashboard

---

## 🛠️ CODE QUALITY & DX

### TypeScript Strictness
- [ ] **#07** - Enable strict mode in tsconfig.json and tsconfig.app.json (`PATCHES/07-high-typescript-enable-strict-mode.patch`)
- [ ] **#07** - Fix all TypeScript errors resulting from strict mode (prioritize auth, API, data layers)
- [ ] **#07** - Remove `// @ts-ignore` comments (or document why they're necessary)

### Linting
- [ ] **#08** - Enable `@typescript-eslint/no-unused-vars` ESLint rule
- [ ] **#08** - Run `npm run lint -- --fix` to remove unused imports
- [ ] Add `npm run lint` check to GitHub Actions CI

### Documentation
- [ ] Update README with setup instructions (`.env` configuration)
- [ ] Document RLS policy design decisions (why guestbook is public, etc.)
- [ ] Add JSDoc comments to all public API functions

---

## 📊 MEASUREMENT (Pre/Post)

Before applying fixes:
- [ ] Run `npm run build` and record bundle sizes
- [ ] Run Lighthouse on Index, RSVP, and Gallery pages
- [ ] Record Web Vitals (LCP, CLS, INP) using Chrome DevTools
- [ ] Count total findings from ESLint (`npm run lint`)

After applying fixes:
- [ ] Re-run all measurements
- [ ] Document improvements in METRICS_BEFORE_AFTER.md
- [ ] Verify no regressions in functionality

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:
- [ ] All CRITICAL security findings (#01-#06) are resolved
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] TypeScript build succeeds (`npm run build`)
- [ ] Manual smoke test of auth flow, RSVP, photo upload
- [ ] Verify RLS policies work as expected (test as non-admin user)
- [ ] Review Edge Function logs for errors post-deploy

---

## 📝 NOTES

**Priority Order**:
1. **Week 1**: Security (Findings #01-#06) - BLOCKING for production
2. **Week 2**: Testing + TypeScript strictness (Findings #07-#09)
3. **Week 3**: Performance optimization (Findings #13-#15, #19-#21)
4. **Week 4**: Remaining medium/low priority items

**Estimated Total Effort**:
- Critical (3 findings): ~3-4 days
- High (8 findings): ~5-6 days
- Medium (11 findings): ~7-10 days
- Low (2 findings): ~1 day
- **Total**: ~3-4 weeks with 1 full-time developer

**Risk Areas**:
- Enabling strict TypeScript may reveal 100+ errors; budget extra time
- RLS policy changes may break existing UI; thorough testing required
- Bundle optimization requires careful measurement to verify improvements
