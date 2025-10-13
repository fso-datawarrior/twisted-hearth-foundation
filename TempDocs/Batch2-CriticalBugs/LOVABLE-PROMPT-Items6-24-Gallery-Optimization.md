# 🔴 GALLERY PERFORMANCE & EDGE FREEZING FIX
## Items 6 & 24: Complete Gallery Optimization

**Priority**: 🔴 CRITICAL  
**Estimated Time**: 6-8 hours  
**Risk Level**: MEDIUM (performance-critical changes)  
**Files to Modify**: 5-7 files

---

## 🎯 THE PROBLEMS

### **Problem 1: Gallery Freezing in Edge Browser** (Item 6)
**User Report**: "Gallery page freezes on Kat's phone in Edge browser - froze a few times."

**Critical Impact**:
- Users cannot view event photos
- Edge mobile is a common browser
- Blocking core functionality

### **Problem 2: Gallery Performance Issues** (Item 24)
**Current Behavior**:
- All images load simultaneously on page load
- No lazy loading = massive memory usage
- Slow initial page load (~5-10s)
- Potential memory leaks from event listeners
- No pagination or progressive loading

**Performance Targets**:
- ❌ Current: All images loaded at once, >200MB memory, <30fps scroll
- ✅ Goal: Progressive loading, <100MB memory, 60fps scroll, <2s initial load

---

## 🔍 ROOT CAUSE ANALYSIS

### **Current Implementation Issues**:

1. **All Photos Loaded Immediately** (`src/pages/Gallery.tsx` line 53-70):
```typescript
const loadImages = async () => {
  setLoading(true);
  try {
    // ❌ PROBLEM: Fetches ALL approved photos at once
    const { data: approved, error: approvedError } = await getApprovedPhotos();
    setApprovedPhotos(approved || []);  // Could be 100+ photos!
    
    const { data: user, error: userError } = await getUserPhotos();
    setUserPhotos(user || []);
  } finally {
    setLoading(false);
  }
};
```

2. **All Photos Rendered** (line 330-354):
```typescript
// ❌ PROBLEM: Renders ALL photos in PhotoCarousel
<PhotoCarousel
  photos={approvedPhotos}  // All photos rendered!
  photosPerView={photosPerView}
  // ...
/>
```

3. **PhotoCard Creates Signed URLs for Every Photo** (`src/components/gallery/PhotoCard.tsx` line 48-66):
```typescript
useEffect(() => {
  const loadUrl = async () => {
    // ❌ PROBLEM: Every photo calls getPhotoUrl immediately
    const url = await getPhotoUrl(photo.storage_path);
    setImageUrl(url || null);
  };
  loadUrl();
}, [photo.storage_path, getPhotoUrl]);
```

4. **No Intersection Observer** - Images load even when off-screen

5. **No Pagination** - All data fetched from database at once

6. **Edge-Specific Issues**:
   - Large DOM tree (100+ img elements)
   - Memory not released when scrolling
   - Touch event handlers not optimized
   - No image decoding optimization

---

## 🛠️ SOLUTION: 6-PHASE IMPLEMENTATION

---

## **PHASE 1: ADD PAGINATION TO DATABASE QUERIES** (1 hour)

### Files to Modify:
- `src/lib/photo-api.ts`

### Changes:

**1.1: Update `getApprovedPhotos` function** (line 42):
```typescript
/**
 * Get approved photos for public gallery with pagination
 */
export const getApprovedPhotos = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Photo[] | null; error: any; totalCount: number }> => {
  // Get total count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true);

  // Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, is_favorite, likes_count, created_at, updated_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data as any, error, totalCount: count || 0 };
};
```

**1.2: Update `getUserPhotos` function** (line 55):
```typescript
/**
 * Get user's own photos with pagination
 */
export const getUserPhotos = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Photo[] | null; error: any; totalCount: number }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: [], error: userError || new Error('Not authenticated'), totalCount: 0 };
  }
  const userId = userData.user.id;

  // Get total count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, is_favorite, likes_count, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data as any, error, totalCount: count || 0 };
};
```

---

## **PHASE 2: ADD LAZY IMAGE LOADING HOOK** (1 hour)

### Files to Create:
- `src/hooks/useLazyImage.ts` ⭐ NEW FILE

### Implementation:

**2.1: Create custom hook** (NEW FILE):
```typescript
import { useState, useEffect, useRef } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useLazyImage = (
  shouldLoad: boolean = true,
  options: UseLazyImageOptions = {}
) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldLoad || hasLoaded) return;
    
    const element = ref.current;
    if (!element) return;

    // Create IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px', // Start loading 50px before visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad, hasLoaded, options.threshold, options.rootMargin]);

  return { ref, isInView, hasLoaded };
};
```

---

## **PHASE 3: UPDATE PhotoCard WITH LAZY LOADING** (1 hour)

### Files to Modify:
- `src/components/gallery/PhotoCard.tsx`

### Changes:

**3.1: Import the hook and update PhotoCard component** (line 1):
```typescript
import { useLazyImage } from "@/hooks/useLazyImage"; // ADD THIS
```

**3.2: Update PhotoCard component** (line 27-66):
```typescript
export const PhotoCard = ({ 
  photo, 
  onLike, 
  getPhotoUrl, 
  showStatus, 
  showEditControls, 
  showUserActions,
  onUpdate, 
  onDelete,
  onFavorite,
  onEmojiReaction,
  onCaptionUpdate,
  allowCaptionEdit,
  onImageClick
}: PhotoCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(photo.caption || '');
  const [charCount, setCharCount] = useState(photo.caption?.length || 0);

  // ✅ ADD: Lazy loading with Intersection Observer
  const { ref, isInView, hasLoaded } = useLazyImage(true, {
    threshold: 0.1,
    rootMargin: '100px', // Start loading 100px before visible
  });

  // ✅ UPDATE: Only load URL when image is in view
  useEffect(() => {
    if (!isInView && !hasLoaded) return; // Don't load until visible

    const loadUrl = async () => {
      try {
        if (!getPhotoUrl) {
          setImageUrl(photo.storage_path);
        } else {
          const url = await getPhotoUrl(photo.storage_path);
          setImageUrl(url || null);
        }
      } catch (error) {
        console.error('Error loading photo URL:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUrl();
  }, [photo.storage_path, getPhotoUrl, isInView, hasLoaded]); // ✅ ADD: isInView, hasLoaded dependencies

  // ... rest of component stays the same ...

  return (
    <div className="flex flex-col gap-2 w-full" ref={ref}> {/* ✅ ADD: ref */}
      {/* Photo Container */}
      <div 
        className={`group relative aspect-[16/9] min-h-[150px] bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 transition-all [@media(hover:hover)]:hover:border-accent-gold/50 ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={() => onImageClick?.(photo)}
      >
        {loading || !isInView ? ( {/* ✅ UPDATE: Show loading if not in view */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
          </div>
        ) : (
          <>
            {imageUrl ? (
              <img
                src={imageUrl}
                srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                alt={photo.caption || 'Gallery photo'}
                width="800"
                height="450"
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async" // ✅ ADD: Edge performance optimization
                onError={(e) => {
                  console.error('[PhotoCard] Image load failed:', {
                    photoId: photo.id,
                    src: imageUrl.substring(0, 100)
                  });
                  setImageUrl(null);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs md:text-sm">Photo unavailable</span>
              </div>
            )}
            
            {/* ... rest of card content ... */}
          </>
        )}
      </div>

      {/* ... rest of component unchanged ... */}
    </div>
  );
};
```

---

## **PHASE 4: UPDATE Gallery.tsx WITH PAGINATION** (2 hours)

### Files to Modify:
- `src/pages/Gallery.tsx`

### Changes:

**4.1: Add pagination state** (line 28):
```typescript
const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
const [uploading, setUploading] = useState(false);
const [loading, setLoading] = useState(true);
const [photosPerView, setPhotosPerView] = useState(1);

// ✅ ADD: Pagination state
const [approvedPage, setApprovedPage] = useState(1);
const [approvedTotal, setApprovedTotal] = useState(0);
const [userPage, setUserPage] = useState(1);
const [userTotal, setUserTotal] = useState(0);
const [loadingMore, setLoadingMore] = useState(false);

const PAGE_SIZE = 20; // Load 20 photos at a time

const { toast } = useToast();
```

**4.2: Update loadImages function** (line 53):
```typescript
const loadImages = async (loadMore: boolean = false) => {
  if (loadMore) {
    setLoadingMore(true);
  } else {
    setLoading(true);
  }

  try {
    // Load approved photos with pagination
    const currentApprovedPage = loadMore ? approvedPage + 1 : 1;
    const { data: approved, error: approvedError, totalCount: approvedCount } = 
      await getApprovedPhotos(currentApprovedPage, PAGE_SIZE);
    
    if (approvedError) throw approvedError;
    
    if (loadMore) {
      // Append to existing photos
      setApprovedPhotos(prev => [...prev, ...(approved || [])]);
      setApprovedPage(currentApprovedPage);
    } else {
      // Replace photos
      setApprovedPhotos(approved || []);
      setApprovedPage(1);
    }
    setApprovedTotal(approvedCount);

    // Load user's own photos with pagination
    const currentUserPage = loadMore ? userPage + 1 : 1;
    const { data: user, error: userError, totalCount: userCount } = 
      await getUserPhotos(currentUserPage, PAGE_SIZE);
    
    if (userError) throw userError;
    
    if (loadMore) {
      // Append to existing photos
      setUserPhotos(prev => [...prev, ...(user || [])]);
      setUserPage(currentUserPage);
    } else {
      // Replace photos
      setUserPhotos(user || []);
      setUserPage(1);
    }
    setUserTotal(userCount);
  } catch (error) {
    console.error('Error loading images:', error);
    toast({
      title: "Error loading photos",
      description: "Please try refreshing the page",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};
```

**4.3: Add "Load More" buttons** (after PhotoCarousel components):
```typescript
{/* Approved Photos Section */}
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="w-full h-64 rounded-lg" />
    ))}
  </div>
) : approvedPhotos.length > 0 ? (
  <div className="mb-12">
    <PhotoCarousel
      photos={approvedPhotos}
      onLike={handleLike}
      getPhotoUrl={getPhotoUrl}
      onFavorite={handleFavorite}
      onEmojiReaction={handleEmojiReaction}
      photosPerView={photosPerView}
      className="mb-6"
    />
    
    {/* ✅ ADD: Load More button for approved photos */}
    {approvedPhotos.length < approvedTotal && (
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => loadImages(true)}
          disabled={loadingMore}
          className="bg-accent-gold text-ink hover:bg-accent-gold/80"
        >
          {loadingMore ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink mr-2" />
              Loading...
            </>
          ) : (
            `Load More Photos (${approvedPhotos.length} of ${approvedTotal})`
          )}
        </Button>
      </div>
    )}
  </div>
) : (
  <EmptyGalleryState />
)}

