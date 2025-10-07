# DETAILED FINDINGS

## 01 - Hardcoded Supabase credentials in client code

**Context**: The Supabase URL and anonymous key are hardcoded directly in the client-side code, which is a critical security vulnerability. These credentials are exposed in the browser and can be easily extracted by anyone.

**Evidence**: 
```typescript
// src/integrations/supabase/client.ts:5-6
const SUPABASE_URL = "https://dgdeiybuxlqbdfofzxpy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**Fix**: Move credentials to environment variables using Vite's `import.meta.env`:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Regression Tests**: 
- Test that app loads with environment variables
- Test that app fails gracefully when env vars are missing
- Verify credentials are not visible in browser dev tools

**Rollback Plan**: Revert to hardcoded values if environment variables cause issues

---

## 02 - Missing server-side Supabase client

**Context**: There's no server-side Supabase client for Edge Functions and server-side operations. The current setup only has a client-side client, which limits server-side functionality and security.

**Evidence**: No `src/integrations/supabase/server.ts` file found

**Fix**: Create server-side client with service role key:
```typescript
// src/integrations/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
```

**Regression Tests**: 
- Test Edge Functions can access admin client
- Verify service role key is never exposed to client
- Test admin operations work correctly

**Rollback Plan**: Remove server.ts file and update Edge Functions to use client

---

## 03 - Overly permissive RLS policies

**Context**: The RSVP table has a policy that allows anyone to read all RSVPs (`using (true)`), which violates data privacy and security principles.

**Evidence**:
```sql
-- supabase/migrations/20250906204143_15569238-0b31-4728-b925-e322645146d2.sql:78-80
create policy "select_own_rsvp" on public.rsvps
  for select using (true);
```

**Fix**: Restrict to authenticated users and their own data:
```sql
create policy "select_own_rsvp" on public.rsvps
  for select using (auth.uid() = user_id OR public.is_admin());
```

**Regression Tests**:
- Test authenticated users can only see their own RSVPs
- Test admins can see all RSVPs
- Test unauthenticated users cannot see any RSVPs

**Rollback Plan**: Revert to `using (true)` if it breaks functionality

---

## 04 - Missing input validation in Edge Functions

**Context**: The RSVP confirmation Edge Function accepts any JSON payload without validation, making it vulnerable to malformed data and potential attacks.

**Evidence**:
```typescript
// supabase/functions/send-rsvp-confirmation/index.ts:96-97
let body: Payload;
try { body = await req.json(); } catch { return new Response("Bad Request", { status: 400, headers: cors(origin) }); }
```

**Fix**: Add Zod validation schema:
```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const PayloadSchema = z.object({
  rsvpId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  guests: z.number().int().min(1).max(8),
  isUpdate: z.boolean().optional(),
  additionalGuests: z.array(z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().optional()
  })).optional()
});

// In the handler:
const validationResult = PayloadSchema.safeParse(body);
if (!validationResult.success) {
  return new Response("Invalid payload", { status: 400, headers: cors(origin) });
}
const validatedBody = validationResult.data;
```

**Regression Tests**:
- Test valid payloads work correctly
- Test invalid payloads return 400 errors
- Test malformed JSON returns 400 errors

**Rollback Plan**: Remove validation and revert to original parsing

---

## 05 - Console.log statements in production

**Context**: There are 73 console.log statements across 17 files that will execute in production, potentially exposing sensitive information and impacting performance.

**Evidence**: Found in files like `src/lib/auth.tsx`, `src/pages/RSVP.tsx`, etc.

**Fix**: Replace with proper logging utility:
```typescript
// src/lib/logger.ts
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  // ... other log levels
};
```

**Regression Tests**:
- Test logs only appear in development
- Test error logging still works in production
- Test performance impact is minimal

**Rollback Plan**: Revert to console.log statements

---

## 06 - TypeScript strict mode disabled

**Context**: TypeScript is configured with relaxed settings that reduce type safety and can lead to runtime errors.

**Evidence**:
```json
// tsconfig.json:9,14
"noImplicitAny": false,
"strictNullChecks": false
```

**Fix**: Enable strict mode:
```json
{
  "noImplicitAny": true,
  "noUnusedParameters": true,
  "noUnusedLocals": true,
  "strictNullChecks": true
}
```

**Regression Tests**:
- Test app compiles with strict mode
- Test no new runtime errors introduced
- Test type safety improvements

**Rollback Plan**: Revert to relaxed settings

---

## 07 - Missing error boundaries per route

**Context**: There's only one error boundary wrapping all routes, which means a single component error can crash the entire app.

**Evidence**: `App.tsx:62-84` shows single ErrorBoundary wrapping all routes

**Fix**: Add route-specific error boundaries:
```tsx
<Routes>
  <Route path="/" element={
    <ErrorBoundary>
      <Index />
    </ErrorBoundary>
  } />
  <Route path="/admin" element={
    <ErrorBoundary>
      <AdminDashboard />
    </ErrorBoundary>
  } />
  // ... other routes
