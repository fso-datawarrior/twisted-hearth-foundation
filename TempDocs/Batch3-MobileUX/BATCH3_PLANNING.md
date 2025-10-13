# 📱 BATCH 3: MOBILE UX - Planning Document

**Date**: October 13, 2025  
**Priority**: 🟡 HIGH (Mobile user experience)  
**Total Items**: 4  
**Estimated Time**: 7-10 hours  
**Risk Level**: MEDIUM (mobile-specific challenges)  
**Status**: 📋 PLANNING PHASE

---

## 🎯 BATCH OBJECTIVE

Improve mobile user experience with better navigation, scroll behavior, and UI positioning.

---

## 📋 ITEMS IN THIS BATCH

### **Item 1: Vignettes Mobile Scroll** 🟡 HIGH
### **Item 20: Email Campaign Mobile Popup** 🟢 MEDIUM  
### **Item 22: Mobile Swipe Navigation** 🟡 HIGH  
### **Item 23: Vignettes Page Flash** 🟡 HIGH

---

## 🔍 ITEM 1: VIGNETTES MOBILE SCROLL

**Priority**: 🟡 HIGH  
**Type**: Bug/Enhancement  
**Area**: Frontend/Mobile/UX  
**Complexity**: MEDIUM  
**Time**: 3-4 hours

### Problem Statement

Vignettes page scrolls 2-3 photos at once on mobile. Arrow navigation also jumps multiple photos. Users want one photo at a time.

### User Feedback

> "Vignettes page needs to scroll one image at a time, not multiples, especially on mobile. Arrow navigations should also move one picture at a time."

### Current Behavior

- Desktop: Shows 2-3 vignettes at once
- Mobile: Only 1 vignette visible but scrolls past 2-3
- Arrow buttons: Move by `photosPerView` count (2-3)
- User sees: Photo 1 → Photo 4 (skipping 2-3)

### Desired Behavior

- Mobile: Scroll exactly 1 photo at a time
- Arrow buttons: Always move 1 photo (regardless of screen size)
- Smooth snap-to-photo scrolling
- No photos skipped

### Technical Approach

**Files to Check:**
- `src/pages/Vignettes.tsx` - Main vignettes page
- `src/components/MultiPreviewCarousel.tsx` - Carousel component (if used)

**Investigation Needed:**
1. How is scroll currently implemented?
2. What controls `itemsPerView`?
3. Arrow button logic
4. Touch swipe behavior

**Solution Strategy:**
1. **Arrow Navigation Fix**:
   - Change `nextSlide()` and `prevSlide()` to always increment by 1
   - Ignore `itemsPerView` for navigation
   - Keep `itemsPerView` for display layout only

2. **Scroll Snap**:
   - Add CSS `scroll-snap-type: x mandatory`
   - Add `scroll-snap-align: center` to each vignette
   - Ensure smooth scrolling

3. **Mobile-Specific Logic**:
   - Detect mobile viewport
   - Force single-photo navigation on mobile
   - Maintain multi-photo view on desktop (but single navigation)

### Testing Requirements

**Scenarios:**
- [ ] Mobile (320px-768px): One photo visible, arrows move 1
- [ ] Tablet (768px-1024px): Two photos visible, arrows move 1
- [ ] Desktop (1024px+): Three photos visible, arrows move 1
- [ ] Touch swipe on mobile: Moves 1 photo
- [ ] Keyboard arrows: Move 1 photo
- [ ] Rapid arrow clicks: No skipping

**Browsers:**
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Edge mobile

### Success Criteria

- [ ] Mobile shows 1 photo at a time
- [ ] Arrow buttons always move exactly 1 photo
- [ ] No photos are skipped
- [ ] Smooth snap-to-photo animation
- [ ] Works on all screen sizes
- [ ] Lightbox still works

---

## 🔍 ITEM 20: EMAIL CAMPAIGN MOBILE POPUP

**Priority**: 🟢 MEDIUM  
**Type**: Bug  
**Area**: Frontend/Mobile/Admin  
**Complexity**: LOW  
**Time**: 1 hour

### Problem Statement

When creating an email campaign in the admin panel, the verification popup is slightly off-screen on mobile devices.

