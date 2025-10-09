import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Safe bootstrap with one-time SW/cache cleanup to prevent mixed React chunks
async function start() {
  try {
    if ('serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done')) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
      }
      sessionStorage.setItem('sw_cleanup_done', '1');
      // Reload once to ensure the page is no longer controlled by any SW
      location.reload();
      return; // Do not render on this pass
    }
  } catch (e) {
    console.log('SW cleanup skipped/failed:', e);
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

start();
