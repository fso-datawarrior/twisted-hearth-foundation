# DETAILED FINDINGS

---

## FINDING 01: Analytics data poisoning via unrestricted INSERT policies

### Context
The analytics tables (`user_sessions`, `page_views`, `user_activity_logs`, `content_interactions`) allow ANY authenticated user to insert arbitrary data with `WITH CHECK (true)`. This enables data poisoning attacks where malicious users can:
- Create fake sessions for other users
- Forge page view counts
- Manipulate engagement metrics
- Tamper with audit trails

### Evidence
**File**: `supabase/migrations/20251012200000_create_analytics_tables.sql`

```sql
-- Line 114
CREATE POLICY "System can insert user_sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

-- Line 118
CREATE POLICY "System can update user_sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

-- Line 126
CREATE POLICY "System can insert page_views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- Line 138
CREATE POLICY "System can insert user_activity_logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true);

-- Line 146
CREATE POLICY "System can insert content_interactions"
  ON public.content_interactions FOR INSERT
  WITH CHECK (true);
```

### Fix

**Step 1**: Update RLS policies to validate user ownership:

```sql
-- Replace overly permissive policies
DROP POLICY IF EXISTS "System can insert user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can update user_sessions" ON public.user_sessions;

CREATE POLICY "Users can insert own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Repeat for page_views, user_activity_logs, content_interactions
DROP POLICY IF EXISTS "System can insert page_views" ON public.page_views;
CREATE POLICY "Users can insert own page_views"
  ON public.page_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert user_activity_logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert own activity_logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert content_interactions" ON public.content_interactions;
CREATE POLICY "Users can insert own interactions"
  ON public.content_interactions FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**Step 2**: Add server-side validation in client code (`src/hooks/use-session-tracking.ts`, `src/hooks/use-analytics-tracking.ts`):

```typescript
// Before inserting analytics data, verify it matches the current user
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('User must be authenticated for analytics');

// Only insert records for the authenticated user
await supabase.from('user_sessions').insert({
  user_id: user.id, // Always use authenticated user ID
  // ... other fields
});
```

### Regression Tests

**Test**: Verify users cannot forge analytics for other users

```typescript
// tests/analytics-rls.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Analytics RLS Policies', () => {
  it('should prevent user from inserting sessions for other users', async () => {
    const supabase = createClient(url, anonKey);
    await supabase.auth.signInWithPassword({
      email: 'user1@example.com',
      password: 'password'
    });

    const otherUserId = 'different-user-uuid';
    const { error } = await supabase.from('user_sessions').insert({
      user_id: otherUserId, // Try to insert for different user
      session_start: new Date().toISOString()
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain('policy');
  });

  it('should allow user to insert own sessions', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('user_sessions').insert({
      user_id: user.id, // Insert for self
      session_start: new Date().toISOString()
    });

    expect(error).toBeNull();
  });
});
```

### Rollback Plan
If the fix causes legitimate analytics to fail:
1. Monitor error logs for RLS policy violations
2. Identify which analytics flows are failing
3. Temporarily revert the policy: `ALTER POLICY ... ON public.user_sessions USING (true);`
4. Fix the client-side code to pass correct user_id
5. Re-apply the restrictive policy

---

## FINDING 02: Edge Functions bypass JWT verification

### Context
Four critical Edge Functions have `verify_jwt = false` in `supabase/config.toml`, allowing ANY client (including unauthenticated attackers) to invoke them. This bypasses Supabase's built-in authentication layer.

### Evidence
**File**: `supabase/config.toml:1-14`

```toml
[functions.send-rsvp-confirmation]
verify_jwt = false

[functions.send-contribution-confirmation]
verify_jwt = false

[functions.daily-analytics-aggregation]
verify_jwt = false

[functions.send-support-report]
verify_jwt = false
```

### Fix

**Step 1**: Enable JWT verification in config:

```toml
[functions.send-rsvp-confirmation]
verify_jwt = true

[functions.send-contribution-confirmation]
verify_jwt = true

[functions.daily-analytics-aggregation]
verify_jwt = true

[functions.send-support-report]
verify_jwt = true
```

**Step 2**: Update client-side calls to include auth headers (if not already present):

```typescript
// src/lib/analytics-api.ts (example)
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error('User must be authenticated');

