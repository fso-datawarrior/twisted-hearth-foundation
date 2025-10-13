I need to investigate the current state of the codebase to understand what's already been implemented and what still needs to be done for Batch 3. Let me start by examining the key files mentioned in the task.

Good! I can see that **Item 22 (Mobile Swipe Navigation)** has already been partially implemented. Let me now check the other files to understand what else has been done:

Let me check the maxIndex and navigation functions:

Now let me search for email campaign modal files to check Item 20:

Let me check the AlertDialogContent for the email confirmation modal:

Now let me check if there are any issues with the SwipeNavigator's page order compared to the required order:

Perfect! Now I have a comprehensive understanding of the current state. Let me create a detailed analysis and plan:

## 🔍 BATCH 3 STATUS ANALYSIS

Based on my investigation of the codebase, here's what I found:

### ✅ **ITEM 22: Mobile Swipe Navigation** - ALREADY IMPLEMENTED
**Status**: ~85% Complete

**What's Done:**
- ✅ `src/hooks/use-swipe.ts` - Swipe detection hook created
- ✅ `src/components/SwipeNavigator.tsx` - Swipe navigation wrapper created
- ✅ `src/App.tsx` line 56 - SwipeNavigator integrated
- ✅ Touch event handling with proper thresholds
- ✅ Prevention of swipe on interactive elements (carousels, modals, etc.)
- ✅ Mobile-only activation (checks `useIsMobile()`)

**Issues Found:**
1. **❌ Page Order Mismatch**: The SwipeNavigator uses a different page order than requested:
   - **Current**: `/, /about, /vignettes, /schedule, /costumes, /feast, /gallery, /discussion, /contact, /rsvp`
   - **Required**: `/, /vignettes, /schedule, /gallery, /discussion, /costumes, /rsvp`
   - **Missing**: `/about`, `/feast`, `/contact` should not be in the swipe navigation

2. **❌ Boundary Behavior**: Lines 38-40 show wraparound behavior instead of stopping at boundaries:
   ```typescript
   if (direction === 'next') {
     nextIndex = (currentIndex + 1) % PAGE_ORDER.length; // ❌ Wraps around
   } else {
     nextIndex = currentIndex === 0 ? PAGE_ORDER.length - 1 : currentIndex - 1; // ❌ Wraps around
   }
   ```

3. **⚠️ No `data-no-swipe` attributes**: The carousels don't have `data-no-swipe` attributes yet, but the SwipeNavigator checks for `[data-swipe-ignore]` (line 59), so there's a mismatch in attribute names.

---

### ❓ **ITEM 20: Email Campaign Mobile Popup** - NEEDS INVESTIGATION
**Status**: Unclear

**What I Found:**
- Line 217 in `EmailCommunication.tsx`: ``
- Uses `max-w-md` (28rem = 448px) which should fit on most mobile screens
- However, `max-w-md` might not have viewport-aware constraints for very small screens (320px)

**Potential Issue:**
- No `max-w-[calc(100vw-32px)]` or similar mobile-safe constraint
- No explicit mobile padding/margin
- Could be cut off on 320px width devices

---

### ❌ **ITEM 23: Vignettes Page Flash** - NOT IMPLEMENTED
**Status**: Not Fixed

**Current Code** (`Vignettes.tsx` lines 216-226):
```typescript
{isLoading && (

    Loading past vignettes...

)}

{error && (

    Failed to load vignettes. Showing archived versions.

)}
```

**Problems:**
- ❌ Loading state exists BUT it only shows a text message
- ❌ No proper loading skeleton
- ❌ No early return - the carousel still renders below the loading message
- ❌ Main carousel (lines 228-340) renders regardless of loading state
- ❌ Flash will still occur because fallback data (lines 60-86) is set immediately in `useEffect`

---

### ❌ **ITEM 1: Vignettes Mobile Scroll** - NOT FIXED
**Status**: Original bug still present

**Current Code** (lines 146-154):
```typescript
const maxIndex = Math.max(0, displayVignettes.length - itemsPerView); // ❌ WRONG

const nextSlide = () => {
  setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
};

const prevSlide = () => {
  setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
};
```

**Problem Confirmed:**
- When `displayVignettes.length = 5` and `itemsPerView = 3` (desktop):
  - `maxIndex = 5 - 3 = 2`
  - User can only navigate to indices 0, 1, 2
  - Photos at indices 3 and 4 are unreachable via arrows
