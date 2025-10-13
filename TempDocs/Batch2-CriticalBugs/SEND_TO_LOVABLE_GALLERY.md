# 📋 COPY THIS → SEND TO LOVABLE

Copy everything below the line and paste into Lovable Chat:

---

🔴 **CRITICAL: Fix Gallery Freezing & Performance Issues (Items 6 & 24)**

## THE PROBLEMS

**Problem 1: Gallery Freezes in Edge Browser**
User report: "Gallery page freezes on Kat's phone in Edge browser - froze a few times."
- Impact: Users cannot view photos (blocking core functionality)
- Affects: Edge mobile users

**Problem 2: Terrible Performance**
- ❌ All 100+ photos load simultaneously
- ❌ No lazy loading
- ❌ ~10 second initial load
- ❌ >200MB memory usage
- ❌ Freezes and stutters

## YOUR TASK

Implement comprehensive gallery optimization with 6 phases:

### 📚 READ THIS DOCUMENT:

**Main Instructions**: `TempDocs/Batch2-CriticalBugs/LOVABLE-PROMPT-Items6-24-Gallery-Optimization.md`
- Complete 6-phase implementation plan
- Line-by-line code changes
- Before/after examples
- Edge browser fixes
- Testing requirements

---

## QUICK SUMMARY OF CHANGES

### **Phase 1: Database Pagination** (1 hr)
- Update `src/lib/photo-api.ts`
- Add pagination to `getApprovedPhotos()` and `getUserPhotos()`
- Return `{ data, error, totalCount }`

### **Phase 2: Lazy Loading Hook** (1 hr)
- Create `src/hooks/useLazyImage.ts` ⭐ NEW FILE
- Implement IntersectionObserver
- Load images only when visible

### **Phase 3: Update PhotoCard** (1 hr)
- Modify `src/components/gallery/PhotoCard.tsx`
- Integrate `useLazyImage` hook
- Add `decoding="async"` for Edge

### **Phase 4: Gallery Pagination UI** (2 hrs)
- Update `src/pages/Gallery.tsx`
- Add pagination state (page, totalCount, loadingMore)
- Add "Load More" buttons
- Only load 20 photos initially

### **Phase 5: Edge Browser Fixes** (1 hr)
- Add Edge-specific CSS to `src/index.css`
- Throttle resize listeners
- Add memory cleanup on unmount
- Revoke object URLs

### **Phase 6: Performance Monitoring** (30 min)
- Add `performance.now()` timing
- Log memory usage
- Console debugging for Edge

---

## 🎯 TARGET METRICS

**BEFORE:**
- Load time: ~10s
- Memory: ~250MB
- Photos loaded: ALL (~100)
- Edge: Freezes ❌

**AFTER:**
- Load time: <2s ✅
- Memory: <80MB ✅
- Photos loaded: 20 (progressive)
- Edge: Smooth ✅

---

## ⚠️ CRITICAL - DON'T BREAK THESE

- ✅ Photo upload
- ✅ Photo approval workflow
- ✅ Like/favorite/emoji reactions
- ✅ Caption editing
- ✅ Photo deletion
- ✅ Lightbox view
- ✅ Admin gallery management

---

## 🔍 TESTING REQUIRED

### Must Test:
- [ ] Images load progressively (only visible ones)
- [ ] "Load More" button works
- [ ] Scroll is smooth (60fps)
- [ ] No console errors
- [ ] Edge desktop: no freezing
- [ ] Edge mobile: smooth (if you can test)
- [ ] Chrome/Safari/Firefox: working
- [ ] Upload still works
- [ ] Lightbox still works

### Performance:
- [ ] Initial load <2 seconds
- [ ] Memory <100MB
- [ ] Lighthouse score >90

---

## 📊 COMPLETION REPORT REQUIRED

After completing ALL 6 phases, provide this report:

```markdown
# GALLERY OPTIMIZATION - COMPLETION REPORT

## ✅ PHASES COMPLETED

### Phase 1: Database Pagination
- [✅/❌] Updated getApprovedPhotos() with pagination (line numbers)
- [✅/❌] Updated getUserPhotos() with pagination (line numbers)
- [✅/❌] Added totalCount returns

### Phase 2: Lazy Loading Hook
- [✅/❌] Created src/hooks/useLazyImage.ts (NEW FILE)
- [✅/❌] Implemented IntersectionObserver
- [✅/❌] Added cleanup logic

### Phase 3: PhotoCard Lazy Loading
- [✅/❌] Integrated useLazyImage hook (line numbers)
- [✅/❌] Added ref for observer
- [✅/❌] Updated loading logic
- [✅/❌] Added decoding="async"

### Phase 4: Gallery Pagination UI
- [✅/❌] Added pagination state (line numbers)
- [✅/❌] Updated loadImages() function (line numbers)
- [✅/❌] Added "Load More" buttons (line numbers)
- [✅/❌] Added loading indicators

### Phase 5: Edge Optimizations
- [✅/❌] Added Edge CSS fixes (src/index.css)
- [✅/❌] Throttled resize listener (line numbers)
- [✅/❌] Added memory cleanup (line numbers)
- [✅/❌] Added URL revocation

### Phase 6: Performance Monitoring
- [✅/❌] Added performance.now() logging
- [✅/❌] Added memory usage logging
- [✅/❌] Added console debugging

## 🔍 TESTING RESULTS

### Functionality Tests:
- Images load progressively: [PASS/FAIL]
- Load More works: [PASS/FAIL]
- Scroll is smooth: [PASS/FAIL]
- Lightbox works: [PASS/FAIL]
- Upload works: [PASS/FAIL]

### Performance Tests:
- Initial load time: [X seconds]
- Memory usage: [X MB]
- Console errors: [count or NONE]
- Lighthouse score (if checked): [X/100]

### Edge Browser Tests:
- Edge desktop: [PASS/FAIL]
- Edge mobile (if tested): [PASS/FAIL/NOT TESTED]
- No freezing: [PASS/FAIL]

### Cross-Browser:
- Chrome: [PASS/FAIL]
- Safari: [PASS/FAIL]
- Firefox: [PASS/FAIL]

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
- Photos initially loaded: [20]

---

✅ All 6 phases complete and tested
```

---

## 🎯 YOUR PROCESS

1. **READ** the full prompt (`LOVABLE-PROMPT-Items6-24-Gallery-Optimization.md`)
2. **PLAN** your implementation approach
3. **SHOW ME** your plan for approval
4. **IMPLEMENT** all 6 phases after I approve
5. **TEST** thoroughly (especially Edge)
6. **PROVIDE** the completion report above

---

**IMPORTANT**: This is a CRITICAL bug fix. Edge mobile users cannot view photos. Take your time, test thoroughly, and make sure nothing breaks. The detailed prompt has all code examples and line numbers.

Ready to start? Please read the full prompt file and create your implementation plan! 🚀