const response = await fetch(
  `${SUPABASE_URL}/functions/v1/daily-analytics-aggregation`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`, // Critical!
    },
    body: JSON.stringify({ date: '2025-01-15' })
  }
);
```

**Step 3**: Verify functions extract user from JWT:

```typescript
// supabase/functions/send-rsvp-confirmation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // JWT is now automatically verified by Supabase
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response('Missing auth header', { status: 401 });
  }

  // Extract user from JWT
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!, // Use anon key for user context
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Rest of function logic...
});
```

### Regression Tests

**Test**: SQL-based policy test

```sql
-- tests/rls-policies.test.sql
BEGIN;
SELECT plan(2);

-- Test 1: Verify function requires auth
SELECT throws_ok(
  $$SELECT net.http_post(
    url := 'https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-rsvp-confirmation',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )$$,
  'HTTP 401',
  'Function should reject requests without JWT'
);

-- Test 2: Verify function accepts valid JWT
-- (Requires generating a valid JWT in test setup)

SELECT * FROM finish();
ROLLBACK;
```

### Rollback Plan
If legitimate function calls start failing:
1. Check client logs for "401 Unauthorized" errors
2. Verify all function invocations include `Authorization: Bearer <token>`
3. Temporarily set `verify_jwt = false` for affected function
4. Fix client code to pass JWT
5. Re-enable `verify_jwt = true`

---

## FINDING 03: Service role key used without authorization checks

### Context
`send-email-campaign` function uses the SERVICE_ROLE_KEY (bypassing RLS) but does NOT verify the caller is an admin. Any authenticated user who discovers the endpoint can trigger email campaigns to all recipients.

### Evidence
**File**: `supabase/functions/send-email-campaign/index.ts:27-29`

```typescript
// Line 27
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Line 29: campaign_id comes directly from request body with no auth check!
const { campaign_id } = await req.json();

// Function proceeds to fetch campaign and send emails to ALL recipients
```

### Fix

**Step 1**: Add admin role verification:

```typescript
// supabase/functions/send-email-campaign/index.ts
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://partytillyou.rip,https://twisted-tale.lovable.app',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Step 1: Extract and verify JWT
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // Step 2: Create client with USER context (anon key + JWT)
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response('Invalid token', { status: 401, headers: corsHeaders });
  }

  // Step 3: Verify user is admin
  const { data: isAdmin, error: roleError } = await userClient.rpc('is_admin');
  if (roleError || !isAdmin) {
    return new Response('Forbidden: Admin access required', {
      status: 403,
      headers: corsHeaders
    });
  }

  // Step 4: NOW safe to use service role for sending emails
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { campaign_id } = await req.json();

  // Validate campaign exists and belongs to this user (or any user if admin)
  const { data: campaign, error: campaignError } = await adminClient
    .from('email_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .single();

  if (campaignError || !campaign) {
    return new Response('Campaign not found', { status: 404, headers: corsHeaders });
  }

  // Rest of campaign sending logic...
});
```

### Regression Tests

**Test**: Vitest integration test

```typescript
// tests/email-campaign-security.test.ts
describe('send-email-campaign security', () => {
  it('should reject non-admin users', async () => {
    // Sign in as regular user
    await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password'
    });

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-email-campaign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ campaign_id: 'test-campaign-id' })
      }
    );

    expect(response.status).toBe(403);
  });

  it('should allow admin users', async () => {
    // Sign in as admin
    await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'password'
    });

    // ... test passes for admin
  });
});
```

### Rollback Plan
1. If emails fail to send, check logs for "403 Forbidden" errors
2. Verify admin users have proper role in `user_roles` table
3. Temporarily remove admin check (keep JWT verification)
4. Fix role assignments
5. Re-add admin check

---

## FINDING 04: Overbroad SELECT policies expose user data

### Context
Multiple tables use `USING (true)` for SELECT policies, allowing ANY authenticated user to read ALL rows. Specific concerns:
- **profiles**: Exposes email addresses, display names, avatars for all users
- **guestbook_replies/reactions**: Allows enumeration of all comments
- **photo_reactions**: Reveals who liked which photos
- **tournament_registrations**: Exposes participation data

### Evidence
**File**: `supabase/migrations/20251002173410_677f680a-22b8-430e-8d7f-2076b15be17e.sql`

```sql
-- Line 526
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Line 590
CREATE POLICY "Anyone can view guestbook replies"
  ON public.guestbook_replies FOR SELECT
  TO authenticated
  USING (true);

-- Line 601
CREATE POLICY "Anyone can view reactions"
  ON public.guestbook_reactions FOR SELECT
  TO authenticated
  USING (true);

-- Line 640
CREATE POLICY "Anyone can view photo reactions"
  ON public.photo_reactions FOR SELECT
  TO authenticated
  USING (true);
```

**File**: `supabase/migrations/20250912181928_33e987cf-a3de-4113-92d3-29d15f7c603a.sql`

```sql
CREATE POLICY "tournament_regs_public_read_limited"
  ON public.tournament_registrations
  FOR SELECT
  USING (true);
```

### Fix

**Step 1**: Scope profile reads to self + admin:

```sql
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- For public display name lookups (e.g., in guestbook posts), use an RPC:
CREATE OR REPLACE FUNCTION public.get_display_name(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name FROM public.profiles WHERE id = user_id;
$$;
```

**Step 2**: Keep guestbook/reactions public IF they're meant to be social:

```sql
-- If guestbook is truly public for all attendees, keep the policy but document it:
COMMENT ON POLICY "Anyone can view guestbook replies" ON public.guestbook_replies IS
  'Intentionally public: guestbook is a shared social space for event attendees.';

-- If reactions should be private, scope them:
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.guestbook_reactions;
CREATE POLICY "Users can view own reactions"
  ON public.guestbook_reactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view reactions on own posts"
  ON public.guestbook_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guestbook
      WHERE guestbook.id = guestbook_reactions.guestbook_id
      AND guestbook.user_id = auth.uid()
    )
  );
```

**Step 3**: Scope tournament data to participants:

```sql
DROP POLICY IF EXISTS "tournament_regs_public_read_limited" ON public.tournament_registrations;

CREATE POLICY "Users can view own tournament registrations"
  ON public.tournament_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Tournament participants can view other participants in same tournament"
  ON public.tournament_registrations FOR SELECT
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_registrations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tournament registrations"
  ON public.tournament_registrations FOR SELECT
  USING (public.is_admin());
```

### Regression Tests

```sql
-- Test: Non-admin cannot read other user's profile
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO '11111111-1111-1111-1111-111111111111';

SELECT results_eq(
  $$SELECT id FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222'$$,
  $$VALUES (NULL::UUID)$$,
  'Users should not see other profiles'
);

ROLLBACK;
```

### Rollback Plan
If UI components break (e.g., can't display other users' names in guestbook):
1. Use the `get_display_name(user_id)` RPC instead of direct SELECT
2. Update queries like: `SELECT post, get_display_name(user_id) as name FROM guestbook`
3. If still broken, temporarily re-enable `USING (true)` for affected table
4. Fix client code to use RPCs
5. Re-apply restrictive policy

---

## FINDING 05: Support reports allow unauthenticated spam + public screenshot uploads

### Context
The `support_reports` table and `support-screenshots` storage bucket allow ANYONE (even unauthenticated users) to create reports and upload files. This enables spam, abuse, and potential malware uploads.

### Evidence
**File**: `supabase/migrations/20251014171248_0c835c20-0b61-4f62-95af-742ef76140e2.sql`

```sql
-- Line 20
CREATE POLICY "Anyone can create reports"
  ON public.support_reports FOR INSERT
  WITH CHECK (true);

-- Lines 46-48
CREATE POLICY "Anyone can upload support screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'support-screenshots');

-- Line 56
CREATE POLICY "Anyone can view support screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'support-screenshots');
```

### Fix

**Step 1**: Require authentication for support reports:

```sql
DROP POLICY IF EXISTS "Anyone can create reports" ON public.support_reports;

CREATE POLICY "Authenticated users can create reports"
  ON public.support_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Step 2**: Restrict screenshot bucket:

```sql
DROP POLICY IF EXISTS "Anyone can upload support screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view support screenshots" ON storage.objects;

CREATE POLICY "Authenticated users can upload own screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'support-screenshots' AND
    (storage.foldername(name))[1]::uuid = auth.uid()
  );