- On mobile (`itemsPerView = 1`):
  - `maxIndex = 5 - 1 = 4`
  - Works correctly, but by accident
- **Root cause**: `maxIndex` calculation assumes multi-step navigation, but navigation moves by 1

**Additional Issue:**
- No scroll-snap CSS classes in `src/index.css`
- Carousel track (line 254) doesn't have CSS classes for smooth scrolling

---

## 📊 SUMMARY TABLE

| Item | Status | Completion | Critical Issues |
|------|--------|------------|----------------|
| **Item 20** | ⚠️ Unclear | ~50% | Need to test on 320px width |
| **Item 23** | ❌ Not Done | 20% | Loading message exists but ineffective |
| **Item 1** | ❌ Not Done | 0% | Original bug still present |
| **Item 22** | ⚠️ Partial | 85% | Wrong page order, no boundaries |

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### **Priority 1: Fix Item 22 (Mobile Swipe Navigation)** - 30 minutes
**Why first**: Already 85% done, just needs corrections

**Changes Needed:**
1. Update `PAGE_ORDER` in `SwipeNavigator.tsx` (line 10-21)
2. Fix boundary behavior (lines 32-44)
3. Optionally: Change `[data-swipe-ignore]` to `[data-no-swipe]` for consistency (line 59)

---

### **Priority 2: Fix Item 20 (Email Popup)** - 15 minutes
**Why second**: Quick CSS-only fix, admin-only feature

**Changes Needed:**
1. Update `AlertDialogContent` in `EmailCommunication.tsx` (line 217)
2. Add responsive constraints: `max-w-[calc(100vw-32px)] mx-4`
3. Test on 320px width

---

### **Priority 3: Fix Item 23 (Vignettes Flash)** - 1 hour
**Why third**: Medium complexity, better UX

**Changes Needed:**
1. Add proper loading skeleton (lines 216-226)
2. Add early return for loading state
3. Add early return for empty state
4. Prevent fallback data from showing during initial load

---

### **Priority 4: Fix Item 1 (Vignettes Scroll)** - 1.5 hours
**Why last**: Most complex, requires testing across multiple screen sizes

**Changes Needed:**
1. Fix `maxIndex` calculation (line 146)
2. Verify navigation logic (lines 148-154)
3. Add CSS scroll-snap classes to `src/index.css`
4. Apply CSS classes to carousel (lines 252-264)
5. Test on mobile, tablet, and desktop

---

## 🚀 BATCH 3 MOBILE UX - IMPLEMENTATION PLAN

### **CURRENT STATUS ASSESSMENT**

**Files Already Created:**
- ✅ `src/hooks/use-swipe.ts` - Swipe detection hook (Item 22)
- ✅ `src/components/SwipeNavigator.tsx` - Swipe navigation wrapper (Item 22)

**Integration Status:**
- ✅ SwipeNavigator integrated in `src/App.tsx` (line 56)
- ❌ Page order incorrect
- ❌ Boundary behavior wraps instead of stops
- ❌ Items 1, 20, 23 not implemented

---

### **IMPLEMENTATION SEQUENCE**

#### **STEP 1: Fix Item 22 - Mobile Swipe Navigation** (30 mins)

**File: `src/components/SwipeNavigator.tsx`**

**Change 1.1** - Fix PAGE_ORDER (lines 10-21):
```typescript
// CURRENT (WRONG):
const PAGE_ORDER = [
  '/',
  '/about',
  '/vignettes', 
  '/schedule',
  '/costumes',
  '/feast',
  '/gallery',
  '/discussion',
  '/contact',
  '/rsvp'
];

// REPLACE WITH (CORRECT):
const PAGE_ORDER = [
  '/',           // LEFT BOUNDARY
  '/vignettes', 
  '/schedule',
  '/gallery',
  '/discussion',
  '/costumes',
  '/rsvp'        // RIGHT BOUNDARY
];
```