### User Feedback

> "When creating email campaign, the verification popup is slightly off the screen on mobile."

### Current Behavior

- Admin creates email campaign
- Confirmation popup appears
- On mobile: Popup partially off-screen
- Admin can't see full message/buttons

### Desired Behavior

- Popup fully visible on all screen sizes
- Centered on screen
- All buttons accessible
- Proper padding from edges

### Technical Approach

**Files to Check:**
- `src/components/admin/EmailCampaignManager.tsx` (or similar)
- Modal/Dialog components used for confirmation
- CSS for modal positioning

**Investigation Needed:**
1. Which modal component is used? (shadcn Dialog?)
2. Current positioning CSS
3. Viewport constraints
4. Z-index issues?

**Solution Strategy:**
1. **Modal Positioning**:
   - Use `fixed` positioning with proper centering
   - Add viewport-aware max-width
   - Ensure proper padding (16px min from edges)

2. **Responsive Styles**:
   ```css
   .email-campaign-popup {
     position: fixed;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     max-width: calc(100vw - 32px);
     max-height: calc(100vh - 32px);
     overflow-y: auto;
   }
   ```

3. **Mobile-Specific**:
   - Test on small screens (320px)
   - Ensure buttons don't overflow
   - Add scrolling if content too tall

### Testing Requirements

**Devices:**
- [ ] iPhone SE (320px width)
- [ ] iPhone 12 (390px)
- [ ] Android small (360px)
- [ ] Tablet (768px)
- [ ] Desktop (verify no regression)

**Scenarios:**
- [ ] Create email campaign
- [ ] Popup appears centered
- [ ] All text visible
- [ ] All buttons accessible
- [ ] Can scroll if needed
- [ ] Can close popup
- [ ] Background overlay works

### Success Criteria

- [ ] Popup fully visible on mobile
- [ ] Centered on screen
- [ ] No content cut off
- [ ] Buttons accessible
- [ ] Works on smallest phones (320px)
- [ ] No desktop regression

---

## 🔍 ITEM 22: MOBILE SWIPE NAVIGATION

**Priority**: 🟡 HIGH  
**Type**: Enhancement/Bug  
**Area**: Frontend/Mobile/UX  
**Complexity**: MEDIUM  
**Time**: 2-3 hours

### Problem Statement

Mobile swipe only goes through browser history (visited pages). Swiping past homepage closes the app. Users want to swipe through main navigation pages in order.

### User Feedback

> "Swipe feature for mobile view seems to only swipe back to visited pages. Want to swipe through all main nav pages, stop at homepage (far left) and RSVP (far right). Currently swiping past homepage closes the app."

### Current Behavior

- Swipe left/right: Browser back/forward (history)
- Swipe past home: App closes (native browser behavior)
- Limited to pages user has visited
- No predictable navigation order

### Desired Behavior

- Swipe right: Next page in nav order
- Swipe left: Previous page in nav order
- Bounded: Homepage (leftmost) ↔ RSVP (rightmost)
- Stop at boundaries (no app close)
- Independent of browser history

### Navigation Order (Left → Right)

1. **Homepage** (leftmost boundary)
2. Vignettes
3. Schedule
4. Gallery
5. Discussion
6. Costumes
7. **RSVP** (rightmost boundary)

### Technical Approach

**Challenges:**
1. Override default browser swipe behavior
2. Detect swipe direction
3. Map current page to nav order
4. Prevent app close at boundaries
5. Smooth page transitions

**Solution Strategy:**

1. **Swipe Detection**:
   ```typescript
   // Use touch events
   const handleTouchStart = (e: TouchEvent) => {
     touchStartX = e.touches[0].clientX;
   };
   
   const handleTouchEnd = (e: TouchEvent) => {
     touchEndX = e.changedTouches[0].clientX;
     handleSwipe();
   };
   
   const handleSwipe = () => {
     const diff = touchStartX - touchEndX;
     if (Math.abs(diff) > 50) { // threshold
       if (diff > 0) {
         // Swipe left - go to next page
         navigateNext();
       } else {
         // Swipe right - go to previous page
         navigatePrevious();
       }
     }
   };
   ```