CREATE POLICY "Admins can view support screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-screenshots' AND
    public.is_admin()
  );

CREATE POLICY "Users can view own screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-screenshots' AND
    (storage.foldername(name))[1]::uuid = auth.uid()
  );
```

**Step 3**: Update client code to include user_id in folder path:

```typescript
// src/components/SupportReportModal.tsx
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Must be authenticated to submit support report');

const filePath = `${user.id}/${Date.now()}-${file.name}`;
const { data, error } = await supabase.storage
  .from('support-screenshots')
  .upload(filePath, file);
```

### Regression Tests

```typescript
// tests/support-reports.test.ts
it('should reject unauthenticated support report creation', async () => {
  const { error } = await supabase.from('support_reports').insert({
    description: 'Spam report',
    category: 'bug'
  });

  expect(error).toBeDefined();
});

it('should allow authenticated users to create reports', async () => {
  await supabase.auth.signInWithPassword({ email: 'user@example.com', password: 'pass' });

  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('support_reports').insert({
    user_id: user.id,
    description: 'Legitimate report',
    category: 'bug'
  });

  expect(error).toBeNull();
});
```

### Rollback Plan
1. If report submission fails, check for auth errors in console
2. Ensure `SupportReportModal` component gets user from auth context
3. Temporarily allow `TO public` for INSERT policy
4. Fix client code to pass user_id
5. Re-apply authentication requirement

---

## FINDING 06: CORS allows requests from any origin (*)

### Context
All Edge Functions use `Access-Control-Allow-Origin: *`, allowing ANY website to call them from the browser. Combined with missing JWT verification (Finding 02), this is a critical security hole.

### Evidence
Multiple Edge Function files contain:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // TOO PERMISSIVE
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Fix

**Step 1**: Restrict origins to production domains:

```typescript
// supabase/functions/_shared/cors.ts (create shared module)
const ALLOWED_ORIGINS = [
  'https://partytillyou.rip',
  'https://twisted-tale.lovable.app',
  'http://localhost:8080' // For local dev
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}
```

**Step 2**: Update each function to use shared CORS headers:

```typescript
// supabase/functions/send-email-campaign/index.ts
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ... rest of function
});
```

### Regression Tests

```bash
# Manual test: Try calling function from unauthorized origin
curl -X POST https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-email-campaign \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"campaign_id":"test"}'

