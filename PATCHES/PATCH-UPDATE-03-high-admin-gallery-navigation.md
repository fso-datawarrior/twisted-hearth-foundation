# PATCH-UPDATE-03: Add Navigation Hyperlinks to Admin Gallery Management

## Priority: High 🟡
## Status: Ready for Implementation
## Estimated Time: 10 minutes

## Description
Add anchor navigation to Admin Gallery Management for easy jumping between "Pending Photos" and "Approved Photos" sections with smooth scrolling.

## Files Affected
- `src/components/admin/GalleryManagement.tsx`

## Changes Required

### 1. Add Anchor IDs
Add `id` attributes to section headers:
- Pending Photos section: `id="pending-photos"`
- Approved Photos section: `id="approved-photos"`

### 2. Add Navigation Buttons at Top
```tsx
<div className="flex flex-wrap gap-2 mb-6">
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => document.getElementById('pending-photos')?.scrollIntoView({ behavior: 'smooth' })}
  >
    <ArrowDown className="h-4 w-4 mr-2" />
    Go to Pending Photos
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => document.getElementById('approved-photos')?.scrollIntoView({ behavior: 'smooth' })}
  >
    <ArrowDown className="h-4 w-4 mr-2" />
    Go to Approved Photos
  </Button>
</div>
```

### 3. Add "Back to Top" Buttons
At the bottom of each section:
```tsx
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  className="mt-4"
>
  <ArrowUp className="h-4 w-4 mr-2" />
  Back to Top
</Button>
```

## Required Imports
```tsx
import { ArrowDown, ArrowUp } from "lucide-react";
```

## Testing Steps
1. Login as admin
2. Navigate to Admin Dashboard → Gallery tab
3. Click "Go to Pending Photos" - should smooth scroll to pending section
4. Click "Go to Approved Photos" - should smooth scroll to approved section
5. Click "Back to Top" - should smooth scroll to top
6. Test on mobile for responsive behavior

## Rollback
Remove navigation buttons and anchor IDs
