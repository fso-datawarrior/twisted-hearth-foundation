import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force clean rebuild - v1.0.6
// Register/Unregister service worker based on route (avoid SW on /auth)
if ('serviceWorker' in navigator) {
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
      navigator.serviceWorker.register('/sw.js?v=1.0.5')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
