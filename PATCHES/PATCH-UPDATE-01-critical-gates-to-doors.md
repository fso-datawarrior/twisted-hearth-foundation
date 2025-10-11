# PATCH-UPDATE-01: Change "Gates" to "Doors"

## Priority: Critical 🔴
## Status: Ready for Implementation
## Estimated Time: 30 seconds

## Description
Update the hero section text to say "through the doors at" instead of "through the gates at" for more accurate language.

## Files Affected
- `src/pages/Index.tsx` (line 216)

## Changes Required

### src/pages/Index.tsx (line 216)
**Before:**
```tsx
through the gates at
```

**After:**
```tsx
through the doors at
```

## Testing Steps
1. Navigate to homepage `/`
2. Verify hero section reads "through the doors at"

## Rollback
Simple text revert if needed