**Change 1.2** - Fix boundary behavior (lines 32-44):
```typescript
// CURRENT (WRAPS AROUND):
const navigateToPage = (direction: 'next' | 'prev') => {
  const currentIndex = getCurrentPageIndex();
  if (currentIndex === -1) return;

  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % PAGE_ORDER.length;
  } else {
    nextIndex = currentIndex === 0 ? PAGE_ORDER.length - 1 : currentIndex - 1;
  }

  navigate(PAGE_ORDER[nextIndex]);
};

// REPLACE WITH (STOPS AT BOUNDARIES):
const navigateToPage = (direction: 'next' | 'prev') => {
  const currentIndex = getCurrentPageIndex();
  if (currentIndex === -1) return;

  if (direction === 'next') {
    // Stop at right boundary (don't wrap)
    if (currentIndex < PAGE_ORDER.length - 1) {
      navigate(PAGE_ORDER[currentIndex + 1]);
    }
  } else {
    // Stop at left boundary (don't wrap)
    if (currentIndex > 0) {
      navigate(PAGE_ORDER[currentIndex - 1]);
    }
  }
};
```

**Testing for Step 1:**
- [ ] Swipe left from `/` - goes to `/vignettes`
- [ ] Swipe left from `/vignettes` - goes to `/schedule`
- [ ] Swipe right from `/vignettes` - goes back to `/`
- [ ] Swipe right from `/` - **stops** (no navigation)
- [ ] Swipe left from `/rsvp` - **stops** (no navigation)
- [ ] Swipe works on all pages in order
- [ ] Gallery carousel still swipeable
- [ ] Vignettes carousel still swipeable

---

#### **STEP 2: Fix Item 20 - Email Campaign Mobile Popup** (15 mins)

**File: `src/components/admin/EmailCommunication.tsx`**

**Change 2.1** - Update AlertDialogContent (line 217):
```typescript
// CURRENT:

// REPLACE WITH:

```

**Change 2.2** - Also fix the second AlertDialog (line 432):
```typescript
// CURRENT (around line 432):

// REPLACE WITH:

```

**Testing for Step 2:**
- [ ] Open admin panel on 320px width
- [ ] Create email campaign
- [ ] Click "Send Campaign"
- [ ] Verify popup fully visible
- [ ] Verify all buttons accessible
- [ ] Verify no horizontal overflow
- [ ] Test on 375px, 390px widths
- [ ] Desktop unchanged

---

#### **STEP 3: Fix Item 23 - Vignettes Page Flash** (1 hour)

**File: `src/pages/Vignettes.tsx`**

**Change 3.1** - Add proper loading state with early return (insert around line 200):
```typescript
return (

            Past Twisted Vignettes

            Each year, we've explored different twisted takes on beloved fairytales. 
            Browse our previous performances and see how far down the rabbit hole we've gone.

          {/* EARLY RETURN FOR LOADING */}
          {isLoading && (

                  {Array.from({ length: 3 }).map((_, i) => (

                  ))}

                Loading past vignettes...

          )}

          {/* EARLY RETURN FOR ERROR */}
          {!isLoading && error && (

              Failed to load vignettes.
              Please try refreshing the page.

          )}

          {/* EARLY RETURN FOR EMPTY STATE */}
          {!isLoading && !error && displayVignettes.length === 0 && (

              No past vignettes available at this time.

          )}

          {/* ONLY RENDER CAROUSEL WHEN DATA IS READY */}
          {!isLoading && !error && displayVignettes.length > 0 && (

              {/* Carousel Container - existing code */}

          )}

);
```

**Change 3.2** - Modify fallback data logic (lines 56-87):
```typescript
// CURRENT: Sets fallback immediately
useEffect(() => {
  const generateVignetteUrls = async () => {
    if (!vignettes || vignettes.length === 0) {
      // Set fallback data if no vignettes exist
      setDisplayVignettes([...]);
      return;
    }
    // ...
  };
  generateVignetteUrls();
}, [vignettes]);

// REPLACE WITH: Only set fallback after loading completes
useEffect(() => {
  const generateVignetteUrls = async () => {
    // Don't set fallback during initial loading
    if (isLoading) return;

    if (!vignettes || vignettes.length === 0) {
      // Only set fallback if loading is complete and still no data
      setDisplayVignettes([
        // ... fallback data
      ]);
      return;
    }
    // ... rest of logic
  };
  generateVignetteUrls();
}, [vignettes, isLoading]);
```