{/* My Photos Section */}
{loading ? (
  // ... skeleton ...
) : userPhotos.length > 0 && (
  <div className="mb-12">
    <h2 className="font-subhead text-2xl mb-6 text-accent-gold">
      My Photos
    </h2>
    <PhotoCarousel
      photos={userPhotos}
      onLike={handleLike}
      getPhotoUrl={getPhotoUrl}
      showStatus={true}
      showUserActions={true}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onFavorite={handleFavorite}
      onEmojiReaction={handleEmojiReaction}
      onCaptionUpdate={handleCaptionUpdate}
      photosPerView={photosPerView}
      className="mb-4"
    />
    
    {/* ✅ ADD: Load More button for user photos */}
    {userPhotos.length < userTotal && (
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => loadImages(true)}
          disabled={loadingMore}
          className="bg-accent-gold text-ink hover:bg-accent-gold/80"
        >
          {loadingMore ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink mr-2" />
              Loading...
            </>
          ) : (
            `Load More (${userPhotos.length} of ${userTotal})`
          )}
        </Button>
      </div>
    )}
  </div>
)}
```

---

## **PHASE 5: EDGE BROWSER OPTIMIZATIONS** (1 hour)

### Files to Modify:
- `src/pages/Gallery.tsx`
- `src/components/gallery/PhotoCarousel.tsx`

### Changes:

**5.1: Add Edge-specific CSS fixes** to `src/index.css`:
```css
/* Gallery Edge Browser Optimizations */
.gallery-container {
  /* Fix Edge rendering issues */
  transform: translateZ(0);
  will-change: auto;
}

/* Optimize touch scrolling for Edge mobile */
.gallery-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Prevent memory leaks from transforms */
.photo-card-container {
  contain: layout style paint;
}

