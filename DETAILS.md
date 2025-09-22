### F-01 Hardcoded Supabase URL and anon key in client
- Context: A generated client hardcodes project URL and anon key in the repo. Secrets should be provided via env at build time; rotating keys becomes difficult and forks leak credentials.
- Evidence:
```5:17:src/integrations/supabase/client.ts
const SUPABASE_URL = "https://hsyyculqmeslhwiznjwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "<anon-key>";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true } })
```
- Fix:
  - Replace constants with `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Add `.env.example` and README notes.
  - Enforce using the unified client export.
- Regression tests:
  - Unit: mock `import.meta.env` and assert client initializes; no literals present.
- Rollback: revert file and remove .env usage.

### F-02 Admin dashboard queries rely on RLS but select *
- Context: The admin dashboard selects all columns from `tournament_registrations` and `photos`. RLS permits admin, but selecting `*` risks future sensitive fields.
- Evidence:
```60:67:src/pages/AdminDashboard.tsx
const { data, error } = await supabase.from('photos').select('*')
```
```77:84:src/lib/tournament-api.ts
const { data, error } = await supabase.from('tournament_registrations').select('*')
```
- Fix:
  - Restrict to explicit columns or create secure views (e.g., `tournament_registrations_public`) and admin RPCs.
  - Keep RPCs `moderate_photo`, `register_team` for mutations.
- Tests: RTL smoke: non-admin cannot see sensitive fields even if UI attempts; Policy SQL test selecting `contact_info` denied for non-admin.
- Rollback: revert selects.

### F-03 Broad public-read policies in early migrations
- Context: Early policies allow public read on `photo_reactions`, `tournament_*`. Later migrations refine. Ensure deny-by-default and limited views.
- Evidence:
```327:334:supabase/migrations/20250911230155_f08cc...sql
CREATE POLICY "photo_reactions_public_read" ... USING (true);
```
- Fix:
  - Confirm latest migration supersedes; if not, add follow-up migration to scope or convert to view-based public lists.
  - Add SQL tests.
- Tests: psql policy checks for anonymous vs authenticated.
- Rollback: drop new policies.

### F-04 Images missing width/height
- Context: Several `<img>` lack explicit dimensions, risking CLS.
- Evidence:
```76:81:src/components/Carousel.tsx
<img src={item.image} alt={item.title} className="w-full h-full object-cover" />
```
- Fix: Add width/height attributes consistent with container aspect, or use `style={{aspectRatio:'3/4'}}` with `width`/`height` placeholders.
- Tests: Lighthouse CLS check; visual regression minimal.
- Rollback: revert attrs.

### F-05 Gallery uploads not partitioned by user
- Context: Upload path `user-uploads/<random>` does not include user prefix. Policies in storage assume owner folder or admin.
- Evidence:
```86:93:src/pages/Gallery.tsx
const filePath = `user-uploads/${Date.now()}-${...}.${ext}`;
```
- Fix: Prefix with `auth.uid()`; enforce RLS policies already reference `storage.foldername(name)[1] = auth.uid()`.
- Tests: Upload denied if wrong prefix; allowed when correct.
- Rollback: revert path.

### F-06 Inconsistent Supabase client usage
- Context: Two clients: `@/integrations/supabase/client` and `@/lib/supabase`. Risk of divergence and config drift.
- Evidence:
```1:src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseKey);
```
- Fix: Re-export the generated client from `src/lib/supabase.ts` and deprecate env-based init or vice-versa; ensure single import path (`@/lib/supabase`).
- Tests: Type check only one client exported.
- Rollback: revert re-export.

### F-07 Missing .env.example
- Context: No project-wide template of required envs.
- Evidence: No `.env.example` file.
- Fix: Add `.env.example` listing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional flags.
- Tests: CI step to verify example completeness by grepping `import.meta.env` keys.
- Rollback: remove file.

### F-08 Missing tests for auth-gated route and RLS RPC
- Context: No Vitest/RTL coverage verifying `RequireAdmin` blocks non-admin and that `submit_rsvp` behaves under RLS.
- Fix: Add tests using `@testing-library/react` and a SQL harness (psql or supabase/test) with mock anon/session.
- Rollback: remove tests.

### F-09 Bundle risk from heavy deps
- Context: three.js and framer present; ensure they are lazily imported and vendor-split.
- Fix: Lazy import 3D components; confirm vite manualChunks; add size budget docs.

### F-10 ErrorBoundary lacks telemetry
- Context: Only console.error; add optional hook to post to Edge Function without PII.
- Fix: Add `onError` prop or integration module that posts sanitized errors.