# Should see CORS error or 403
```

### Rollback Plan
1. If legitimate requests are blocked, check browser console for CORS errors
2. Add missing origin to `ALLOWED_ORIGINS` array
3. If emergency, temporarily set `Access-Control-Allow-Origin: *` for affected function
4. Add missing domain to allowlist
5. Re-apply restrictive CORS

---

## FINDING 07: TypeScript strict mode entirely disabled

### Context
All TypeScript strictness checks are disabled, allowing `any` types, unused variables, null/undefined bugs, and dead code to accumulate. This significantly degrades code quality and maintainability.

### Evidence
**File**: `tsconfig.json:9-14`

```json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

**File**: `tsconfig.app.json:18-22`

```json
{
  "compilerOptions": {
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### Fix

**Step 1**: Enable strict checks incrementally:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Step 2**: Fix resulting errors in batches:
1. Run `npm run build` to see all errors
2. Start with critical files (API layers, auth, Supabase client)
3. Add explicit types, remove unused vars, handle nulls
4. Use `// @ts-expect-error` sparingly for complex shadcn/ui types

**Example fixes**:

```typescript
// Before (implicit any)
function fetchUser(id) {
  return supabase.from('profiles').select().eq('id', id);
}

// After
function fetchUser(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Before (no null check)
const user = await fetchUser('123');
console.log(user.email); // Runtime error if null

// After
const user = await fetchUser('123');
if (user) {
  console.log(user.email);
}
```

### Regression Tests

```bash
# Ensure build passes with strict mode
npm run build

# Ensure linter catches issues
npm run lint

# Add to CI
- name: Type check
  run: npm run build
```

### Rollback Plan
If the strict checks reveal too many errors to fix at once:
1. Enable `strict: true` but add `skipLibCheck: true` to ignore node_modules
2. Fix errors in priority order (auth, payments, data mutations)
3. Use `// @ts-ignore` for low-priority legacy code
4. Set a deadline to remove all `@ts-ignore` comments

---

## FINDING 08: ESLint disables unused variable detection

### Context
The rule `"@typescript-eslint/no-unused-vars": "off"` prevents ESLint from catching dead code, unused imports, and orphaned variables. Over time, this leads to bundle bloat and confusion.