/* Edge image rendering optimization */
img[loading="lazy"] {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
```

**5.2: Update Gallery.tsx** - Add cleanup for event listeners (line 36):
```typescript
// Dynamic photos per view based on window width
useEffect(() => {
  const updatePhotosPerView = () => {
    if (window.innerWidth >= 1280) setPhotosPerView(5);
    else if (window.innerWidth >= 1024) setPhotosPerView(4);
    else if (window.innerWidth >= 640) setPhotosPerView(3);
    else setPhotosPerView(2);
  };
  
  updatePhotosPerView();
  
  // ✅ UPDATE: Use throttled listener for Edge performance
  let timeoutId: NodeJS.Timeout;
  const throttledUpdate = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(updatePhotosPerView, 150);
  };
  
  window.addEventListener('resize', throttledUpdate);
  
  // ✅ CRITICAL: Cleanup listener
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', throttledUpdate);
  };
}, []);
```

**5.3: Add memory cleanup** (new useEffect at line 70):
```typescript
// ✅ ADD: Cleanup photo URLs when component unmounts (Edge memory fix)
useEffect(() => {
  return () => {
    // Revoke any object URLs to prevent memory leaks
    approvedPhotos.forEach(photo => {
      if (photo.storage_path && photo.storage_path.startsWith('blob:')) {
        URL.revokeObjectURL(photo.storage_path);
      }
    });
    userPhotos.forEach(photo => {
      if (photo.storage_path && photo.storage_path.startsWith('blob:')) {
        URL.revokeObjectURL(photo.storage_path);
      }
    });
  };
}, [approvedPhotos, userPhotos]);
```

---

## **PHASE 6: ADD PERFORMANCE MONITORING** (30 min)

### Files to Modify:
- `src/pages/Gallery.tsx`

### Changes:

**6.1: Add performance logging** (line 53):
```typescript
const loadImages = async (loadMore: boolean = false) => {
  // ✅ ADD: Performance monitoring
  const startTime = performance.now();
  console.log(`[Gallery] Loading images - loadMore: ${loadMore}, page: ${loadMore ? approvedPage + 1 : 1}`);

  if (loadMore) {
    setLoadingMore(true);
  } else {
    setLoading(true);
  }

  try {
    // ... existing load code ...

    // ✅ ADD: Log performance
    const loadTime = performance.now() - startTime;
    console.log(`[Gallery] Images loaded in ${loadTime.toFixed(2)}ms - Approved: ${approvedPhotos.length}/${approvedTotal}, User: ${userPhotos.length}/${userTotal}`);
    
    // ✅ ADD: Memory usage (Edge debugging)
    if (performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      console.log(`[Gallery] Memory usage: ${memoryMB} MB`);
    }
  } catch (error) {
    // ... error handling ...
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};
```

---

## 🔍 TESTING REQUIREMENTS

### **Critical Tests:**

#### **Functionality:**
- [ ] Images load progressively (only visible ones)
- [ ] "Load More" button works
- [ ] Scroll is smooth (60fps target)
- [ ] No images are skipped
- [ ] Lightbox still works
- [ ] Upload still works

#### **Performance:**
- [ ] Initial page load <2 seconds
- [ ] Memory usage <100MB
- [ ] No console errors
- [ ] No memory leaks (test with 5 min continuous scroll)
- [ ] Lighthouse score >90

#### **Edge Browser Specific:**
- [ ] No freezing on Edge mobile (iOS)
- [ ] No freezing on Edge mobile (Android)
- [ ] No freezing on Edge desktop
- [ ] Smooth touch scrolling
- [ ] Images load correctly
- [ ] No visual glitches

#### **Cross-Browser:**
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Edge (desktop & mobile) ⭐ CRITICAL

#### **Responsive:**
- [ ] Works on 320px width (small mobile)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px)
- [ ] Works on ultrawide (3440px)

---

## ⚠️ CRITICAL REMINDERS

### **DON'T BREAK:**
- ✅ Photo upload functionality
- ✅ Photo approval workflow (admin)
- ✅ Like/favorite/emoji reactions
- ✅ Caption editing
- ✅ Photo deletion
- ✅ Lightbox view

### **MUST PRESERVE:**
- ✅ All existing `PhotoCard` features
- ✅ All existing `PhotoCarousel` features
- ✅ Admin gallery management
- ✅ User photo management

### **EDGE BROWSER NOTES:**
- Edge mobile has aggressive memory management
- Edge mobile touch events behave differently
- Edge rendering engine has specific quirks
- Test on REAL Edge mobile device if possible

---

## 📊 BEFORE & AFTER METRICS

### **BEFORE:**
```
Initial Load Time: ~8-10 seconds
Images Loaded: ALL (~100 photos)
Memory Usage: ~250MB
Scroll FPS: 20-30fps
Network Requests: 100+ simultaneous
Edge Mobile: Freezes ❌
```

### **AFTER (TARGET):**
```
Initial Load Time: <2 seconds ✅
Images Loaded: 20 (paginated)
Memory Usage: <80MB ✅
Scroll FPS: 60fps ✅
Network Requests: 20-25 progressive
Edge Mobile: Smooth ✅
```

---

## 🎯 COMPLETION CHECKLIST

When you're done, provide this report:

```markdown
# GALLERY OPTIMIZATION - COMPLETION REPORT

## ✅ PHASES COMPLETED

### Phase 1: Database Pagination
- [ ] Updated getApprovedPhotos() with pagination
- [ ] Updated getUserPhotos() with pagination
- [ ] Added totalCount returns

### Phase 2: Lazy Loading Hook
- [ ] Created useLazyImage.ts hook
- [ ] Implemented IntersectionObserver
- [ ] Added cleanup logic

### Phase 3: PhotoCard Lazy Loading
- [ ] Integrated useLazyImage hook
- [ ] Added ref for observer
- [ ] Updated loading logic
- [ ] Added decoding="async"

### Phase 4: Gallery Pagination UI
- [ ] Added pagination state variables
- [ ] Updated loadImages() function
- [ ] Added "Load More" buttons
- [ ] Added loading indicators

### Phase 5: Edge Optimizations
- [ ] Added Edge CSS fixes
- [ ] Throttled resize listener
- [ ] Added memory cleanup
- [ ] Added URL revocation

### Phase 6: Performance Monitoring
- [ ] Added performance.now() logging
- [ ] Added memory usage logging
- [ ] Added console debugging

## 🔍 TESTING RESULTS

### Functionality Tests:
- [ ] Images load progressively: [PASS/FAIL]
- [ ] Load More works: [PASS/FAIL]
- [ ] Scroll is smooth: [PASS/FAIL]
- [ ] Lightbox works: [PASS/FAIL]
- [ ] Upload works: [PASS/FAIL]

### Performance Tests:
- [ ] Initial load time: [X seconds]
- [ ] Memory usage: [X MB]
- [ ] Console errors: [count or NONE]
- [ ] Lighthouse score: [X/100]

### Edge Browser Tests:
- [ ] Edge mobile (if tested): [PASS/FAIL/NOT TESTED]
- [ ] Edge desktop: [PASS/FAIL]
- [ ] No freezing: [PASS/FAIL]

### Cross-Browser:
- [ ] Chrome: [PASS/FAIL]
- [ ] Safari: [PASS/FAIL]
- [ ] Firefox: [PASS/FAIL]

## 📝 ISSUES ENCOUNTERED

[List any issues or deviations from the plan]

## 📊 PERFORMANCE METRICS

**Before:**
- Load time: [X]s
- Memory: [X]MB
- Photos loaded: [X]

**After:**
- Load time: [X]s
- Memory: [X]MB
- Photos loaded: [X] initially

## 🎯 NEXT STEPS

- [ ] Test on real Edge mobile device (if possible)
- [ ] Monitor production performance
- [ ] Gather user feedback

---

✅ All changes complete and tested
```

---

## 🚀 IMPLEMENTATION ORDER

1. **Phase 1** (1 hr): Add pagination to API functions
2. **Phase 2** (1 hr): Create lazy loading hook
3. **Phase 3** (1 hr): Update PhotoCard with lazy loading
4. **Phase 4** (2 hrs): Add pagination UI to Gallery
5. **Phase 5** (1 hr): Edge browser optimizations
6. **Phase 6** (30 min): Performance monitoring

**Total Time**: 6.5 hours

---

**Ready to optimize? Let's make this gallery blazing fast! 🚀✨**

