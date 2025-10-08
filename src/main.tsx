import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force clean rebuild - v1.0.6
// Register/Unregister service worker based on route (avoid SW on /auth)
if (false && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (location.pathname.startsWith('/auth')) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .then(() => {
          console.log('SW unregistered for /auth route');
          if (!sessionStorage.getItem('sw-unreg')) {
            sessionStorage.setItem('sw-unreg', '1');
            location.reload();
          } else {
            sessionStorage.removeItem('sw-unreg');
          }
        })
        .catch((err) => {
          console.log('SW unregister failed:', err);
        });
    } else {
      navigator.serviceWorker.register('/sw.js?v=1.0.7')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  });
}
async function bootstrap() {
  try {
    const already = sessionStorage.getItem('bootstrap_done');
    if (!already) {
      // Aggressively clear any existing SW and caches to avoid stale React chunks (run once per session)
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
      }
      console.log('Service workers and caches cleared. Reloading...');
      sessionStorage.setItem('bootstrap_done', '1');
      // Force a clean reload to ensure a single React instance
      location.reload();
      return; // Stop bootstrapping on this pass
    }
  } catch (e) {
    console.log('Cleanup error:', e);
  } finally {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      createRoot(rootEl).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  }
}

bootstrap();
