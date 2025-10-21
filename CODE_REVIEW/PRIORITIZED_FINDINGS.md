# PRIORITIZED FINDINGS

| ID | Title | Severity | Likelihood | Area | Evidence | Fix Summary | Effort |
|----|-------|----------|------------|------|----------|-------------|--------|
| 01 | Analytics data poisoning via unrestricted INSERT policies | Critical | Critical | Supabase/RLS | `supabase/migrations/20251012200000_create_analytics_tables.sql:114,118,126,130,138,146` | Replace `WITH CHECK (true)` with auth.uid() validation; add stored procedure to validate session ownership | M |
| 02 | Edge Functions bypass JWT verification | Critical | High | Supabase/Auth | `supabase/config.toml:1-14` | Set `verify_jwt = true` for send-rsvp-confirmation, send-email-campaign, daily-analytics, send-support-report | S |
| 03 | Service role key used without authorization checks | Critical | High | Supabase/Functions | `supabase/functions/send-email-campaign/index.ts:27-29` | Add admin role verification before executing campaign; validate campaign ownership | M |
| 04 | Overbroad SELECT policies expose user data (profiles, reactions, guestbook) | High | High | Supabase/RLS | `supabase/migrations/20251002173410_677f680a-22b8-430e-8d7f-2076b15be17e.sql:526,590,601,640` | Replace `USING (true)` with scoped policies; keep public only where justified (e.g., guestbook); restrict profile reads to self+admin | L-M |
| 05 | Support reports allow unauthenticated spam + public screenshot uploads | High | High | Supabase/Storage | `supabase/migrations/20251014171248_0c835c20-0b61-4f62-95af-742ef76140e2.sql:20,46-48` | Require authentication for support_reports INSERT; restrict screenshot bucket to authenticated+admin reads | S |
| 06 | CORS allows requests from any origin (*) | High | Medium | Supabase/Functions | Multiple files (send-contribution-confirmation, send-email-campaign, etc.) | Restrict `Access-Control-Allow-Origin` to `https://twisted-tale.lovable.app,https://partytillyou.rip` | S |
| 07 | TypeScript strict mode entirely disabled | High | Medium | Type Safety | `tsconfig.json:9,10,11,14`, `tsconfig.app.json:18-22` | Enable `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`; fix resulting errors incrementally | L |
| 08 | ESLint disables unused variable detection | Medium | Medium | Code Quality | `eslint.config.js:23` | Remove `"@typescript-eslint/no-unused-vars": "off"` to prevent dead code accumulation | S |
| 09 | Zero test coverage (no Vitest, no integration tests) | High | Low | Testing | N/A (no test files found) | Add Vitest config; write smoke tests for auth flow + RLS-dependent queries; add CI step | L |
| 10 | Missing JWT validation in send-notification-email function | Medium | High | Supabase/Functions | `supabase/functions/send-notification-email/index.ts:37-45` | Verify caller's auth.uid() matches requested user_id before sending notification | S |
| 11 | send-friend-invitation lacks input validation | Medium | High | Supabase/Functions | `supabase/functions/send-friend-invitation/index.ts:19` | Add Zod schema for personalMessage length + eventUrl format | S |
| 12 | daily-analytics-aggregation does not validate date parameter | Medium | Medium | Supabase/Functions | `supabase/functions/daily-analytics-aggregation/index.ts:22-23` | Add date format validation + range check (e.g., not future dates) | S |
| 13 | No vendor chunk splitting in Vite config | Medium | Low | Performance | `vite.config.ts:47-60` | Add `manualChunks` to split vendor libs (react, react-dom, @radix-ui); measure bundle before/after | M |
| 14 | Chunk size warning limit artificially raised to 1MB | Medium | Low | Performance | `vite.config.ts:59` | Remove override; address warnings properly by code-splitting or tree-shaking | S |
| 15 | Images missing srcset/responsive variants | Medium | Medium | Performance | `src/pages/Index.tsx`, `src/components/gallery/*.tsx` | Implement responsive image strategy with Supabase Storage transformations or CDN | M |
| 16 | Placeholder .env values committed to repo (.env should be gitignored) | Medium | Low | Secrets | `.env:1-13` | Add `.env` to `.gitignore`; document setup in README; verify no secrets in git history | S |
| 17 | PII logged in auth flows (email addresses in console) | Medium | Medium | Privacy/Logging | `src/lib/auth.tsx:135,149,228,245` | Remove email from debug logs; use hashed user IDs or redacted values | S |
| 18 | ErrorBoundary lacks telemetry/reporting | Low | Low | Observability | `src/components/ErrorBoundary.tsx` | Add error reporting to Supabase table or external service (Sentry); include stack trace + user context | M |
| 19 | No bundle size budgets or measurement | Medium | Low | Performance | `package.json` | Add `vite-bundle-visualizer` to analyze bundle; set size budgets in `vite.config.ts` | S |
| 20 | Missing rate limiting on public endpoints | High | Medium | Supabase/Functions | `supabase/functions/send-support-report/index.ts` | Implement rate limiting per IP/user_id (10 req/hr); return 429 on exceed | M |
| 21 | No Lighthouse/Web Vitals measurement in CI | Low | Low | Performance | N/A | Add Lighthouse CI step; set LCP < 2.5s, CLS < 0.1, INP < 200ms targets | M |
| 22 | tournament_registrations, tournament_teams, tournament_matches expose all data | High | High | Supabase/RLS | `supabase/migrations/20250912181928_33e987cf-a3de-4113-92d3-29d15f7c603a.sql`, `20250923145200_rls_hardening.sql` | Scope SELECT policies to tournament participants or make read-only for public display | S-M |
| 23 | email_campaigns table allows system inserts without validation | High | Medium | Supabase/RLS | `supabase/migrations/20251011233845_6b9ff18a-b734-4032-a914-221ea40d5ab1.sql` | Restrict campaign_recipients INSERT/UPDATE to admin role only | S |
| 24 | Dev mode auth bypasses production check (hostname check spoofable) | Low | Low | Security | `src/lib/auth.tsx:194-225` | Add additional check for `import.meta.env.PROD` and remove in production builds | S |

**SEVERITY DEFINITIONS**:
- **Critical**: Severe business disruption, data exposure, legal risk (e.g., user data leak, admin privilege escalation)
- **High**: Notable disruption, data integrity risk (e.g., missing auth checks, type safety gaps)
- **Medium**: Moderate quality/performance degradation (e.g., bundle bloat, missing tests)
- **Low**: Minor polish, observability gaps (e.g., logging improvements, telemetry)

**LIKELIHOOD DEFINITIONS**:
- **Critical**: Widely exploitable, actively abusable (e.g., anyone can poison analytics, no auth required)
- **High**: Public exploit patterns, low skill barrier (e.g., CORS bypass, missing JWT)
- **Medium**: Requires specific conditions or expertise (e.g., timing attacks, config misuse)
- **Low**: Theoretical or complex multi-step exploits

**TOTAL FINDINGS**: 24
**Critical**: 3 | **High**: 8 | **Medium**: 11 | **Low**: 2
**Effort Estimate**: S=Short (< 4hrs), M=Medium (1-2 days), L=Long (3+ days)
