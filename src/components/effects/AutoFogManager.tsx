import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BackgroundFog } from "@/components/effects/BackgroundFog";

const SELECTORS = [
  ".bg-black", 
  ".section-black",
  '[data-bg="black"]',
  "section.hero--black",
  "main", // Include main element
];

function isEligible(el: Element) {
  // Skip if author opted out or it already has a fog mount
  if ((el as HTMLElement).closest(".fog-opt-out")) return false;
  if ((el as HTMLElement).querySelector(":scope > .fog-mount")) return false;

  // Be conservative: ensure it's not a nav/dialog/body/html, and is "blocky"
  const tag = el.tagName.toLowerCase();
  if (["nav", "dialog", "body", "html"].includes(tag)) return false;

  // Skip if it would affect page scrolling
  if (el === document.body || el === document.documentElement) return false;

  // Only target specific elements, not the whole page background
  if (el.classList.contains('min-h-screen') && tag === 'div') {
    // This is likely a page wrapper, skip it to avoid scroll issues
    return false;
  }

  // If computed bg is dark or matches our selectors
  const cs = getComputedStyle(el as HTMLElement);
  const bg = cs.backgroundColor;
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) {
    const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    const isDark = r < 30 && g < 30 && b < 30;
    if (!isDark && !SELECTORS.some(sel => (el as HTMLElement).matches(sel))) return false;
  } else {
    // Allow transparent/no background for certain element types
    const tag = el.tagName.toLowerCase();
    if (['section', 'header', 'main'].includes(tag)) {
      // Allow these even with transparent backgrounds
    } else if (!SELECTORS.some(sel => (el as HTMLElement).matches(sel))) {
      return false;
    }
  }

  return true;
}

function attachFog(section: Element) {
  const host = document.createElement("div");
  host.className = "fog-mount";
  (section as HTMLElement).classList.add("fog-scope");
  section.prepend(host);

  // Render fog into the mount
  const root = createRoot(host);
  root.render(<BackgroundFog intensity="md" speed="slow" tint="slate" />);
}

export default function AutoFogManager() {
  useEffect(() => {
    // Respect global fog toggle
    if (document.documentElement.dataset.fog === "off") return;

    const scan = () => {
      // Query by selectors first - be more specific
      const explicit = SELECTORS.flatMap(sel => Array.from(document.querySelectorAll(sel)));

      // Also try opportunistic matches: limited to specific containers
      const candidates = Array.from(document.querySelectorAll("section:not(.min-h-screen), header:not(.min-h-screen), main"));
      const targets = new Set<Element>([...explicit, ...candidates]);
      
      console.log(`🌫️ Fog scan found ${targets.size} potential targets:`, Array.from(targets).map(el => el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : '')));

      targets.forEach(el => {
        try { 
          if (isEligible(el)) {
            console.log(`🌫️ Attaching fog to:`, el.tagName, el.className);
            attachFog(el);
          } else {
            console.log(`🌫️ Skipping (not eligible):`, el.tagName, el.className);
          }
        } catch (error) {
          console.error('Fog attachment failed for element:', el, error);
        }
      });
    };

    // Initial scan
    scan();

    // Observe DOM changes and rescan lightly
    const mo = new MutationObserver((mutations) => {
      let needsScan = false;
      for (const m of mutations) {
        if (m.addedNodes.length || m.attributeName === "class" || m.attributeName === "style") {
          needsScan = true; 
          break;
        }
      }
      if (needsScan) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(scan);
        } else {
          setTimeout(scan, 100);
        }
      }
    });
    
    mo.observe(document.documentElement, { 
      subtree: true, 
      childList: true, 
      attributes: true, 
      attributeFilter: ["class", "style"] 
    });

    return () => mo.disconnect();
  }, []);

  return null;
}