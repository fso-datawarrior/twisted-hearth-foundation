# Database Schema Analysis

## Current Database Structure

### RSVPs Table Evolution
The RSVPs table has evolved through multiple migrations with different structures:

#### Migration 1: Initial Structure (20250906204143)
```sql
create table if not exists public.rsvps (
  rsvp_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  num_guests int2 not null default 1 check (num_guests between 1 and 8),
  costume_idea text,
  dietary_restrictions text,
  contributions text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
```

#### Migration 2: Email Tracking Added (20250906211453)
```sql
-- Track confirmation emails (observability)
alter table if exists public.rsvps
  add column if not exists email_sent_at timestamptz;

-- Prepare for deduping flaky submits
alter table if exists public.rsvps
  add column if not exists idempotency_token uuid;
```

#### Migration 3: New Structure (20251002173410)
```sql
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  is_approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Schema Inconsistencies

### 1. Column Name Conflicts
- **Old**: `rsvp_id` (primary key)
- **New**: `id` (primary key)
- **Impact**: Code references `data.id` but old schema uses `rsvp_id`

### 2. Missing Email Tracking
- **Old Schema**: Has `email_sent_at` column
- **New Schema**: Missing `email_sent_at` column
- **Impact**: Cannot track if emails were sent

### 3. User Reference Changes
- **Old**: References `public.users(user_id)`
- **New**: References `auth.users(id)`
- **Impact**: Different user management system

## Current TypeScript Types (src/integrations/supabase/types.ts)

### RSVPs Table Definition
```typescript
rsvps: {
  Row: {
    additional_guests: Json | null
    created_at: string
    dietary_restrictions: string | null
    email: string
    id: string
    is_approved: boolean | null
    name: string
    num_guests: number
    status: string | null
    updated_at: string
    user_id: string | null
  }
  // ... Insert and Update types
}
```

### Missing Columns in Types
- `email_sent_at` - Not present in current types
- `idempotency_token` - Not present in current types

## Database Functions

### Available Functions
```typescript
Functions: {
  admin_update_rsvp_status: {
    Args: { p_is_approved?: boolean; p_rsvp_id: string; p_status: string }
    Returns: undefined
  }
  check_admin_status: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
  ensure_admins_seeded: {
    Args: Record<PropertyKey, never>
    Returns: undefined
  }
  // ... other functions
}
```

### Missing Functions
- No `submit_rsvp` function in current types
- No email tracking functions

## Migration History Analysis

### Conflicting Migrations
1. **20250906204143**: Creates initial RSVPs table
2. **20250906211453**: Adds email tracking columns
3. **20250910000949**: Updates submit_rsvp function
4. **20251002173410**: Creates new RSVPs table structure
5. **20251003004140**: Creates another submit_rsvp function

### Potential Issues
- Multiple table definitions for RSVPs
- Conflicting column names
- Missing email tracking in new schema
- Function signature mismatches

## Recommendations

### 1. Schema Consolidation
- Determine which RSVPs table structure is active
- Ensure email tracking columns exist
- Update TypeScript types to match actual schema

### 2. Migration Cleanup
- Review all migrations for conflicts
- Create migration to add missing columns
- Update function signatures to match

### 3. Data Integrity
- Check if old and new tables both exist
- Migrate data if necessary
- Update foreign key references

## Questions to Resolve
1. Which RSVPs table structure is currently active?
2. Are there multiple RSVPs tables in the database?
3. Do the email tracking columns exist?
4. Which submit_rsvp function is being used?
5. Are the TypeScript types up to date?
