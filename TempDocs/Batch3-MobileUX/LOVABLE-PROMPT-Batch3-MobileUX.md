# 📱 BATCH 3: MOBILE UX - LOVABLE AI PROMPT

**Date**: October 13, 2025  
**Items**: 4 (Items 1, 20, 22, 23)  
**Priority**: 🟡 HIGH  
**Est. Time**: 7-10 hours  
**Type**: Mobile UX Improvements

---

## 🎯 OBJECTIVE

Improve mobile user experience with better navigation, scroll behavior, and UI positioning. Fix 4 mobile-specific issues.

---

## 📋 ITEMS TO COMPLETE

1. **Item 20**: Email Campaign Mobile Popup (1 hour) - Quick CSS fix
2. **Item 23**: Vignettes Page Flash (1-2 hours) - Loading state
3. **Item 1**: Vignettes Mobile Scroll (3-4 hours) - Core feature
4. **Item 22**: Mobile Swipe Navigation (2-3 hours) - Complex feature

**Complete all 4 items in this order.**

---

## 🔍 ITEM 20: EMAIL CAMPAIGN MOBILE POPUP

### Problem
When creating an email campaign in the admin panel, the verification popup is slightly off-screen on mobile devices.

### Current Behavior
- Popup partially visible on small screens
- Buttons may be cut off
- Poor mobile UX

### Desired Behavior
- Popup fully visible on all screen sizes (down to 320px)
- Centered with proper padding from edges
- All buttons accessible

### Technical Approach

**Files to Modify**:
- `src/components/admin/EmailCampaignManager.tsx` (or wherever the campaign modal is)
- Or the Dialog/Modal component used

**Changes Needed**:

1. **Find the confirmation Dialog** - Search for email campaign send/verification modal
2. **Add responsive constraints**:
   ```typescript
   <Dialog>
     <DialogContent className="max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] mx-4">
       {/* content */}
     </DialogContent>
   </Dialog>
   ```

3. **Ensure mobile positioning**:
   - Use `fixed` positioning with proper centering
   - Add viewport-aware max-width
   - Minimum 16px padding from screen edges
   - Enable scrolling if content too tall

### Testing Checklist
- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone 12)
- [ ] Test on 768px width (tablet)
- [ ] All text visible
- [ ] All buttons accessible
- [ ] Can scroll if needed
- [ ] Desktop unchanged

---

## 🔍 ITEM 23: VIGNETTES PAGE FLASH

### Problem
On first load of the vignettes page, users briefly see old/empty vignettes before current ones load. Creates jarring flash.

### Current Code
**File**: `src/pages/Vignettes.tsx`

**Lines 39-51**:
```typescript
const { data: vignettes, isLoading, error } = useQuery({
  queryKey: ['active-vignettes'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('past_vignettes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  }
});
```

**Problem**: Component renders before data loads, showing empty state.

### Solution

**Change 23.1** - Add loading state check (around line 200):

Find the main render return statement. Add loading check BEFORE carousel:

```typescript
// BEFORE carousel renders, add:
if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bg-2 to-background text-ink">
      <main className="pt-20 md:pt-24 relative z-10">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-center mb-4 text-accent-gold">
              Vignettes from Years Past
            </h1>
            <p className="font-body text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Loading past vignettes...
            </p>
            
            {/* Loading Skeleton */}
            <div className="relative max-w-6xl mx-auto">
              <div className="overflow-hidden rounded-lg">
                <div className="flex gap-4 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={i}
                      className="flex-shrink-0 w-[calc(33.333%-12px)] aspect-[16/9] bg-bg-2 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

**Change 23.2** - Add empty state check (after loading check):

```typescript
if (!vignettes || vignettes.length === 0) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bg-2 to-background text-ink">
      <main className="pt-20 md:pt-24 relative z-10">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-accent-gold">
              Vignettes from Years Past
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              No past vignettes available at this time.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

**Change 23.3** - Only render carousel when data ready:

Make sure the main carousel rendering ONLY happens after loading and empty checks pass.

### Testing Checklist
- [ ] Clear cache and reload - no flash
- [ ] Reload page - no flash
- [ ] Slow network (throttle 3G) - shows skeleton
- [ ] Fast network - smooth transition
- [ ] No "jump" when content loads
- [ ] Works on mobile and desktop

---

## 🔍 ITEM 1: VIGNETTES MOBILE SCROLL

### Problem
Vignettes page scrolls 2-3 photos at once on mobile. Arrow buttons also jump multiple photos. Users want one photo at a time.

