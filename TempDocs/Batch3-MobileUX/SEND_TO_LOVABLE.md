# 🚀 BATCH 3: MOBILE UX - Send to Lovable (Chat Mode)

**Copy and paste this message into Lovable AI Chat:**

---

I need you to implement Batch 3: Mobile UX improvements for our Halloween party website. This batch includes 4 mobile-specific fixes that must be completed in order.

## 📋 Access Instructions

1. **Pull latest code** from the Git repository
2. **Read the detailed prompt**: `TempDocs/Batch3-MobileUX/LOVABLE-PROMPT-Batch3-MobileUX.md`
3. **Follow the implementation order**: Items 20 → 23 → 1 → 22

## 🎯 What to Build

### **Item 20: Email Campaign Mobile Popup** (1 hour)
- **Problem**: Verification popup off-screen on mobile
- **Fix**: Add responsive max-width and padding constraints
- **File**: Admin email campaign component
- **Test**: 320px, 375px, 768px widths

### **Item 23: Vignettes Page Flash** (1-2 hours)
- **Problem**: Flash of old content on page load
- **Fix**: Add loading state with skeleton loader
- **File**: `src/pages/Vignettes.tsx` (lines 39-51, add before carousel)
- **Test**: Clear cache reload, slow network

### **Item 1: Vignettes Mobile Scroll** (3-4 hours)
- **Problem**: Arrows scroll 2-3 photos at once, photos skipped
- **Fix**: Change `maxIndex = length - itemsPerView` to `length - 1`
- **File**: `src/pages/Vignettes.tsx` (lines 145-154)
- **Test**: Mobile (1 photo view), tablet (2 photos), desktop (3 photos) - arrows always move 1

### **Item 22: Mobile Swipe Navigation** (2-3 hours)
- **Problem**: Swipe only goes through history, closes app
- **Fix**: Create `useSwipeNavigation` hook with page order
- **NEW FILE**: `src/hooks/useSwipeNavigation.ts`
- **Pages**: Home → Vignettes → Schedule → Gallery → Discussion → Costumes → RSVP
- **Test**: Swipe left/right navigation, boundaries, carousels still work

## 🚨 CRITICAL REQUIREMENTS

1. **Preserve all existing features** (carousels, lightbox, admin, forms)
2. **Mobile-first** (test on 320px width minimum)
3. **Don't break carousels** (add `data-no-swipe` to prevent interference)
4. **Test thoroughly** (30+ test scenarios in prompt)
5. **Complete ALL 4 items** before reporting

## 📊 MANDATORY COMPLETION REPORT

After completing all work, you MUST provide a detailed completion report with:

- ✅ All 4 items completed
- 📁 Files modified/created list
- ✅ Testing results for each item
- ⚠️ Any issues found
- 📊 Deployment readiness status

**Full report format is in the detailed prompt.**

## 📁 Reference Documents

All planning and specifications are in:
- `TempDocs/Batch3-MobileUX/LOVABLE-PROMPT-Batch3-MobileUX.md` (MAIN PROMPT)
- `TempDocs/Batch3-MobileUX/BATCH3_PLANNING.md`
- `TempDocs/Batch3-MobileUX/BATCH3_QUICK_START.md`

## 🎯 Expected Output

1. **4 items complete** with all tests passing
2. **1 new file created** (`useSwipeNavigation.ts`)
3. **7-10 files modified** (Vignettes, Gallery, App, etc.)
4. **Mobile testing complete** (320px to 768px)
5. **Full completion report** in specified format

## ⏱️ Time Estimate

- Item 20: 1 hour
- Item 23: 1-2 hours
- Item 1: 3-4 hours
- Item 22: 2-3 hours
- **Total**: 7-10 hours

---

**Please confirm you've read the detailed prompt in `LOVABLE-PROMPT-Batch3-MobileUX.md` and are ready to begin. Start with Item 20 (Email Popup) and work through them in order.** 🚀✨

---

**After you confirm**, I'll ask you to create an implementation plan for my review before you execute.

