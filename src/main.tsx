import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Force cache-busting comment: 2025-10-20-22:59
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
      if (regs.length) {
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) {
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
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