### Current Code
**File**: `src/pages/Vignettes.tsx`

**Lines 145-154**:
```typescript
// Carousel navigation
const maxIndex = Math.max(0, displayVignettes.length - itemsPerView);

const nextSlide = () => {
  setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
};

const prevSlide = () => {
  setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
};
```

**Root Cause**:
- `maxIndex = displayVignettes.length - itemsPerView`
- When `itemsPerView = 3` (desktop), `maxIndex` is too small
- Causes photos to be skipped

### Solution

**Change 1.1** - Fix maxIndex calculation (line 146):

```typescript
// BEFORE:
const maxIndex = Math.max(0, displayVignettes.length - itemsPerView);

// AFTER:
const maxIndex = Math.max(0, displayVignettes.length - 1);
```

**Change 1.2** - Ensure single-step navigation (lines 148-154):

Navigation already moves by 1, but verify it works correctly with new maxIndex:

```typescript
const nextSlide = () => {
  setCurrentIndex(prev => {
    const nextIndex = prev + 1;
    return nextIndex > maxIndex ? 0 : nextIndex;
  });
};

const prevSlide = () => {
  setCurrentIndex(prev => {
    const prevIndex = prev - 1;
    return prevIndex < 0 ? maxIndex : prevIndex;
  });
};
```

**Change 1.3** - Add CSS scroll snap for smoothness (add to `src/index.css`):

```css
/* Vignettes smooth scroll snap */
.vignettes-carousel-track {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.vignettes-carousel-item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
```

**Change 1.4** - Apply CSS classes to carousel (in `Vignettes.tsx`):

Find the carousel track div (around line 252-260) and add classes:

```typescript
// BEFORE:
<div className="overflow-hidden rounded-lg">
  <div 
    className="flex transition-transform duration-300 ease-in-out gap-4"
    style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
  >

// AFTER:
<div className="overflow-hidden rounded-lg vignettes-carousel-track">
  <div 
    className="flex transition-transform duration-300 ease-in-out gap-4"
    style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
  >
    {displayVignettes.map((vignette, idx) => (
      <div
        key={vignette.id}
        className="flex-shrink-0 vignettes-carousel-item"
        // ... rest of item
      >
```

### Testing Checklist
- [ ] Mobile (320px-768px): Shows 1 photo, arrows move 1
- [ ] Tablet (768px-1024px): Shows 2 photos, arrows move 1
- [ ] Desktop (1024px+): Shows 3 photos, arrows move 1
- [ ] Touch swipe on mobile: Moves 1 photo
- [ ] Rapid arrow clicks: No skipping
- [ ] First and last photos reachable
- [ ] Auto-play still works (if enabled)
- [ ] Lightbox still works

---

## 🔍 ITEM 22: MOBILE SWIPE NAVIGATION

### Problem
Mobile swipe only navigates through browser history. Swiping past homepage closes the app. Users want to swipe through main nav pages in order.

### Desired Behavior
- Swipe left: Next page in nav order
- Swipe right: Previous page in nav order
- Bounded: Homepage (left) ↔ RSVP (right)
- No app closing at boundaries

### Page Navigation Order (Left → Right)
1. **/** (Homepage) - LEFT BOUNDARY
2. **/vignettes**
3. **/schedule**
4. **/gallery**
5. **/discussion**
6. **/costumes**
7. **/rsvp** - RIGHT BOUNDARY

### Implementation

**Step 1**: Create new hook file

**NEW FILE**: `src/hooks/useSwipeNavigation.ts`

```typescript
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ORDER = [
  '/',
  '/vignettes',
  '/schedule',
  '/gallery',
  '/discussion',
  '/costumes',
  '/rsvp'
];

export const useSwipeNavigation = (enabled: boolean = true) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const getCurrentIndex = () => {
    return NAV_ORDER.indexOf(location.pathname);
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) < threshold) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return; // Not a main nav page

    if (diff > 0) {
      // Swipe left - go to next page
      if (currentIndex < NAV_ORDER.length - 1) {
        navigate(NAV_ORDER[currentIndex + 1]);
      }
    } else {
      // Swipe right - go to previous page
      if (currentIndex > 0) {
        navigate(NAV_ORDER[currentIndex - 1]);
      }
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    // Only handle single-finger swipes
    if (e.touches.length !== 1) return;
    
    // Don't interfere with scrollable elements
    const target = e.target as HTMLElement;
    if (
      target.closest('.carousel') ||
      target.closest('.lightbox') ||
      target.closest('[data-no-swipe]')
    ) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length !== 1) return;
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  useEffect(() => {
    if (!enabled) return;

    // Only enable on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, location.pathname]);

  return null;
};
```

