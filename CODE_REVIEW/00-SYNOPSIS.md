# PROJECT STRUCTURE & SECURITY POSTURE - 20-LINE SYNOPSIS

**Project**: Twisted Hearth Foundation (Halloween Party Event Site)
**Stack**: React 18.3.1 + Vite 5.4 + TypeScript 5.8 + Tailwind 3.4 + Supabase 2.58
**Version**: 1.1.7 | **Branch**: prod-2025.partytillyou.rip

## Architecture
- **Structure**: `/src` with `pages/` (16 pages), `components/` (80+ UI/admin), `lib/` (API services), `integrations/supabase/`, `contexts/` (5 providers)
- **Routing**: React Router v6 with lazy loading ALL non-critical routes (good), Suspense + ErrorBoundary wrapping
- **State**: React Query for server state (92 usages), Context API for auth/admin/audio/analytics, localStorage for session persistence
- **Code Splitting**: Lazy imports present for 13/16 pages; Index eagerly loaded (correct); no manual chunk splitting in Vite config

## Supabase Security
- **RLS**: ✅ Enabled on ALL 30+ tables | ❌ 8+ policies use `USING (true)` for SELECT (profiles, reactions, guestbook, tournaments)
- **Auth**: ✅ Anon key client-side only | ❌ Service role used in 4 Edge Functions WITHOUT proper auth checks
- **JWT Verification**: ❌ DISABLED on 4 critical Edge Functions (send-rsvp-confirmation, daily-analytics, send-email-campaign, send-support-report)
- **Analytics Poisoning**: ❌ user_sessions, page_views, content_interactions allow `INSERT WITH CHECK (true)` — any user can forge analytics data
- **Storage**: ✅ Gallery bucket properly scoped with user_id prefix | ❌ support-screenshots bucket allows unauthenticated uploads

## TypeScript Configuration
- **Strictness**: ❌ ALL strict checks DISABLED (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`)
- **ESLint**: ❌ `@typescript-eslint/no-unused-vars: "off"` — dead code accumulation risk

## Performance & Bundle
- **Vite Config**: ✅ SWC plugin, ✅ hash-based asset names | ❌ No vendor chunk splitting | ⚠️ `chunkSizeWarningLimit: 1000` raised (masking bloat)
- **Tailwind**: ✅ Purge configured for `src/**/*.{ts,tsx}` | ❌ No bundle size measurement in package.json scripts
- **Images**: ⚠️ 11 `loading="lazy"` usages found (partial coverage) | ❌ No srcset/responsive images | ❌ No next-gen formats (WebP/AVIF)

## Accessibility
- **ARIA**: ✅ 542 aria-/role/tabIndex usages across 90 files (shadcn/ui components have good a11y baseline)
- **Skip Links**: ✅ Present in App.tsx | **Keyboard Nav**: ✅ Radix UI primitives handle focus management

## Testing & Observability
- **Tests**: ❌ ZERO test files (0 .test.ts/.spec.ts files) | ❌ No Vitest config | ❌ No CI test step
- **Error Telemetry**: ✅ ErrorBoundary component present | ✅ console-capture.ts for logging | ❌ No structured error reporting to backend
- **Logging**: ✅ Custom logger.ts with dev/prod modes | ⚠️ Over-logging in production (auth flows log PII)

## Environment & Secrets
- **Env Hygiene**: ✅ `.env.example` matches `.env` keys | ❌ `.env` committed with placeholder values (anon key exposed in example is fine)
- **CI/CD**: ❌ No visible GitHub Actions workflows | ⚠️ `build:prod` script compresses assets but no smoke tests

## Production Readiness
🔴 **CRITICAL BLOCKERS**: Analytics data poisoning, Edge function auth bypass, overbroad RLS SELECT policies
🟡 **HIGH PRIORITY**: Zero TypeScript strictness, no tests, missing JWT verification, no bundle size monitoring
🟢 **GOOD PRACTICES**: Lazy loading, React Query, error boundaries, structured contexts, accessibility baseline
