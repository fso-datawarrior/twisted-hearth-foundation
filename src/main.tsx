import React from "react";
import App from "./App.tsx";
import "./index.css";

// Safe bootstrap with one-time SW/cache cleanup to prevent mixed React chunks
async function start() {
  try {
    if ('serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v4')) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
      }
      sessionStorage.setItem('sw_cleanup_done_v4', '1');
      // Reload once to ensure the page is no longer controlled by any SW
      location.reload();
      return; // Do not render on this pass
    }
  } catch (e) {
    console.log('SW cleanup skipped/failed:', e);
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    try {
      const mod: any = await import('react-dom/client');
      const createRootFn = mod?.createRoot || mod?.default?.createRoot;
      if (typeof createRootFn === 'function') {
        createRootFn(rootEl).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        return;
      }
      console.error('react-dom/client did not expose createRoot; module keys:', Object.keys(mod));
    } catch (e) {
      console.error('Failed to load react-dom/client:', e);
    }

    // As a last resort, try legacy hydrateRoot API shape (React 18+)
    try {
      const mod: any = await import('react-dom/client');
      const hydrateRootFn = mod?.hydrateRoot || mod?.default?.hydrateRoot;
      if (typeof hydrateRootFn === 'function') {
        hydrateRootFn(rootEl, (
          <React.StrictMode>
            <App />
          </React.StrictMode>
        ));
        return;
      }
    } catch {}

    // If we still cannot render, show a friendly message to avoid blank screen
    rootEl.innerHTML = '<div style="padding:16px;font-family:system-ui;color:#f87171">App failed to bootstrap due to React DOM module resolution. Please reload.</div>';
  }
}

start();
