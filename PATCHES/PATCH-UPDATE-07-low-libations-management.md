# PATCH-UPDATE-07: Add Admin Tab for Signature Libations Management

## Priority: Low 🔵
## Status: Awaiting Schema Confirmation
## Estimated Time: 90 minutes

## Description
Create a full CRUD admin interface for managing Signature Libations, following the same pattern as VignetteManagement. Replace hardcoded drinks array on Feast page with database-driven content.

## Open Questions
**User needs to confirm:**
1. Should we add a `libation_type` field? (e.g., "cocktail", "mocktail", "punch")
2. Should we store `image_url` (external link) or `photo_id` (gallery photo reference)?
3. Do you want `serving_size` or `prep_notes` fields?

## Proposed Database Schema

```sql
-- Create signature_libations table
CREATE TABLE IF NOT EXISTS public.signature_libations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  is_alcoholic BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.signature_libations ENABLE ROW LEVEL SECURITY;

-- Public read policy for active libations
CREATE POLICY "Anyone can view active libations"
  ON public.signature_libations
  FOR SELECT
  USING (is_active = true);

-- Admin full access policy
CREATE POLICY "Admins can manage all libations"
  ON public.signature_libations
  FOR ALL
  USING (public.is_admin());

-- Create index for ordering
CREATE INDEX idx_signature_libations_sort_order 
  ON public.signature_libations(sort_order, created_at);

-- Create updated_at trigger
CREATE TRIGGER update_signature_libations_updated_at
  BEFORE UPDATE ON public.signature_libations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Files to Create

### 1. `src/lib/libations-api.ts`
```typescript
import { supabase } from "@/integrations/supabase/client";

export interface CreateLibationData {
  name: string;
  description: string;
  ingredients: string[];
  is_alcoholic: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateLibationData extends Partial<CreateLibationData> {}

export async function createLibation(data: CreateLibationData) {
  const { data: libation, error } = await supabase
    .from('signature_libations')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return libation;
}

export async function updateLibation(id: string, data: UpdateLibationData) {
  const { data: libation, error } = await supabase
    .from('signature_libations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return libation;
}

export async function deleteLibation(id: string) {
  const { error } = await supabase
    .from('signature_libations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getActiveLibations() {
  const { data, error } = await supabase
    .from('signature_libations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllLibations() {
  const { data, error } = await supabase
    .from('signature_libations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### 2. `src/components/admin/LibationsManagement.tsx`
Follow pattern from `VignetteManagementTab.tsx`:
- List all libations
- Form fields: name, description, ingredients (textarea), is_alcoholic toggle, is_active toggle, sort_order
- Individual Save/Reset per libation
- Add New Libation button
- Delete confirmation dialog
- Move Up/Down buttons for reordering
- Loading states and error handling

## Files to Modify

### 3. `src/pages/Feast.tsx`
**Replace lines 229-245** (hardcoded `signatureDrinks` array):
```tsx
const { data: signatureDrinks = [], isLoading: drinksLoading } = useQuery({
  queryKey: ['active-libations'],
  queryFn: getActiveLibations,
});
```

Add loading state:
```tsx
{drinksLoading ? (
  <div className="text-center py-8">Loading libations...</div>
) : (
  // existing drink rendering logic
)}
```

### 4. `src/pages/AdminDashboard.tsx`
Add "Libations" tab to tabs array and render case:
```tsx
{activeTab === "libations" && <LibationsManagement />}
```

## Implementation Steps
1. **Get schema confirmation from user**
2. Create database migration
3. Create `libations-api.ts`
4. Create `LibationsManagement.tsx` component
5. Update `Feast.tsx` to fetch from database
6. Update `AdminDashboard.tsx` to add new tab
7. Test CRUD operations
8. Test Feast page display
9. Seed initial data (3 hardcoded drinks)

## Testing Steps
1. Login as admin
2. Navigate to Admin Dashboard → Libations tab (new)
3. Verify existing hardcoded drinks are visible (need to seed)
4. Test Create: Add new libation with all fields
5. Test Update: Edit existing libation
6. Test Delete: Remove a libation with confirmation
7. Test Reorder: Use move up/down buttons
8. Test is_active toggle: Deactivate a libation
9. Navigate to `/feast` page
10. Verify only active libations are displayed
11. Verify order matches sort_order
12. Test as non-admin: should not see admin tab

## Rollback
1. Drop `signature_libations` table
2. Delete new files
3. Revert `Feast.tsx` to hardcoded array
4. Remove tab from `AdminDashboard.tsx`

## Notes
- Requires database migration approval from user
- Need to seed initial 3 drinks from current hardcoded data
- Consider adding drag-and-drop reordering in future iteration