### Evidence
**File**: `eslint.config.js:23`

```javascript
rules: {
  ...reactHooks.configs.recommended.rules,
  "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  "@typescript-eslint/no-unused-vars": "off", // PROBLEM
},
```

### Fix

```javascript
// eslint.config.js
rules: {
  ...reactHooks.configs.recommended.rules,
  "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  "@typescript-eslint/no-unused-vars": ["warn", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }],
},
```

Then run: `npm run lint -- --fix` to auto-remove unused imports.

### Regression Tests

```bash
# Add lint check to CI
npm run lint

# Fail the build if linting fails
- name: Lint
  run: npm run lint
```

### Rollback Plan
N/A - this is a low-risk change. If too many warnings appear, use `"warn"` instead of `"error"`.

---

## FINDING 09: Zero test coverage

### Context
No test files exist (0 `.test.ts` or `.spec.ts` files). No Vitest config. No CI test step. This means:
- Auth flows are untested
- RLS policies are not validated
- Regressions can occur unnoticed
- Refactoring is risky

### Evidence
```bash
$ find . -name "*.test.*" -o -name "*.spec.*"
# No results
```

### Fix

**Step 1**: Install Vitest:

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom happy-dom
```

**Step 2**: Create Vitest config:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3**: Create setup file:

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Set env vars for tests
  import.meta.env.VITE_SUPABASE_URL = 'http://localhost:54321';
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
});
```

**Step 4**: Write critical tests:

```typescript
// tests/auth.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/auth';

describe('Auth flows', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('should handle signInWithOtp', async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.signInWithOtp('test@example.com');
    // Assert OTP sent
  });
});

// tests/rls-policies.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('RLS Policies', () => {
  it('should prevent users from reading other profiles', async () => {
    const supabase = createClient(url, anonKey);
    // Sign in as user1
    await supabase.auth.signInWithPassword({
      email: 'user1@test.com',
      password: 'password'
    });

    // Try to read user2's profile
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', 'user2-uuid')
      .single();

    expect(data).toBeNull();
    expect(error).toBeDefined();
  });
});
```

**Step 5**: Add test scripts:

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Regression Tests
The tests themselves are the regression tests! Focus on:
1. Auth flows (sign in, sign out, session persistence)
2. RLS policies (per Finding 01, 04, 05)
3. Critical user journeys (RSVP submission, photo upload)

### Rollback Plan
N/A - adding tests has no production impact. If tests are flaky, fix the tests or mark as `.skip()` temporarily.

---

## FINDING 10-24: Brief summaries (see PATCHES/ for full fixes)

**10. Missing JWT validation in send-notification-email**: Add `auth.uid()` check to verify caller owns the notification.

**11. send-friend-invitation lacks input validation**: Add Zod schema for `personalMessage` max length and `eventUrl` format.

**12. daily-analytics-aggregation no date validation**: Validate date is in YYYY-MM-DD format and not in the future.

**13. No vendor chunk splitting**: Add `manualChunks` in `vite.config.ts` to split React, Radix UI, and Supabase into separate bundles.

**14. Chunk size warning raised to 1MB**: Remove `chunkSizeWarningLimit` override; fix warnings properly.

**15. Missing responsive images**: Implement Supabase Storage transforms with width params or use a CDN.

**16. .env committed to repo**: Add `.env` to `.gitignore`; audit git history for secrets.

**17. PII logged in auth flows**: Remove `email` from `logger.debug()` calls; use redacted `user.id` instead.

**18. ErrorBoundary lacks telemetry**: Log errors to `error_logs` table in Supabase with stack traces.

**19. No bundle size budgets**: Add `vite-bundle-visualizer` and set max sizes in config.

**20. Missing rate limiting**: Implement per-user/IP rate limits in Edge Functions using a `rate_limits` table.

**21. No Lighthouse CI**: Add GitHub Action to run Lighthouse on preview deployments.

**22. Tournament data exposure**: Scope tournament SELECT policies to participants only.

**23. Email campaigns allow system inserts**: Restrict to admin role only.

**24. Dev mode auth spoofable**: Add `import.meta.env.PROD` check; remove dev mode in production builds.

---

## Summary

This document provides detailed context, code excerpts, fix steps, regression tests, and rollback plans for all 24 findings. Refer to `PATCHES/` for ready-to-apply diffs.
