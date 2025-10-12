import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function start() {
  try {
    if ('serviceWorker' in navigator && !sessionStorage.getItem('sw_cleanup_done_v5')) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length) await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        if (keys.length) await Promise.all(keys.map((k) => caches.delete(k)));
      }
      sessionStorage.setItem('sw_cleanup_done_v5', '1');
      location.reload();
      return;
    }
  } catch {}

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
