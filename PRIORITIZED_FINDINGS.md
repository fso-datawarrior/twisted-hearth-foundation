# PRIORITIZED FINDINGS

| ID | Title | Severity | Likelihood | Area | Evidence | Fix Summary | Effort |
|----|-------|----------|------------|------|----------|-------------|---------|
| 01 | Hardcoded Supabase credentials in client code | Critical | Critical | Security | src/integrations/supabase/client.ts:5-6 | Move to environment variables | S |
| 02 | Missing server-side Supabase client | High | High | Security | No server.ts file found | Create server client with service role | S |
| 03 | Overly permissive RLS policies | High | High | Security | supabase/migrations/20250906204143_15569238-0b31-4728-b925-e322645146d2.sql:78-80 | Restrict to authenticated users only | M |
| 04 | Missing input validation in Edge Functions | High | Medium | Security | supabase/functions/send-rsvp-confirmation/index.ts:96-97 | Add Zod validation | M |
| 05 | Console.log statements in production | Medium | High | Performance | 73 matches across 17 files | Remove or use proper logging | S |
| 06 | TypeScript strict mode disabled | Medium | Medium | Type Safety | tsconfig.json:9,14 | Enable strict mode | M |
| 07 | Missing error boundaries per route | Medium | Medium | UX | App.tsx:62-84 | Add route-specific error boundaries | M |
| 08 | Large main bundle (270KB) | Medium | Low | Performance | Build output shows 270KB main chunk | Code split heavy components | L |
| 09 | Missing accessibility skip links | Low | High | Accessibility | No skip links found | Add skip navigation | S |
| 10 | Missing image dimensions | Low | Medium | Performance | Images without width/height | Add explicit dimensions | S |
| 11 | Missing .env.example file | Low | Medium | DX | No .env.example found | Create environment template | S |
| 12 | Inconsistent error handling | Low | Medium | DX | Mixed error handling patterns | Standardize error handling | M |