**Step 2**: Integrate into App.tsx

**File**: `src/App.tsx`

Find the main App component and add the hook:

```typescript
// Add import at top:
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// Inside App component (around line 30-40):
function App() {
  // Add this line (only on public pages, not admin)
  useSwipeNavigation(true);
  
  return (
    // ... rest of app
  );
}
```

**Step 3**: Prevent swipe on carousels

Add `data-no-swipe` attribute to carousel containers:

**Files to update**:
- `src/pages/Gallery.tsx` - Add to carousel container
- `src/pages/Vignettes.tsx` - Add to carousel container
- `src/components/gallery/PhotoCarousel.tsx` - Add to main div
- `src/components/gallery/PhotoLightbox.tsx` - Add to lightbox div

Example:
```typescript
<div className="carousel-container" data-no-swipe>
  {/* carousel content */}
</div>
```

### Testing Checklist
- [ ] Swipe left goes to next page in order
- [ ] Swipe right goes to previous page in order
- [ ] Homepage: Can't swipe right (stops at boundary)
- [ ] RSVP: Can't swipe left (stops at boundary)
- [ ] App doesn't close on over-swipe
- [ ] Gallery carousel swipe still works
- [ ] Vignettes carousel swipe still works
- [ ] Lightbox swipe still works
- [ ] Vertical scroll unaffected
- [ ] Desktop unaffected (no swipe nav)
- [ ] Admin pages unaffected (no swipe nav)

---

## 🚨 CRITICAL REQUIREMENTS

### **1. Preserve All Existing Features** ✅
- [ ] Photo upload functionality
- [ ] Gallery carousel
- [ ] Vignettes carousel
- [ ] Lightbox swipe
- [ ] Admin functionality
- [ ] All buttons and links
- [ ] All forms and inputs

### **2. Mobile Testing Priority** ✅
- [ ] Test on 320px width (smallest phones)
- [ ] Test on 375px width (iPhone)
- [ ] Test on 390px width (Android)
- [ ] Test on 768px width (tablet)
- [ ] Verify desktop unchanged

### **3. Performance** ✅
- [ ] No new console errors
- [ ] No performance degradation
- [ ] Loading states smooth
- [ ] Animations smooth (60fps)

---

## 📊 MANDATORY COMPLETION REPORT

You MUST provide this report after completing all work:

```markdown
# ✅ BATCH 3 COMPLETION REPORT

## 📊 SUMMARY
- **Items Completed**: [X/4]
- **Files Modified**: [X]
- **New Files Created**: [X]
- **Testing Status**: [Completed/Partial]
- **Issues Found**: [X]

## ✅ ITEM 20: EMAIL CAMPAIGN MOBILE POPUP

### Changes Made:
- [ ] File: `src/components/admin/[filename].tsx`
  - Line X: Added responsive max-width
  - Line Y: Added viewport padding
  - Line Z: Enabled scrolling

### Testing Results:
- [ ] 320px width: [PASS/FAIL]
- [ ] 375px width: [PASS/FAIL]
- [ ] Desktop: [PASS/FAIL]

### Issues:
- None / [List any issues]

---

## ✅ ITEM 23: VIGNETTES PAGE FLASH

### Changes Made:
- [ ] File: `src/pages/Vignettes.tsx`
  - Line X: Added loading state check
  - Line Y: Added skeleton loader
  - Line Z: Added empty state check

### Testing Results:
- [ ] Clear cache reload: [PASS/FAIL - no flash seen]
- [ ] Regular reload: [PASS/FAIL - no flash seen]
- [ ] Slow network: [PASS/FAIL - skeleton shows]

### Issues:
- None / [List any issues]

---

## ✅ ITEM 1: VIGNETTES MOBILE SCROLL

### Changes Made:
- [ ] File: `src/pages/Vignettes.tsx`
  - Line X: Fixed maxIndex calculation
  - Line Y: Updated nextSlide function
  - Line Z: Updated prevSlide function
  - Line W: Added CSS classes
- [ ] File: `src/index.css`
  - Line X: Added scroll-snap CSS

### Testing Results:
- [ ] Mobile (< 768px): [PASS/FAIL - arrows move 1]
- [ ] Tablet (768-1024px): [PASS/FAIL - arrows move 1]
- [ ] Desktop (> 1024px): [PASS/FAIL - arrows move 1]
- [ ] Touch swipe: [PASS/FAIL]
- [ ] Lightbox: [PASS/FAIL - still works]

### Issues:
- None / [List any issues]

---

## ✅ ITEM 22: MOBILE SWIPE NAVIGATION

### Changes Made:
- [ ] File: `src/hooks/useSwipeNavigation.ts` ⭐ NEW FILE
  - Created swipe detection hook
  - Implemented page order navigation
  - Added boundary handling
- [ ] File: `src/App.tsx`
  - Line X: Imported hook
  - Line Y: Enabled swipe navigation
- [ ] File: `src/pages/Gallery.tsx`
  - Line X: Added data-no-swipe to carousel
- [ ] File: `src/pages/Vignettes.tsx`
  - Line X: Added data-no-swipe to carousel
- [ ] File: `src/components/gallery/PhotoCarousel.tsx`
  - Line X: Added data-no-swipe
- [ ] File: `src/components/gallery/PhotoLightbox.tsx`
  - Line X: Added data-no-swipe

### Testing Results:
- [ ] Swipe left navigation: [PASS/FAIL]
- [ ] Swipe right navigation: [PASS/FAIL]
- [ ] Homepage boundary: [PASS/FAIL - stops]
- [ ] RSVP boundary: [PASS/FAIL - stops]
- [ ] App doesn't close: [PASS/FAIL]
- [ ] Gallery carousel: [PASS/FAIL - still works]
- [ ] Vignettes carousel: [PASS/FAIL - still works]
- [ ] Lightbox: [PASS/FAIL - still works]
- [ ] Vertical scroll: [PASS/FAIL - unaffected]
- [ ] Desktop: [PASS/FAIL - no swipe nav]

### Issues:
- None / [List any issues]

---

## 📁 FILES SUMMARY

### Modified ([X] files):
1. `src/pages/Vignettes.tsx` - Loading state + scroll fix
2. `src/index.css` - Scroll snap CSS
3. `src/App.tsx` - Swipe hook integration
4. `src/pages/Gallery.tsx` - data-no-swipe
5. `src/components/gallery/PhotoCarousel.tsx` - data-no-swipe
6. `src/components/gallery/PhotoLightbox.tsx` - data-no-swipe
7. `src/components/admin/[EmailComponent].tsx` - Mobile popup fix

### Created ([X] files):
1. `src/hooks/useSwipeNavigation.ts` ⭐ NEW HOOK

### Total Changes: [X] files

---

## 🎯 TESTING SUMMARY

### Completed Tests: [X/30+]
- [ ] All 4 items tested individually
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing (320px, 375px, 390px, 768px)
- [ ] Desktop testing (1024px+)
- [ ] All existing features preserved
- [ ] No console errors
- [ ] Performance acceptable

### Known Issues:
- None / [List any issues]

---

## ✅ DEPLOYMENT READINESS

- [ ] All 4 items complete
- [ ] All tests passing
- [ ] No breaking changes
- [ ] Mobile responsive
- [ ] Desktop unchanged
- [ ] Performance acceptable
- [ ] Ready for production

---

**Completion Status**: [✅ READY / ⚠️ ISSUES FOUND / ❌ BLOCKED]
```

---

## 📚 REFERENCE DOCUMENTS

**In Git Repository**:
- `TempDocs/Batch3-MobileUX/BATCH3_PLANNING.md` - Full planning
- `TempDocs/Batch3-MobileUX/BATCH3_QUICK_START.md` - Quick overview
- `TempDocs/Batch1-QuickWins/HOTFIXES_AND_FEATURES_MASTER_TRACKER.md` - All items
- `TempDocs/MASTER_BATCH_PLAN.md` - Overall strategy

---

## 🚀 EXECUTION INSTRUCTIONS

1. **Access Git Repository**: Pull latest from `version-2.2.05.11-Batch5-Phase2-AnalyticsDB-TRY2` branch
2. **Complete items in order**: 20 → 23 → 1 → 22
3. **Test each item individually** before moving to next
4. **Provide completion report** in the format above
5. **Note any issues or blockers** immediately

---

## ⚠️ IMPORTANT NOTES

- **Mobile-first**: All changes must work on smallest screens (320px)
- **Don't break carousels**: Swipe navigation must not interfere with existing swipe features
- **Preserve admin**: Swipe navigation should not affect admin pages
- **Test thoroughly**: Mobile testing is critical for this batch
- **Report everything**: Use the mandatory completion report format

---

**Ready to build! Complete all 4 items and provide the mandatory completion report.** 🚀✨

