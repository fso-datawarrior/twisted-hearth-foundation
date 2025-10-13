# 🚀 BATCH 3: MOBILE UX - Quick Start Guide

**Date**: October 13, 2025  
**Status**: 📋 PLANNING  
**Items**: 4 items  
**Time**: 7-10 hours  
**Priority**: 🟡 HIGH

---

## 📋 ITEMS OVERVIEW

| Item | Name | Priority | Time | Complexity |
|------|------|----------|------|------------|
| **1** | Vignettes Mobile Scroll | 🟡 HIGH | 3-4h | MEDIUM |
| **20** | Email Popup Positioning | 🟢 MEDIUM | 1h | LOW |
| **22** | Mobile Swipe Navigation | 🟡 HIGH | 2-3h | MEDIUM |
| **23** | Vignettes Page Flash | 🟡 HIGH | 1-2h | MEDIUM |

**Total**: 7-10 hours

---

## 🔍 KEY FINDINGS

### **Item 1: Vignettes Scroll**

**Current Code** (`src/pages/Vignettes.tsx:148-154`):
```typescript
const nextSlide = () => {
  setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
};

const prevSlide = () => {
  setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
};
```

**Problem**:
- `maxIndex = displayVignettes.length - itemsPerView`
- On mobile: `itemsPerView = 1`, so navigation is correct
- On desktop: `itemsPerView = 3`, so `maxIndex` is wrong for single-step navigation
- **Root cause**: Navigation moves by index, but display shows multiple items

**Solution**: Always move by 1, regardless of `itemsPerView`

---

### **Item 20: Email Popup**

**Current Implementation**:
- Uses shadcn/ui `Dialog` component (verified in codebase)
- Dialog has default `fixed` positioning
- Likely issue: Max-width or padding not mobile-friendly

**Solution**: Add responsive constraints to Dialog

---

### **Item 22: Swipe Navigation**

**Challenge**:
- Must override browser's default swipe-back behavior
- Must not interfere with scrolling
- Must not interfere with carousels

**Solution**: Touch event detection with careful thresholds

---

### **Item 23: Vignettes Flash**

**Current Code** (`src/pages/Vignettes.tsx:39-51`):
```typescript
const { data: vignettes, isLoading, error } = useQuery({
  queryKey: ['active-vignettes'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('past_vignettes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true});
    
    if (error) throw error;
    return data;
  }
});
```

**Problem**: Component renders before data loads, showing empty/old state

**Solution**: Add proper loading state handling

---

## 🎯 RECOMMENDED ORDER

1. **Item 20** (1h) - Quick CSS fix, admin-only
2. **Item 23** (1-2h) - Quick win, improves UX
3. **Item 1** (3-4h) - Core mobile feature
4. **Item 22** (2-3h) - Most complex, test last

---

## 📁 DOCUMENTS IN THIS FOLDER

- `BATCH3_PLANNING.md` - Full planning document (this file's parent)
- `BATCH3_QUICK_START.md` - This file
- `README.md` - Navigation index
- `LOVABLE-PROMPT-Batch3-MobileUX.md` - Coming soon
- `BATCH3_TECHNICAL_SPECS.md` - Coming soon

---

## 🔗 QUICK LINKS

- Master Tracker: `TempDocs/Batch1-QuickWins/HOTFIXES_AND_FEATURES_MASTER_TRACKER.md`
- Master Batch Plan: `TempDocs/MASTER_BATCH_PLAN.md`
- Batch 1 Complete: `TempDocs/Batch1-QuickWins/`
- Batch 2 Complete: `TempDocs/Batch2-CriticalBugs/`

---

**Last Updated**: October 13, 2025  
**Next Step**: Detailed technical specifications