2. **Page Navigation Mapping**:
   ```typescript
   const NAV_ORDER = [
     '/',
     '/vignettes',
     '/schedule',
     '/gallery',
     '/discussion',
     '/costumes',
     '/rsvp'
   ];
   
   const getCurrentIndex = () => {
     const current = window.location.pathname;
     return NAV_ORDER.indexOf(current);
   };
   
   const navigateNext = () => {
     const index = getCurrentIndex();
     if (index < NAV_ORDER.length - 1) {
       router.push(NAV_ORDER[index + 1]);
     }
   };
   
   const navigatePrevious = () => {
     const index = getCurrentIndex();
     if (index > 0) {
       router.push(NAV_ORDER[index - 1]);
     }
   };
   ```

3. **Prevent Browser Swipe**:
   - Add `touch-action: pan-y` to prevent horizontal swipe-back
   - Or use `e.preventDefault()` on touch events
   - Test thoroughly (may interfere with scrolling)

4. **Boundary Handling**:
   - At homepage: No swipe right (or show visual feedback)
   - At RSVP: No swipe left (or show visual feedback)
   - Add haptic feedback (if supported)

**Implementation Location:**
- Root layout component
- Or custom hook (`useSwipeNavigation`)
- Apply globally but only on mobile

### Testing Requirements

**Functionality:**
- [ ] Swipe left goes to next page
- [ ] Swipe right goes to previous page
- [ ] Homepage: Can't swipe right
- [ ] RSVP: Can't swipe left
- [ ] App doesn't close on over-swipe
- [ ] Works on all main nav pages
- [ ] Doesn't interfere with gallery swipe
- [ ] Doesn't interfere with image carousels

**Edge Cases:**
- [ ] Fast swipes
- [ ] Diagonal swipes (should favor vertical/horizontal)
- [ ] Swipe during page load
- [ ] Swipe on admin pages (should not work)
- [ ] Vertical scroll still works
- [ ] Horizontal scroll in carousels still works

**Devices:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Various screen sizes

### Success Criteria

- [ ] Swipe navigation works on mobile
- [ ] Follows defined page order
- [ ] Stops at boundaries
- [ ] App doesn't close
- [ ] Smooth transitions
- [ ] Doesn't break other swipe features
- [ ] Desktop unaffected

---

## 🔍 ITEM 23: VIGNETTES PAGE FLASH

**Priority**: 🟡 HIGH  
**Type**: Bug  
**Area**: Frontend/Performance  
**Complexity**: MEDIUM  
**Time**: 1-2 hours

### Problem Statement

On first load of the vignettes page, users briefly see old vignettes before the current system loads. Need to remove old vignettes or fix loading order.

### User Feedback

> "On first load for vignettes page, you quickly see the old ones before current system loads - need to hunt down and remove."

### Current Behavior

- Page loads
- Old vignettes flash on screen (0.1-0.5 seconds)
- Current vignettes load and replace them
- Jarring visual experience

### Desired Behavior

- Page loads with loading skeleton OR blank
- Current vignettes load smoothly
- No flash of old content
- Professional loading experience

### Technical Approach

**Possible Causes:**
1. **Cached/Static Data**: Old vignettes in initial HTML
2. **Loading Order**: Static data loads before database query
3. **No Loading State**: Component renders before data ready
4. **Build-time Data**: Old vignettes baked into build

**Investigation Needed:**
1. Check `src/pages/Vignettes.tsx`
2. Look for hardcoded vignette data
3. Check initial state values
4. Review data fetching logic
5. Check SSR/SSG configuration (if applicable)

**Solution Strategy:**

1. **Add Loading State**:
   ```typescript
   const { data: vignettes, isLoading } = useQuery({
     queryKey: ['active-vignettes'],
     queryFn: fetchVignettes,
   });
   
   if (isLoading) {
     return <VignettesSkeletonLoader />;
   }
   ```

2. **Remove Static Data**:
   - Search for hardcoded vignette arrays
   - Remove any default/fallback vignettes
   - Ensure initial state is empty or null

