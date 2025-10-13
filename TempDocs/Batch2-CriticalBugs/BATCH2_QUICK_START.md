# 🔴 BATCH 2: CRITICAL BUGS - Quick Start

**Priority**: 🔴 CRITICAL  
**Items**: 3  
**Time**: 8-12 hours  
**Status**: 📋 READY TO START

---

## 📋 THREE CRITICAL ITEMS

### 1️⃣ **Item 15: Fix Email Address** (2-3 hours) 🔴 START HERE
**Problem**: Emails show "Denver" instead of full address  
**Fix**: Update to "1816 White Feather Drive, Longmont, Colorado 80504"  
**Files**: 
- `supabase/functions/send-rsvp-confirmation/index.ts`
- `supabase/functions/send-contribution-confirmation/index.ts`

**Action**: Search codebase for "Denver", replace with correct address

---

### 2️⃣ **Item 24: Gallery Performance** (4-5 hours) 🟡 THEN THIS
**Problem**: All images load at once = slow & memory issues  
**Fix**: Add lazy loading + pagination/infinite scroll  
**Files**: 
- `src/pages/Gallery.tsx`
- Gallery components

**Action**: Implement Intersection Observer for lazy loading

---

### 3️⃣ **Item 6: Gallery Freezing in Edge** (4-6 hours) 🔴 FINALLY
**Problem**: Gallery freezes on Kat's phone (Edge browser)  
**Fix**: Debug + optimize Edge-specific issues  
**Files**: Same as Item 24

**Action**: Test in Edge mobile, fix memory/performance issues

---

## 🎯 WHY THIS ORDER?

1. **Email fix** = Quick win, critical data accuracy
2. **Performance** = May fix freezing issue automatically
3. **Edge debugging** = Complex, needs performance fixes first

---

## 📚 FULL DETAILS

See `BATCH2_PLANNING.md` for:
- Detailed investigation plans
- Code examples
- Testing checklists
- Success criteria

---

## 🚀 READY TO START?

**Which item should we tackle first?**

**A)** Item 15 (Email address fix) - Quick & easy  
**B)** Item 24 (Gallery performance) - Foundation work  
**C)** Review planning document first  

Let me know! 🎯

