# 🧪 Minimal Test Deployment Configuration
## Isolating the Lovable Preview Hang Issue

**Created**: October 14, 2025  
**Purpose**: Systematically identify what's causing the Lovable.ai preview to hang on "Not Built Yet"  
**Local Build Status**: ✅ Success (38.83s, Exit Code 0)

---

## 🎯 Test Hypothesis

Since the code builds perfectly locally, the issue is likely:
1. **Service Worker cleanup code** forcing reload loops in Lovable's preview environment
2. **New components** (SupportReportModal, UserSettings) causing dependency issues
3. **Edge function** (`send-support-report`) not deployed yet
4. **Lovable infrastructure** experiencing delays or caching issues

---

## 🔬 Test Plan: Progressive Isolation

### **Test 1: Disable Service Worker Cleanup** ⭐ **MOST LIKELY CULPRIT**

**File**: `src/main.tsx`  
**Change**: Lines 24-35

**Current Code** (lines 24-35):
```typescript
if ('serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v7')) {
  const regs = await navigator.serviceWorker.getRegistrations();
  if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
  if ('caches' in window) {
    const keys = await caches.keys();
    if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
  }
  sessionStorage.setItem('sw_cleanup_done_v7', '1');
  location.reload();  // 👈 This might cause infinite loops
  return;
}
```

**Test Code** (temporarily disable):
```typescript
// TEMPORARY TEST: Disable SW cleanup to check if it's causing Lovable preview hang
const ENABLE_SW_CLEANUP = false;

if (ENABLE_SW_CLEANUP && 'serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v7')) {
  const regs = await navigator.serviceWorker.getRegistrations();
  if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
  if ('caches' in window) {
    const keys = await caches.keys();
    if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
  }
  sessionStorage.setItem('sw_cleanup_done_v7', '1');
  location.reload();
  return;
}
```

**Expected Result**: If this fixes the hang, the SW cleanup was the problem.

---

### **Test 2: Add Lovable Preview Detection**

**File**: `src/main.tsx`  
**Add after line 8**:

```typescript
// Detect Lovable preview environment
const isLovablePreview = window.location.hostname.includes('lovable.app') || 
                         window.location.hostname.includes('lovable.dev');

if (isLovablePreview) {
  console.log('🎃 Running in Lovable preview environment - SW cleanup disabled');
}
```

**Then modify SW cleanup condition (line 24)**:
```typescript
if (!isLovablePreview && 'serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v7')) {
```

**Expected Result**: SW cleanup only runs in production, not in Lovable preview.

---

### **Test 3: Add Build Success Indicator**

**File**: `src/main.tsx`  
**Add after line 50**:

```typescript
// Signal to Lovable that app is ready
console.log('✅ App mounted successfully');
console.log('🎃 Twisted Hearth Foundation - Version 1.1.7');
console.log('📊 Components loaded:', {
  hasRoot: !!rootEl,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent.substring(0, 50)
});
```

**Expected Result**: Helps Lovable detect when the app has fully loaded.

---

### **Test 4: Verify Edge Function is Optional**

**File**: `src/components/SupportReportModal.tsx`  
**Line**: 112

**Current Code**:
```typescript
const { error } = await supabase.functions.invoke('send-support-report', {
  body: {
    email,
    description,
    screenshotUrl,
    userAgent: navigator.userAgent,
    browserLogs: browserLogs.slice(-20),
  },
});

if (error) throw error;
```

**Test Code** (graceful fallback):
```typescript
try {
  const { error } = await supabase.functions.invoke('send-support-report', {
    body: {
      email,
      description,
      screenshotUrl,
      userAgent: navigator.userAgent,
      browserLogs: browserLogs.slice(-20),
    },
  });

  if (error) {
    console.warn('Edge function not deployed yet:', error);
    // Fallback: Show success anyway for testing
    toast({
      title: "⚠️ Test Mode",
      description: "Report captured locally (edge function not deployed yet)",
    });
  }
} catch (edgeFunctionError) {
  console.error('Edge function error (expected if not deployed):', edgeFunctionError);
  // Don't throw - just log for now
}
```

