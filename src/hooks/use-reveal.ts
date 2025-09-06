import { useEffect, useRef, useState } from "react";

export function useReveal(options: IntersectionObserverInit = { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced || !ref.current) { setShown(true); return; }
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [options, prefersReduced]);

  return { ref, shown };
}