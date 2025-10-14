# 🔬 Isolation Test - Exact Code Changes

## Test Configuration: Smart Lovable Detection + Diagnostics

**Recommendation**: Apply **Test 2 + Test 3** together for best results.

---

## ✏️ CHANGE #1: src/main.tsx

**Replace the entire file with this version** (includes all 3 tests):

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { consoleCapture } from "@/lib/console-capture";

// Initialize console capture immediately
consoleCapture;

// 🧪 TEST: Detect Lovable preview environment
const isLovablePreview = window.location.hostname.includes('lovable.app') || 
                         window.location.hostname.includes('lovable.dev') ||
                         window.location.hostname.includes('preview');

if (isLovablePreview) {
  console.log('🎃 LOVABLE PREVIEW DETECTED - Service Worker cleanup disabled');
  console.log('📍 Hostname:', window.location.hostname);
}

// Global error handlers to catch initialization errors
window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.error('Global error:', { msg, url, lineNo, columnNo, error });
  return false; // Let default handler run
};

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

// Safe bootstrap with one-time SW/cache cleanup to prevent mixed React chunks
// 🧪 TEST: Only run SW cleanup in production, not in Lovable preview
async function start() {
  const startTime = performance.now();
  
  console.log('🚀 App initialization started');
  console.log('🔍 Environment check:', { 
    isLovablePreview, 
    hostname: window.location.hostname,
    pathname: window.location.pathname 
  });
  
  try {
    // 🧪 TEST: Skip SW cleanup in Lovable preview environment
    if (!isLovablePreview && 'serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v7')) {
      console.log('🧹 Running service worker cleanup (production only)');
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
      }
      sessionStorage.setItem('sw_cleanup_done_v7', '1');
      // Reload once to ensure the page is no longer controlled by any SW
      console.log('🔄 Reloading after SW cleanup');
      location.reload();
      return; // Do not render on this pass
    } else if (isLovablePreview) {
      console.log('⏭️ Skipping SW cleanup in Lovable preview');
    }
  } catch (e) {
    console.log('⚠️ SW cleanup skipped/failed:', e);
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    console.log('✅ Root element found, rendering app...');
    createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 🧪 TEST: Log performance metrics and success indicators
    const loadTime = (performance.now() - startTime).toFixed(0);
    console.log(`⚡ App startup time: ${loadTime}ms`);
    console.log('✅ App mounted successfully');
    console.log('🎃 Twisted Hearth Foundation - Version 1.1.7');
    console.log('📊 Environment details:', {
      hasRoot: !!rootEl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 80),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      isLovablePreview
    });
  } else {
    console.error('❌ Root element not found!');
  }
}

start();
```

---

## ✏️ CHANGE #2: src/components/SupportReportModal.tsx (OPTIONAL)

**Only apply this if Test #1 doesn't work.**

This makes the edge function optional so the app works even if it's not deployed yet.

**Find lines 112-122** and replace with:

```typescript
      // 3. Call edge function (with graceful fallback if not deployed)
      try {
        const { error } = await supabase.functions.invoke('send-support-report', {
          body: {
            email,
            description,
            screenshotUrl,
            userAgent: navigator.userAgent,
            browserLogs: browserLogs.slice(-20), // Last 20 auth-related logs
          },
        });

        if (error) {
          console.warn('⚠️ Edge function error (might not be deployed yet):', error);
          // Don't throw - the report was saved to the database, email sending failed
          toast({
            title: "⚠️ Report Saved (Email Pending)",
            description: "Your report was saved. Email notifications require edge function deployment.",
            duration: 5000,
          });
          handleClose();
          setLoading(false);
          return;
        }
      } catch (edgeFunctionError: any) {
        console.error('⚠️ Edge function not available:', edgeFunctionError);
        // Still show success - the important data is saved
        toast({
          title: "📝 Report Saved",
          description: "Report saved to database. Email system pending deployment.",
          duration: 5000,
        });
        handleClose();
        setLoading(false);
        return;
      }
```

---

## 🚀 Application Instructions

### **Step 1: Apply Change #1 (REQUIRED)**

1. Open `src/main.tsx`
2. **Select all** (Ctrl+A)
3. **Delete all** (Delete)
4. **Paste** the new code from CHANGE #1 above
5. **Save** (Ctrl+S)

### **Step 2: Commit and Push to Lovable**

```bash
git add src/main.tsx
git commit -m "🧪 TEST: Add Lovable preview detection and disable SW cleanup in preview"
git push
```

### **Step 3: Monitor Lovable Preview**

Watch for these console logs in Lovable preview (open DevTools):
- `🎃 LOVABLE PREVIEW DETECTED - Service Worker cleanup disabled`
- `⏭️ Skipping SW cleanup in Lovable preview`
- `✅ App mounted successfully`
- `🎃 Twisted Hearth Foundation - Version 1.1.7`

### **Step 4: Verify Success**

✅ **Success indicators:**
- Preview shows "Built" (not "Not Built Yet")
- Homepage loads
- No infinite reload loops
- Can navigate to other pages

❌ **Still failing?**
- Apply CHANGE #2 (make edge function optional)
- Check if hostname detection is working (look for the 🎃 log)
- Try Phase 3: Component Isolation

---

## 🔄 Quick Rollback

If you need to revert:

```bash
git checkout HEAD -- src/main.tsx
git status
```

---

## 📊 Expected Timeline

- **Commit and push**: 30 seconds
- **Lovable build trigger**: 30 seconds  
- **Build completion**: 2-5 minutes (normal)
- **Preview available**: 3-6 minutes total

If it's still "Not Built Yet" after **10 minutes**, proceed to CHANGE #2 or Component Isolation.

---

## 💡 Why This Should Work

**The Problem**: 
- Service worker cleanup code forces a `location.reload()` on first load
- Lovable's preview environment might interpret this as "app not ready yet"
- This creates a detection loop where Lovable never sees the app finish loading

**The Solution**:
- Detect Lovable preview environment by hostname
- Skip service worker cleanup entirely in preview
- Add diagnostic logs so we can see exactly what's happening
- App loads normally without reload interruptions

**Confidence Level**: **85%** that this will resolve the hang.

---

## 🎯 Next Steps After Testing

**If this works:**
1. Keep the Lovable detection code (it's production-safe)
2. The SW cleanup still runs in production (good!)
3. Mark issue as resolved ✅

**If this doesn't work:**
1. Check console logs for the diagnostic messages
2. Apply CHANGE #2 (edge function fallback)
3. Try Component Isolation (Phase 3)
4. Consider that it might be Lovable infrastructure (wait 30 min)

---

**Ready to apply these changes?** Let me know and I'll make the modifications! 🎃