**Testing for Step 3:**
- [ ] Clear browser cache
- [ ] Hard reload page (Cmd+Shift+R)
- [ ] Verify skeleton loader shows first
- [ ] No flash of fallback content
- [ ] Smooth transition to actual content
- [ ] Test on slow 3G network
- [ ] Test on fast network
- [ ] Error state works if API fails

---

#### **STEP 4: Fix Item 1 - Vignettes Mobile Scroll** (1.5 hours)

**Part A: Fix JavaScript Logic**

**File: `src/pages/Vignettes.tsx`**

**Change 4.1** - Fix maxIndex calculation (line 146):
```typescript
// CURRENT (WRONG):
const maxIndex = Math.max(0, displayVignettes.length - itemsPerView);

// REPLACE WITH (CORRECT):
const maxIndex = Math.max(0, displayVignettes.length - 1);
```

**Change 4.2** - Navigation functions are already correct, but verify (lines 148-154):
```typescript
// These should already be correct, but double-check:
const nextSlide = () => {
  setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
};

const prevSlide = () => {
  setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
};
```

**Part B: Add CSS Scroll Snap**

**File: `src/index.css`**

**Change 4.3** - Add scroll-snap classes (insert around line 100):
```css
/* Vignettes Carousel Smooth Scrolling */
.vignettes-carousel-track {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.vignettes-carousel-item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
```

**Part C: Apply CSS Classes**

**File: `src/pages/Vignettes.tsx`**

**Change 4.4** - Update carousel container (lines 252-264):
```typescript
// CURRENT:

    {displayVignettes.map((vignette, index) => (

// REPLACE WITH:

    {displayVignettes.map((vignette, index) => (

```

**Testing for Step 4:**
- [ ] Mobile (< 768px): Shows 1 photo, arrows move 1, all photos reachable
- [ ] Tablet (768-1024px): Shows 2 photos, arrows move 1, all photos reachable
- [ ] Desktop (> 1024px): Shows 3 photos, arrows move 1, all photos reachable
- [ ] Rapid arrow clicks: No skipping photos
- [ ] Touch swipe: Smooth, moves 1 photo
- [ ] First photo reachable
- [ ] Last photo reachable
- [ ] Lightbox still works when clicking photo
- [ ] Auto-play still works (if enabled)

---

### **VERIFICATION CHECKLIST**

**Cross-Feature Testing:**
- [ ] Swipe navigation doesn't interfere with gallery carousel
- [ ] Swipe navigation doesn't interfere with vignettes carousel
- [ ] Swipe navigation doesn't interfere with lightbox
- [ ] All forms and inputs still work
- [ ] Vertical scrolling unaffected
- [ ] Admin pages work normally

**Performance:**
- [ ] No new console errors
- [ ] No performance degradation
- [ ] Smooth animations (60fps)
- [ ] No memory leaks

**Browser Testing:**
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox (desktop + mobile)
- [ ] Edge (desktop)

**Device Testing:**
- [ ] 320px width (iPhone SE)
- [ ] 375px width (iPhone 12/13)
- [ ] 390px width (iPhone 14)
- [ ] 768px width (iPad)
- [ ] 1024px+ (Desktop)

---

### **ESTIMATED TIME**

- Step 1 (Item 22): 30 minutes
- Step 2 (Item 20): 15 minutes
- Step 3 (Item 23): 1 hour
- Step 4 (Item 1): 1.5 hours
- Testing & Verification: 1 hour

**Total: 4 hours 15 minutes**

---

### **FILES TO BE MODIFIED**

1. `src/components/SwipeNavigator.tsx` - Fix page order and boundaries
2. `src/components/admin/EmailCommunication.tsx` - Fix modal sizing
3. `src/pages/Vignettes.tsx` - Fix loading state and scroll logic
4. `src/index.css` - Add scroll-snap CSS

**No new files needed** - Item 22 infrastructure already exists.

---

### **RISK ASSESSMENT**

**Low Risk:**
- Item 20 (Email popup) - CSS-only, admin-only
- Item 22 (Swipe navigation) - Small corrections to existing code

**Medium Risk:**
- Item 23 (Vignettes flash) - Requires careful state management
- Item 1 (Vignettes scroll) - Requires testing across screen sizes

**Mitigation:**
- Test each item individually before moving to next
- Keep changes isolated to specific components
- Verify no regressions in existing features

Implement the plan