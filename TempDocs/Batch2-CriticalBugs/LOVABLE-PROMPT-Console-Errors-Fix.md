# Fix Critical Browser Console Errors - Lovable Prompt

## Problem Overview
We're experiencing critical errors in the browser console that are affecting the Gallery page functionality:

1. **CRITICAL**: `PhotoLightbox` component causing "Maximum call stack size exceeded" error (infinite recursion)
2. Multiple 404 errors for dynamically imported JavaScript modules
3. Service worker serving stale cached JavaScript files after deployments

## Root Cause Analysis

### Issue 1: PhotoLightbox TypeScript Syntax Error
**File**: `src/components/gallery/PhotoLightbox.tsx` (Line 13)

The `PhotoLightboxProps` interface has a **malformed property** with a stray semicolon that's breaking TypeScript compilation and causing infinite recursion in the compiled JavaScript.

**Current (BROKEN) Code:**
```typescript
interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
;  // ❌ SYNTAX ERROR - orphaned semicolon, missing property definition
  getPhotoUrl?: (storagePath: string) => Promise<string>;
}
```

**What Happened**: The `onLike` property definition is missing, leaving only a semicolon. This causes the TypeScript compiler to generate malformed JavaScript that creates an infinite recursion loop.

### Issue 2: Service Worker Caching Strategy
**File**: `public/sw.js` (Lines 64-89)

Currently using **cache-first** strategy for ALL assets except HTML. This means JavaScript and CSS files are served from cache even after new deployments, causing:
- 404 errors for chunks that were renamed/removed in new builds
- Users getting stale JavaScript that references old chunk names
- The app attempting to load chunks that no longer exist

## Required Fixes

### Fix 1: Correct PhotoLightbox Interface
**File**: `src/components/gallery/PhotoLightbox.tsx`

**Line 13** - Replace the malformed line with the complete property definition:

```typescript
interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (photoId: string) => void;  // ✅ Add this complete line
  getPhotoUrl?: (storagePath: string) => Promise<string>;
}
```

### Fix 2: Update Service Worker Caching Strategy
**File**: `public/sw.js`

Replace the current fetch event handler (lines 32-90) with a smarter caching strategy:

```javascript
// Fetch event - enhanced SPA handling with network-first for JS/CSS
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // For navigations (HTML), use network-first to avoid stale app shells
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // Network first for auth routes to avoid token consumption issues
  if (url.pathname.includes('/auth') || url.pathname.includes('/verify') || url.pathname.includes('/callback')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ✅ NEW: Network-first for JavaScript and CSS files to prevent stale code
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.includes('/js/') || url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses for offline fallback
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first for static assets (images, videos, fonts)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Only cache successful, same-origin responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Fallback: try cache match
            return caches.match(event.request);
          });
      })
  );
});
```

### Fix 3: Bump Service Worker Cache Version
**File**: `public/sw.js` (Line 2)

Change the cache version to force cache invalidation:

```javascript
const CACHE_NAME = 'twisted-halloween-v4';  // Changed from v3 to v4
```

This ensures all users get fresh JavaScript files after deployment.

## Implementation Checklist

- [ ] Fix `PhotoLightbox.tsx` interface syntax error on line 13
- [ ] Update `public/sw.js` fetch event handler for network-first JS/CSS
- [ ] Bump cache version from v3 to v4 in `public/sw.js`
- [ ] Verify no TypeScript compilation errors
- [ ] Build and deploy to preview environment

## Expected Results After Fix

✅ **No more infinite recursion errors** - PhotoLightbox will function correctly  
✅ **No more 404 errors** - JavaScript chunks will load successfully  
✅ **Fresh code on every deployment** - Network-first ensures users get latest JS/CSS  
✅ **Offline fallback still works** - Cached files available when network fails  
✅ **Service worker cache properly invalidated** - v4 clears old caches  

## Testing Instructions

After deploying these changes:

1. **Clear browser cache and hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Open DevTools Console** - Should see no errors
3. **Navigate to Gallery page** - Should load without errors
4. **Open Network tab** - Verify JS files show "(from network)" not "(from ServiceWorker)"
5. **Check Application tab** → Service Workers - Should show cache version "twisted-halloween-v4"
6. **Test PhotoLightbox** - Click any gallery image to open lightbox, verify it works without errors

## Technical Context

**Why this matters:**
- The PhotoLightbox syntax error is breaking the entire Gallery page
- Stale JavaScript causes cascading failures when chunks are renamed during builds
- Users were stuck with broken code even after fixes were deployed
- Network-first for JS/CSS is industry best practice for SPAs

**Why cache-first doesn't work for JS/CSS:**
- Vite generates unique chunk hashes on every build (e.g., `Gallery-DOSu4C0b.js`)
- Old cached `index.html` references old chunks
- New deployment has new chunk names
- Result: 404 errors and broken app

**Why network-first solves this:**
- Always fetches latest JS/CSS from server first
- Falls back to cache only when offline
- Ensures code consistency across deployments
- Still provides offline capability

## Priority
🔴 **CRITICAL** - These errors are affecting core Gallery functionality and user experience.

---

*This prompt is ready to be submitted to Lovable AI for implementation.*

