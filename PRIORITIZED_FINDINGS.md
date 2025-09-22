### Project synopsis
- React + Vite + Tailwind + shadcn/ui; React Router v6; TanStack Query; Framer Motion; Three.js present; Supabase client v2; Edge Function for RSVP email; Service Worker auto-registered except on /auth.
- Supabase schema includes user-scoped tables (rsvps, photos, hunt_*), guestbook, tournament_*; RLS broadly enabled with owner-or-admin checks via public.is_admin(); storage bucket `gallery` with explicit policies.
- Auth handled client-side via supabase-js; admin checks via RPC is_admin/check_admin_status; lazy routes for non-critical pages; global ErrorBoundary and Suspense present; images largely lazy but missing width/height in some places.
- Environment: a generated client hardcodes URL and anon key; also a wrapper reads from import.meta.env; .env.example missing; no exposure of service-role key detected.
- Build: vite config exists (protected); manualChunks unknown; production script compresses assets; Lighthouse artifacts present; SW registered with version param.

### Prioritized findings
| ID | Title | Severity | Likelihood | Area | Evidence (file:line) | Fix Summary | Effort |
|---|---|---|---|---|---|---|---|
| F-01 | Hardcoded Supabase URL and anon key in client | High | High | Supabase/Auth | `src/integrations/supabase/client.ts`:5-12 | Replace with `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; add `.env.example`; centralize client import | S |
| F-02 | Admin dashboard queries rely on RLS but select `*` from sensitive tables | High | Medium | Data/RLS | `src/pages/AdminDashboard.tsx`:60-67, `src/lib/tournament-api.ts`:77-84 | Restrict selects to columns; prefer RPCs with server-side checks or views; ensure policies cover sensitive fields | M |
| F-03 | Public read policies too broad in early migrations | High | Medium | RLS | `supabase/migrations/20250911230155_f08cc...sql`:327-334, 364-372, 404-472 | Confirm latest migrations supersede; add explicit deny-by-default and limited views; add policy tests | M |
| F-04 | Images missing explicit width/height in multiple components (risk CLS) | Medium | High | Performance/UX | `src/components/Carousel.tsx`:76-81; `src/components/ImageCarousel.tsx`:69-75; `src/pages/Gallery.tsx`:171-178 | Add width/height and aspect-ratio wrappers; ensure `loading="lazy"` and `decoding="async"` consistently | S |
| F-05 | Gallery uploads not partitioned by user prefix | Medium | Medium | Storage/Security | `src/pages/Gallery.tsx`:86-93 | Write to `user-uploads/${auth.uid()}/...`; rely on storage RLS per user folders | S |
| F-06 | Inconsistent Supabase client usage (two entry points) | Medium | Medium | DX/Maintainability | `src/integrations/supabase/client.ts` vs `src/lib/supabase.ts` | Unify on one client; re-export from `@/integrations/supabase/client` via `@/lib/supabase` | S |
| F-07 | Missing .env.example with required vars | Medium | High | Repo Hygiene | [no file] | Add `.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, other flags | S |
| F-08 | Lack of test coverage for auth-gated route and RLS RPC | Medium | Medium | Testing | [no tests present] | Add Vitest+RTL test for `RequireAdmin` gating and SQL policy test for `submit_rsvp` | M |
| F-09 | Potential oversized bundles from three/framer across app | Low | Medium | Performance/Bundle | `package.json` deps; lazy usage limited | Ensure code-splitting, dynamic imports where used; vendor split in Vite config (protected; propose docs) | M |
| F-10 | ErrorBoundary lacks telemetry | Low | Medium | Observability | `src/components/ErrorBoundary.tsx`:12-14 | Add hook to send errors to console/edge function with no PII | S |
