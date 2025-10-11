# PATCH-UPDATE-06: Individual Save/Reset Per Vignette

## Priority: Medium 🟢
## Status: Ready for Implementation
## Estimated Time: 45 minutes

## Description
Major refactor of VignetteManagementTab to track changes per-vignette instead of globally. Remove global "Save All Changes" button and add individual Save/Reset buttons to each vignette card.

## Files Affected
- `src/components/admin/VignetteManagementTab.tsx`

## Changes Required

### 1. Update State Management

**Remove (line ~115):**
```tsx
const [hasChanges, setHasChanges] = useState(false);
```

**Add:**
```tsx
const [vignetteChanges, setVignetteChanges] = useState<Record<string, boolean>>({});
const [savingVignettes, setSavingVignettes] = useState<Record<string, boolean>>({});
const [originalVignetteData, setOriginalVignetteData] = useState<Record<string, VignetteFormData>>({});
```

### 2. Update Data Initialization (useEffect around line 93)
After setting vignetteData, also set originalVignetteData:
```tsx
setOriginalVignetteData(initialData);
```

### 3. Update handleDataChange (line 175)
```tsx
const handleDataChange = (photoId: string, field: keyof VignetteFormData, value: any) => {
  setVignetteData(prev => ({
    ...prev,
    [photoId]: { ...prev[photoId], [field]: value }
  }));
  setVignetteChanges(prev => ({ ...prev, [photoId]: true }));
};
```

### 4. Create Individual Save Function
```tsx
const saveVignette = async (photoId: string) => {
  setSavingVignettes(prev => ({ ...prev, [photoId]: true }));
  
  try {
    const data = vignetteData[photoId];
    const photo = selectedPhotos.find(p => p.id === photoId);
    
    if (!photo || !data) {
      throw new Error("Photo or data not found");
    }

    // Validate required fields
    if (!data.title || !data.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    const existingVignette = allVignettes.find(v => v.photo_ids?.includes(photoId));

    if (existingVignette) {
      await updateVignetteMutation.mutateAsync({
        id: existingVignette.id,
        updates: {
          title: data.title,
          description: data.description,
          year: data.year,
          theme_tag: data.theme_tag,
          is_active: data.is_active,
          sort_order: data.sort_order,
        },
      });
    } else {
      await createVignetteMutation.mutateAsync({
        title: data.title,
        description: data.description,
        year: data.year,
        theme_tag: data.theme_tag,
        photo_ids: [photoId],
        is_active: data.is_active,
        sort_order: data.sort_order,
      });
    }

    // Update original data and clear changes
    setOriginalVignetteData(prev => ({
      ...prev,
      [photoId]: data,
    }));
    setVignetteChanges(prev => ({ ...prev, [photoId]: false }));

    toast({
      title: "Success",
      description: "Vignette saved successfully",
    });
  } catch (error) {
    console.error("Error saving vignette:", error);
    toast({
      title: "Error",
      description: "Failed to save vignette",
      variant: "destructive",
    });
  } finally {
    setSavingVignettes(prev => ({ ...prev, [photoId]: false }));
  }
};
```

### 5. Create Individual Reset Function
```tsx
const resetVignette = (photoId: string) => {
  setVignetteData(prev => ({
    ...prev,
    [photoId]: originalVignetteData[photoId],
  }));
  setVignetteChanges(prev => ({ ...prev, [photoId]: false }));
  
  toast({
    title: "Reset",
    description: "Changes discarded",
  });
};
```

### 6. Remove Global Buttons
**Delete lines 487-511** (global "Save All Changes" and "Reset" buttons section)

### 7. Add Individual Buttons to Each Card
Add after the sort_order input (around line 480), before the closing `</CardContent>`:
```tsx
<div className="flex gap-2 pt-4 border-t col-span-full">
  <Button 
    size="sm"
    onClick={() => saveVignette(photo.id)}
    disabled={!vignetteChanges[photo.id] || savingVignettes[photo.id]}
    className="flex-1"
  >
    <Save className="h-3 w-3 mr-1" />
    {savingVignettes[photo.id] ? 'Saving...' : 'Save'}
  </Button>
  <Button 
    size="sm"
    variant="outline"
    onClick={() => resetVignette(photo.id)}
    disabled={!vignetteChanges[photo.id]}
  >
    <RotateCcw className="h-3 w-3 mr-1" />
    Reset
  </Button>
</div>
```

### 8. Add Required Import
```tsx
import { Save, RotateCcw } from "lucide-react";
```

### 9. Update removeFromVignettes Function
Clear the change tracking when removing:
```tsx
setVignetteChanges(prev => {
  const newChanges = { ...prev };
  delete newChanges[photoId];
  return newChanges;
});
```

## Testing Steps
1. Login as admin
2. Navigate to Admin Dashboard → Vignettes tab
3. Verify NO global "Save All Changes" button exists
4. Edit metadata for ONE vignette
5. Verify ONLY that vignette's Save/Reset buttons are enabled
6. Click Save - should save only that vignette
7. Edit metadata for ANOTHER vignette
8. Verify first vignette's buttons are disabled, second are enabled
9. Click Reset on second vignette - should discard changes
10. Test loading states during save operations
11. Verify changes persist after page refresh

## Rollback
This is a major refactor. Rollback requires reverting to previous version with global save/reset.

## Notes
This change improves UX by allowing admins to save vignettes independently without having to validate/save all at once.