**Expected Result**: App works even if edge function isn't deployed yet.

---

## 🚀 Recommended Test Sequence

### **Phase 1: Quick Win (5 minutes)**
1. Apply **Test 1** (disable SW cleanup completely)
2. Commit to Lovable
3. Check if preview builds

**If this works**: The SW cleanup was the issue. Proceed to Phase 2.  
**If this doesn't work**: Proceed to Phase 3.

---

### **Phase 2: Smart Detection (10 minutes)**
1. Apply **Test 2** (detect Lovable environment)
2. Apply **Test 3** (add build success indicators)
3. Commit to Lovable
4. Check console logs in preview

**Expected**: SW cleanup disabled in Lovable, app loads successfully.

---

### **Phase 3: Component Isolation (15 minutes)**
If the issue persists, temporarily remove new features:

1. Comment out `SupportReportModal` import in `App.tsx` (line 14)
2. Comment out `<SupportReportModal>` in `App.tsx` (around line 95-100)
3. Comment out UserSettings route temporarily
4. Commit and test

**If this works**: One of the new components has an issue.  
**If this doesn't work**: It's a Lovable infrastructure issue.

---

## 📋 Diagnostic Checklist

Before making changes, verify:

- [x] Local build completes successfully ✅
- [x] All files exist and are syntactically correct ✅
- [x] TypeScript has no errors ✅
- [x] No actual routing issues ✅
- [ ] Service worker cleanup tested
- [ ] Lovable environment detection tested
- [ ] Edge function deployment status checked
- [ ] New components isolated

---

## 🔄 Rollback Plan

**If tests break things further:**

1. **Revert main.tsx**: Git checkout the original version
2. **Remove test code**: Delete all `TEMPORARY TEST` comments
3. **Check Git history**: `git log --oneline -10` to find last working commit
4. **Restore from backup**: All original code is documented above

---

## 📊 Success Metrics

**Test is successful when:**
- ✅ Lovable preview shows "Built" instead of "Not Built Yet"
- ✅ Preview loads the homepage
- ✅ Console shows no critical errors
- ✅ Can navigate to at least 2 routes (/about, /schedule)

**Partial success:**
- ⚠️ Preview builds but shows blank page (progress!)
- ⚠️ Preview builds but some routes fail (progress!)

**Test fails if:**
- ❌ Still stuck on "Not Built Yet" after 10 minutes
- ❌ Build shows actual errors in Lovable console

---

## 🎯 Most Likely Solution

**Based on analysis, I predict:**

**80% probability**: Service worker cleanup code is causing reload loops  
**15% probability**: Lovable is experiencing infrastructure delays  
**5% probability**: New components have a subtle issue

**Recommended action**: Apply Test 1 immediately.

---

## 💡 Additional Debugging Info

**Build Output Summary** (from local test):
```
✓ 3824 modules transformed
✓ built in 38.83s
Exit code: 0
```

**Large Bundles** (might contribute to slower Lovable builds):
- `AdminDashboard-BUl_troH.js`: 912.17 kB (172.06 kB gzipped)
- `AnalyticsWidgets-DLVHXOSW.js`: 878.81 kB (261.66 kB gzipped)

These are within acceptable limits (<1MB after gzip), but Lovable might need extra time to optimize them.

---

## 🔧 Quick Commands

```bash
# Check git status
git status

# See recent commits
git log --oneline -5

# Create test branch (optional)
git checkout -b test/isolate-lovable-hang

# View current branch
git branch

# If you need to rollback
git checkout main
```

---

## 📞 Next Steps

**Choose one:**

1. **Apply Test 1 now** (disable SW cleanup) → I'll make the change
2. **Apply Test 2 now** (smart Lovable detection) → I'll make the change  
3. **Apply Test 3 first** (add diagnostics) → I'll make the change
4. **Apply all tests at once** (comprehensive) → I'll make all changes

**My recommendation**: Apply Test 2 (smart Lovable detection) - it's the safest because it only disables SW cleanup in Lovable preview, not in production.

---

**Ready to proceed with testing when you are!** 🎃

