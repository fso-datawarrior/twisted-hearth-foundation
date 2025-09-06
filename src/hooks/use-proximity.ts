import { useEffect, useRef, useState } from "react";

export function useProximity(radius = 120) {
  const ref = useRef<HTMLElement | null>(null);
  const [near, setNear] = useState(false);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: none)").matches;

  useEffect(() => {
    if (isTouch) return; // touch devices keep faint-visible dots
    const handle = (e: PointerEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      setNear(d < radius);
    };
    window.addEventListener("pointermove", handle, { passive: true });
    return () => window.removeEventListener("pointermove", handle);
  }, [radius, isTouch]);

  return { ref, near, prefersReduced, isTouch };
}