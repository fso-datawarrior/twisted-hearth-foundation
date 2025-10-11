# PATCH-UPDATE-05: Add Image Lightbox to Admin Vignette Management

## Priority: Medium 🟢
## Status: Ready for Implementation
## Estimated Time: 20 minutes

## Description
Add a "View Full Size" button to the Admin Vignette Management that opens a lightbox for viewing photos at full size. Button should be positioned at the top of metadata fields and be mobile-adaptive.

## Files Affected
- `src/components/admin/VignetteManagementTab.tsx`

## Changes Required

### 1. Add Required Imports
```tsx
import { PhotoLightbox } from "@/components/gallery/PhotoLightbox";
import { Eye } from "lucide-react";
```

### 2. Add State Management
Add after line 91 (after existing state declarations):
```tsx
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
```

### 3. Add "View Full Size" Button
Position at the top of metadata fields (before "Title" input, around line 366):
```tsx
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => {
    setLightboxPhotoId(photo.id);
    setLightboxOpen(true);
  }}
  className="w-full sm:w-auto mb-4"
>
  <Eye className="h-4 w-4 mr-2" />
  View Full Size
</Button>
```

### 4. Add PhotoLightbox Component
Add at the bottom of the return statement (before closing fragment):
```tsx
{lightboxOpen && lightboxPhotoId && (
  <PhotoLightbox
    photos={selectedPhotos.map(p => ({
      id: p.id,
      url: p.signedUrl || '',
      caption: vignetteData[p.id]?.title || p.caption || '',
      user_id: '',
      created_at: new Date().toISOString(),
      is_approved: true,
      is_featured: false,
      storage_path: p.storage_path,
      filename: p.filename,
    }))}
    currentPhotoId={lightboxPhotoId}
    onClose={() => {
      setLightboxOpen(false);
      setLightboxPhotoId(null);
    }}
  />
)}
```

## Responsive Behavior
- Button uses `w-full sm:w-auto` for mobile stacking
- On mobile: full-width button
- On desktop: auto-width button inline with other elements

## Testing Steps
1. Login as admin
2. Navigate to Admin Dashboard → Vignettes tab
3. Verify "View Full Size" button appears above metadata fields for each photo
4. Click button - should open lightbox with full-size image
5. Test navigation between photos in lightbox
6. Test close functionality
7. Verify mobile responsiveness (button should be full-width on mobile)

## Rollback
Remove state, button, and lightbox component