</Routes>
```

**Regression Tests**:
- Test error in one route doesn't crash others
- Test error boundaries show appropriate messages
- Test error recovery works correctly

**Rollback Plan**: Revert to single error boundary

---

## 08 - Large main bundle (270KB)

**Context**: The main bundle is 270KB (84KB gzipped), which is large for a single chunk and impacts initial load time.

**Evidence**: Build output shows `dist/js/index-BRv-5CZX.js 270.32 kB`

**Fix**: Split heavy components into separate chunks:
```typescript
// vite.config.ts
manualChunks: {
  'admin-vendor': ['@/pages/AdminDashboard', '@/components/admin'],
  'hunt-vendor': ['@/components/hunt', '@/hooks/use-hunt'],
  'gallery-vendor': ['@/pages/Gallery', '@/components/ImageCarousel'],
}
```

**Regression Tests**:
- Test chunks load correctly
- Test lazy loading works
- Test bundle size is reduced

**Rollback Plan**: Revert to single chunk configuration

---

## 09 - Missing accessibility skip links

**Context**: The SkipLink component exists but lacks proper focus styling and keyboard navigation.

**Evidence**: `src/components/SkipLink.tsx` has basic implementation

**Fix**: Enhance skip link with proper focus styling:
```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-ring">
  Skip to main content
</a>
```

**Regression Tests**:
- Test skip link is visible on focus
- Test skip link navigates correctly
- Test keyboard navigation works

**Rollback Plan**: Revert to original skip link

---

## 10 - Missing image dimensions

**Context**: Images and videos lack explicit width/height attributes, causing layout shift during loading.

**Evidence**: `src/components/HeroVideo.tsx` and other image components

**Fix**: Add explicit dimensions:
```tsx
<video
  width={1920}
  height={1080}
  // ... other props
>
```

**Regression Tests**:
- Test no layout shift on image load
- Test images display correctly
- Test responsive behavior works

**Rollback Plan**: Remove width/height attributes

---

## 11 - Missing .env.example file

**Context**: No environment variable template exists, making it difficult for developers to set up the project.

**Evidence**: No `.env.example` file found

**Fix**: Create comprehensive environment template:
```bash
# .env.example
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... other variables
```

**Regression Tests**:
- Test app works with example env file
- Test all required variables are documented
- Test setup instructions are clear

**Rollback Plan**: Remove .env.example file

---

## 12 - Inconsistent error handling

**Context**: Error handling patterns vary across the codebase, making debugging and maintenance difficult.

**Evidence**: Mixed patterns in auth, API calls, and components

**Fix**: Create centralized logging utility and standardize error handling:
```typescript
// src/lib/logger.ts
export const logger = {
  debug: (message: string, ...args: any[]) => { /* ... */ },
  error: (message: string, error?: Error, ...args: any[]) => { /* ... */ }
};
```

**Regression Tests**:
- Test consistent error logging
- Test error handling works across components
- Test debugging is easier

**Rollback Plan**: Revert to original error handling patterns