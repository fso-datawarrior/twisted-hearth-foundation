# 🔴 BATCH 2: CRITICAL BUGS - Planning Document

**Date**: October 13, 2025  
**Priority**: 🔴 CRITICAL  
**Total Items**: 3  
**Estimated Time**: 8-12 hours  
**Risk Level**: HIGH (requires investigation)  
**Status**: 📋 PLANNING PHASE

---

## 🎯 BATCH OBJECTIVE

Fix critical blocking issues that prevent users from accessing core functionality or send incorrect information to guests.

---

## 📋 ITEMS IN THIS BATCH

### **Item 6: Gallery Loading Issues** 🔴 CRITICAL
### **Item 15: Email Template Verification** 🔴 CRITICAL  
### **Item 24: Gallery Performance Optimization** 🟡 HIGH

---

## 🔍 ITEM 6: GALLERY LOADING ISSUES

**Priority**: 🔴 CRITICAL  
**Type**: Bug  
**Area**: Frontend/Performance  
**Complexity**: HIGH (Investigation Required)  
**Time**: 4-6 hours

### Problem Statement

Gallery page freezes in Edge browser on mobile devices (specifically Kat's phone). This blocks users from viewing event photos.

### User Feedback
> "Check the gallery page for loading issues on Kat's phone in Edge browser - froze a few times."

### Investigation Plan

**Step 1: Reproduce the Issue** (30 min)
- Test on Edge mobile (iOS/Android)
- Test on different devices
- Document exact freeze conditions
- Check browser console for errors

**Step 2: Analyze Current Implementation** (1 hour)
- Review `src/pages/Gallery.tsx`
- Check image loading strategy
- Review event listeners
- Check for memory leaks
- Analyze bundle size

**Step 3: Browser DevTools Analysis** (1 hour)
- Use Edge DevTools on mobile
- Monitor Performance tab during freeze
- Check Memory usage
- Network waterfall analysis
- Console error logs

**Step 4: Identify Root Cause** (Categories to investigate)

**Possible Causes:**
1. **Memory Issues**:
   - Too many images loaded at once
   - Large image file sizes
   - Memory leak from event listeners
   - Inefficient React re-renders

2. **Edge-Specific Issues**:
   - CSS Grid/Flexbox rendering bugs
   - Image decoding issues
   - Touch event handling
   - Viewport height calculations

3. **Network Issues**:
   - Slow image loading blocking UI
   - Race conditions
   - Promise handling errors

4. **JavaScript Errors**:
   - Unhandled exceptions
   - Infinite loops
   - State update issues

### Technical Approach

**Quick Fixes to Try First:**
```typescript
// 1. Add error boundaries
<ErrorBoundary>
  <GalleryGrid />
</ErrorBoundary>

// 2. Lazy load images with Intersection Observer
import { useInView } from 'react-intersection-observer';

// 3. Limit initial render
const [visibleCount, setVisibleCount] = useState(20);

// 4. Add loading indicators
{loading && <Skeleton />}

// 5. Optimize images
<img 
  loading="lazy" 
  decoding="async"
  srcSet="..."
/>
```

**If Quick Fixes Don't Work:**
- Implement virtual scrolling (react-window)
- Add pagination
- Reduce image quality on mobile
- Use progressive image loading

### Files to Check

**Primary:**
- `src/pages/Gallery.tsx` - Main gallery page
- `src/components/gallery/*.tsx` - Gallery components
- Image loading hooks/utilities

**Related:**
- Memory management patterns
- Event listener cleanup
- Image optimization pipeline

### Testing Requirements

**Browsers:**
- [ ] Edge Mobile (iOS)
- [ ] Edge Mobile (Android)
- [ ] Chrome Mobile (comparison)
- [ ] Safari Mobile (comparison)

**Devices:**
- [ ] iPhone (Kat's device if possible)
- [ ] Android devices
- [ ] Various screen sizes

**Scenarios:**
- [ ] Fresh page load
- [ ] Scroll through gallery
- [ ] Click to view full image
- [ ] Switch between gallery views
- [ ] Navigate away and back
- [ ] Long duration viewing (memory test)

### Success Criteria

- [ ] No freezes in Edge mobile
- [ ] Smooth scrolling
- [ ] Images load progressively
- [ ] No console errors
- [ ] Memory usage stable (<100MB increase)
- [ ] Page load time <3 seconds

---

## 📧 ITEM 15: EMAIL TEMPLATE VERIFICATION

**Priority**: 🔴 CRITICAL  
**Type**: Bug/Data Accuracy  
**Area**: Backend/Email  
**Complexity**: LOW (Audit & Update)  
**Time**: 2-3 hours

### Problem Statement

Email templates contain incorrect address information. Currently shows "Denver" but should show "1816 White Feather Drive Longmont Colorado 80504".

### User Feedback
> "Check all email templates for correct date, address, and any other information. I noticed the address says Denver and it should be my address in full which is 1816 White Feather Drive Longmont Colorado 80504."

### Audit Checklist

**Email Templates to Check:**

**Supabase Edge Functions:**
1. `supabase/functions/send-rsvp-confirmation/index.ts`
2. `supabase/functions/send-contribution-confirmation/index.ts`
3. Any other confirmation emails

**Local Email Templates:**
1. `email-templates/01-magic-link.html`
2. `email-templates/02-confirm-signup.html`
3. `email-templates/03-invite-user.html`
4. `email-templates/04-change-email.html`
5. `email-templates/05-reset-password.html`
6. `email-templates/06-reauthenticate.html`

### Information to Verify

**Address Information:**
- ❌ Current: "Denver" (wrong)
- ✅ Correct: "1816 White Feather Drive, Longmont, Colorado 80504"

**Event Information:**
- Event Date: [Need to verify]
- Event Time: [Need to verify]
- RSVP Deadline: [Need to verify]

**Contact Information:**
- Host Names: Jamie & Kat Ruth ✅
- Website: 2025.partytillyou.rip ✅
- Email: [Need to verify]
- Phone: [If included, verify]

**Other Details:**
- Theme: "Twisted Fairytale Halloween Bash" ✅
- Dress Code: [Verify if included]
- Parking Info: [Verify if included]
- COVID protocols: [Verify if relevant]

### Implementation Steps

**Step 1: Code Review** (30 min)
```bash
# Search for "Denver" in codebase
grep -r "Denver" supabase/ email-templates/ src/

# Search for address patterns
grep -r "address" supabase/functions/
```

**Step 2: Update Edge Functions** (1 hour)
```typescript
// In send-rsvp-confirmation/index.ts
const eventDetails = {
  address: "1816 White Feather Drive",
  city: "Longmont",
  state: "Colorado",
  zip: "80504",
  fullAddress: "1816 White Feather Drive, Longmont, Colorado 80504"
};
```

**Step 3: Update Email Templates** (30 min)
- Replace all address references
- Verify HTML formatting
- Ensure mobile responsiveness

**Step 4: Test Email Sending** (1 hour)
- Send test RSVP confirmation
- Send test contribution confirmation
- Verify on desktop email client
- Verify on mobile email app
- Check spam folder rendering

### Files to Modify

**Critical:**
- `supabase/functions/send-rsvp-confirmation/index.ts`
- `supabase/functions/send-contribution-confirmation/index.ts`

**If Needed:**
- `email-templates/*.html` (all templates)
- Any email configuration files
- Environment variables

### Testing Checklist

**Email Delivery:**
- [ ] Test RSVP confirmation email
- [ ] Test contribution confirmation email
- [ ] Verify subject lines
- [ ] Check sender name/email

**Content Verification:**
- [ ] Address correct in all templates
- [ ] Date correct
- [ ] Time correct
- [ ] Links work (website, RSVP)
- [ ] Images load

**Client Testing:**
- [ ] Gmail (desktop)
- [ ] Gmail (mobile)
- [ ] Outlook
- [ ] Apple Mail
- [ ] Yahoo Mail

**Accessibility:**
- [ ] Plain text version available
- [ ] Alt text for images
- [ ] Readable without images

### Success Criteria

- [ ] All email templates have correct address
- [ ] All dates/times verified
- [ ] Test emails sent successfully
- [ ] Content displays correctly across clients
- [ ] No broken links
- [ ] Mobile-friendly

---

## 🚀 ITEM 24: GALLERY PERFORMANCE OPTIMIZATION

**Priority**: 🟡 HIGH  
**Type**: Performance Enhancement  
**Area**: Frontend/Performance  
**Complexity**: MEDIUM  
**Time**: 4-5 hours  
**Related**: Item 6 (may resolve freezing)

### Problem Statement

Gallery loads all images at once, causing slow initial load and potential memory issues on mobile devices.

### User Feedback
> "On gallery page, speed things up by having only a handful of images load at a time or research better options (lazy loading, pagination, infinite scroll)."

### Current State Analysis

**Likely Issues:**
- All images fetched in single query
- All images rendered immediately
- No lazy loading
- Large image files
- No image optimization

### Optimization Strategy

**Approach 1: Lazy Loading with Intersection Observer** (Recommended)

```typescript
import { useInView } from 'react-intersection-observer';

function GalleryImage({ src, alt }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className="aspect-square">
      {inView ? (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Skeleton />
      )}
    </div>
  );
}
```

**Approach 2: Pagination**

```typescript
const [page, setPage] = useState(1);
const IMAGES_PER_PAGE = 20;

const { data, isLoading } = useQuery({
  queryKey: ['gallery', page],
  queryFn: () => fetchGalleryImages(page, IMAGES_PER_PAGE)
});

<Pagination 
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

**Approach 3: Infinite Scroll**

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['gallery'],
  queryFn: ({ pageParam = 0 }) => fetchGallery(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// Trigger on scroll
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

**Approach 4: Virtual Scrolling** (For very large galleries)

```typescript
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  columnWidth={300}
  height={800}
  rowCount={Math.ceil(images.length / 3)}
  rowHeight={300}
  width={960}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <GalleryImage image={images[rowIndex * 3 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

### Image Optimization

**1. Responsive Images**
```typescript
<img
  src={image.url}
  srcSet={`
    ${image.thumbnail} 400w,
    ${image.medium} 800w,
    ${image.large} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  loading="lazy"
  decoding="async"
/>
```

**2. Blur Hash Placeholder**
```typescript
import { Blurhash } from 'react-blurhash';

<Blurhash
  hash={image.blurHash}
  width="100%"
  height="100%"
  resolutionX={32}
  resolutionY={32}
  punch={1}
/>
```

**3. Progressive Loading**
```typescript
const [imageLoaded, setImageLoaded] = useState(false);

<div className="relative">
  {!imageLoaded && <Skeleton />}
  <img
    src={image.url}
    onLoad={() => setImageLoaded(true)}
    className={imageLoaded ? 'opacity-100' : 'opacity-0'}
  />
</div>
```

### Implementation Plan

**Phase 1: Quick Wins** (2 hours)
1. Add `loading="lazy"` to all images
2. Add loading skeletons
3. Limit initial render to 20-30 images
4. Add "Load More" button

**Phase 2: Advanced Optimization** (2-3 hours)
1. Implement Intersection Observer
2. Add infinite scroll OR pagination
3. Optimize image sizes
4. Add progressive loading

**Phase 3: Edge Case Handling** (1 hour)
1. Error handling for failed images
2. Retry logic
3. Empty state
4. Network error state

### Files to Modify

**Primary:**
- `src/pages/Gallery.tsx`
- Gallery grid component
- Gallery item component

**May Need:**
- Image loading utility functions
- Custom hooks (useImageLoad, useInfiniteScroll)
- Skeleton components

### Performance Targets

**Before Optimization:**
- Initial Load: ~5-10s
- Images Loaded: All at once
- Memory: High (>200MB)
- Scroll FPS: <30

**After Optimization:**
- Initial Load: <2s
- Images Loaded: Progressive
- Memory: Stable (<100MB)
- Scroll FPS: 60

### Testing Requirements

**Performance Testing:**
- [ ] Lighthouse score >90
- [ ] Network waterfall optimized
- [ ] Memory usage stable
- [ ] No layout shifts (CLS <0.1)

**Functionality Testing:**
- [ ] All images load eventually
- [ ] Lazy loading works
- [ ] Smooth scrolling
- [ ] Works on slow 3G
- [ ] Works on fast WiFi

**Cross-Device:**
- [ ] Mobile (low-end)
- [ ] Mobile (high-end)
- [ ] Tablet
- [ ] Desktop

### Success Criteria

- [ ] Page load time reduced by 60%
- [ ] Initial render only loads visible images
- [ ] Smooth 60fps scrolling
- [ ] Memory usage <100MB
- [ ] No freezing in Edge
- [ ] User can view all images

---

## 🎯 BATCH 2 IMPLEMENTATION ORDER

### **Recommended Order:**

1. **Item 15: Email Template Fix** (2-3 hours)
   - Quick, low-risk
   - Critical data accuracy
   - No dependencies

2. **Item 24: Gallery Performance** (4-5 hours)
   - Foundation for Item 6
   - May resolve freezing issues
   - Can be tested independently

3. **Item 6: Gallery Freezing** (4-6 hours)
   - Requires Item 24 first
   - Complex debugging
   - Edge-specific testing

**Total**: 10-14 hours

---

## 📚 NEXT STEPS

1. ✅ Review this planning document
2. ⏳ Get user approval on approach
3. ⏳ Start with Item 15 (Email templates)
4. ⏳ Move to Item 24 (Gallery performance)
5. ⏳ Finish with Item 6 (Gallery freezing)
6. ⏳ Create Lovable prompts for each item
7. ⏳ Test thoroughly before moving to Batch 3

---

## 🚨 RISK ASSESSMENT

**Item 15: Email Templates** - LOW RISK
- Simple text updates
- Easy to test
- Quick rollback

**Item 24: Gallery Performance** - MEDIUM RISK
- May require significant refactoring
- Need to preserve functionality
- Affects user experience

**Item 6: Gallery Freezing** - HIGH RISK
- Browser-specific issue
- May be hard to reproduce
- Requires device testing
- May need multiple iterations

---

**Status**: 📋 Ready for Review  
**Next**: Get user approval to proceed