3. **Conditional Rendering**:
   ```typescript
   // Don't render until data is ready
   {vignettes && vignettes.length > 0 && (
     <VignetteCarousel photos={vignettes} />
   )}
   ```

4. **Loading Skeleton**:
   - Create skeleton loader matching vignette layout
   - Show immediately on page load
   - Replace with real content when ready

### Testing Requirements

**Scenarios:**
- [ ] First load (clear cache): No flash
- [ ] Reload: No flash
- [ ] Slow network (throttle 3G): No flash
- [ ] Fast network: Smooth load
- [ ] Mobile: No flash
- [ ] Desktop: No flash

**Edge Cases:**
- [ ] No vignettes in database
- [ ] Network error
- [ ] Very slow query (>5 seconds)

### Success Criteria

- [ ] No flash of old content
- [ ] Smooth loading experience
- [ ] Loading skeleton shows (if used)
- [ ] No "jump" when content loads
- [ ] Works on all browsers
- [ ] Works on all network speeds

---

## 🎯 BATCH 3 IMPLEMENTATION ORDER

### **Recommended Order:**

1. **Item 20: Email Popup** (1 hour)
   - Quick CSS fix
   - Low risk
   - Admin-only
   - Can test independently

2. **Item 23: Vignettes Flash** (1-2 hours)
   - Quick win
   - Improves perceived performance
   - Single page change

3. **Item 1: Vignettes Scroll** (3-4 hours)
   - Core mobile UX
   - Multiple screen sizes to test
   - Foundation for mobile improvements

4. **Item 22: Swipe Navigation** (2-3 hours)
   - Most complex
   - Requires thorough testing
   - Could interfere with other features
   - Save for last after other mobile fixes

**Total**: 7-10 hours

---

## 📚 TESTING STRATEGY

### **Mobile Testing Priorities:**
1. Real devices preferred over emulators
2. Test on smallest screens first (320px)
3. Test on iOS Safari (most restrictive)
4. Test swipe vs scroll interactions
5. Test touch vs mouse events

### **Devices to Test:**
- iPhone SE (smallest iOS)
- iPhone 12/13 (common iOS)
- Small Android (360px)
- Medium Android (390px)
- iPad (768px)
- Desktop (verify no regressions)

### **Browser Priority:**
1. Mobile Safari (iOS) - CRITICAL
2. Chrome Mobile (Android) - CRITICAL
3. Chrome Desktop - HIGH
4. Safari Desktop - MEDIUM
5. Firefox - MEDIUM
6. Edge - LOW

---

## ⚠️ RISKS & MITIGATION

### **Risk 1: Swipe Navigation Breaks Other Features**
- **Mitigation**: Implement as optional feature (behind flag)
- **Mitigation**: Extensive testing of all swipe interactions
- **Mitigation**: Easy rollback if issues arise

### **Risk 2: Touch Events Interfere with Scrolling**
- **Mitigation**: Use `passive` event listeners
- **Mitigation**: Proper `touch-action` CSS
- **Mitigation**: Threshold detection for swipe vs scroll

### **Risk 3: Mobile Browser Compatibility**
- **Mitigation**: Progressive enhancement
- **Mitigation**: Fallback to standard navigation
- **Mitigation**: Feature detection

---

## 📝 DOCUMENTATION REQUIREMENTS

### **For Each Item:**
- [ ] Before/after behavior documented
- [ ] Code changes listed
- [ ] Testing results recorded
- [ ] Known issues noted

### **Completion Report Must Include:**
- [ ] All 4 items completed
- [ ] Mobile testing results
- [ ] Browser compatibility matrix
- [ ] Performance impact
- [ ] Known limitations

---

## 🚀 NEXT STEPS

1. ✅ Review this planning document
2. ⏳ Investigate current implementations
3. ⏳ Create detailed technical specs for each item
4. ⏳ Design solutions with code examples
5. ⏳ Create Lovable-ready prompts
6. ⏳ Execute in recommended order
7. ⏳ Test thoroughly on mobile devices
8. ⏳ Create completion report

---

**Last Updated**: October 13, 2025  
**Status**: 📋 READY FOR INVESTIGATION  
**Next**: Code investigation and detailed technical specs

