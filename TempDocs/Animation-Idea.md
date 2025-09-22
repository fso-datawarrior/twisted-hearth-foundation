You’ve got the bones—let’s juice the motion so it feels magical but still classy (and still respects reduced-motion). Here’s a focused upgrade plan plus a copy-paste Cursor patch.

# What we’ll add

* **Pointer-tilt + parallax:** cards subtly tilt toward the cursor; icon floats at a different depth.
* **Sheen sweep:** quick diagonal light sweep on hover/focus.
* **Rune glow pulse:** tasteful gold/green inner-glow that breathes while hovered.
* **Staggered reveal:** tiles rise in with 60ms stagger.
* **Magnetic hover:** a tiny scale up with springy release.
* **Reduced-motion safe:** all of the above collapses to color/opacity only if the user prefers reduced motion.

---

# Drop-in patch for `src/components/PrepLinks.tsx`

Paste this in Cursor; it keeps your current styles and swaps in spicier motion. (Only the changed/added bits are below—Cursor will merge.)

```diff
*** a/src/components/PrepLinks.tsx
--- b/src/components/PrepLinks.tsx
@@
-import { motion, useReducedMotion } from "framer-motion";
+import { motion, useReducedMotion, useMotionValue, useSpring, MotionConfig } from "framer-motion";
+import React from "react";

@@
-export default function PrepLinks() {
-  const reduce = useReducedMotion();
-  return (
-    <section className="mb-16" aria-label="Quick navigation">
-      <nav aria-labelledby="prep-heading" className="bg-[color:var(--bg-2)]/85 rounded-2xl border border-[color:var(--accent-purple)]/30 p-6 sm:p-8 backdrop-blur">
+export default function PrepLinks() {
+  const reduce = useReducedMotion();
+
+  // Staggered reveal for list
+  const list = {
+    hidden: { opacity: 0, y: 6 },
+    show: {
+      opacity: 1,
+      y: 0,
+      transition: { type: "tween", duration: 0.28 }
+    }
+  };
+
+  return (
+    <section className="mb-16" aria-label="Quick navigation">
+      <nav aria-labelledby="prep-heading" className="bg-[color:var(--bg-2)]/85 rounded-2xl border border-[color:var(--accent-purple)]/30 p-6 sm:p-8 backdrop-blur">
         <h2 id="prep-heading" className="font-subhead text-2xl sm:text-3xl text-center mb-6 sm:mb-8 text-[color:var(--accent-gold)] tracking-tight">
           Prepare for Your Twisted Tale
         </h2>
 
-        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="list">
+        <MotionConfig reducedMotion="user">
+          <motion.ul
+            role="list"
+            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
+            initial={reduce ? undefined : "hidden"}
+            whileInView={reduce ? undefined : "show"}
+            viewport={{ once: true, amount: 0.2 }}
+          >
           {tiles.map(({ to, title, subtitle, icon: Icon, accent, hintKey, testId }, i) => {
-            const MotionLi = reduce ? "li" : motion.li;
-            return (
-              <MotionLi
-                key={title}
-                initial={reduce ? undefined : { opacity: 0, y: 12 }}
-                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
-                viewport={{ once: true, amount: 0.3 }}
-              >
+            // Card-level motion values for pointer tilt
+            const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 12 });
+            const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 12 });
+            const scale = useSpring(1, { stiffness: 180, damping: 14 });
+
+            const onMove: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
+              if (reduce) return;
+              const b = e.currentTarget.getBoundingClientRect();
+              const px = (e.clientX - b.left) / b.width;  // 0..1
+              const py = (e.clientY - b.top) / b.height;  // 0..1
+              ry.set((px - 0.5) * 6); // rotateY
+              rx.set(-(py - 0.5) * 6); // rotateX
+            };
+            const onLeave = () => { if (!reduce) { rx.set(0); ry.set(0); scale.set(1); } };
+
+            return (
+              <motion.li key={title} variants={reduce ? undefined : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } }}>
                 <Link
                   to={to}
                   data-testid={testId}
                   data-hint-key={hintKey}
                   aria-describedby={`${testId}-sub`}
                   className={[
                     "group relative block h-full rounded-xl border",
                     accentClasses(accent),
-                    "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]",
+                    // dark glass, with subtle vignette
+                    "bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.05),rgba(255,255,255,0.012)_60%,transparent_70%)]",
                     "px-6 py-6 md:px-7 md:py-7",
                     "text-[color:var(--ink)]",
                     "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                     "focus-visible:ring-[color:var(--accent-gold)] focus-visible:ring-offset-[color:var(--bg)]",
-                    "shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
-                    "before:absolute before:inset-0 before:rounded-xl before:pointer-events-none",
-                    "before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_30px_rgba(197,164,93,0.10)]",
-                    "transition-[transform,box-shadow,opacity] duration-200 ease-out will-change-transform"
+                    "shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
+                    // inner glow layer
+                    "before:absolute before:inset-0 before:rounded-xl before:pointer-events-none",
+                    "before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_40px_rgba(197,164,93,0.10)]",
+                    // sheen layer (sweeps on hover)
+                    "after:absolute after:inset-0 after:rounded-xl after:pointer-events-none after:opacity-0",
+                    "after:bg-[linear-gradient(55deg,transparent,rgba(255,255,255,0.25)_15%,transparent_30%)]",
+                    "transition-[transform,box-shadow,opacity] duration-200 ease-out will-change-transform"
                   ].join(" ")}
+                  onMouseMove={onMove}
+                  onMouseLeave={onLeave}
+                  onMouseEnter={() => !reduce && scale.set(1.02)}
                 >
-                  {reduce ? (
-                    <div className="flex items-center gap-4">
+                  {reduce ? (
+                    <div className="flex items-center gap-4">
                       <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/35 bg-black/30">
                         <Icon className="h-5 w-5" aria-hidden="true" />
                       </span>
                       <div className="min-w-0">
                         <h3 className="font-subhead text-xl text-[color:var(--accent-gold)] tracking-tight">
                           {title}
                         </h3>
                         <p id={`${testId}-sub`} className="text-sm/5 opacity-90">
                           {subtitle}
                         </p>
                       </div>
                     </div>
                   ) : (
-                    <motion.div
-                      whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
-                      whileTap={{ scale: 0.99 }}
-                      className="flex items-center gap-4"
-                    >
-                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/35 bg-black/30 group-hover:border-[color:var(--accent-gold)]/60 transition-colors">
-                        <Icon className="h-5 w-5" aria-hidden="true" />
-                      </span>
+                    <motion.div
+                      style={{ rotateX: rx, rotateY: ry, scale }}
+                      whileTap={{ scale: 0.995 }}
+                      className="flex items-center gap-4 will-change-transform"
+                      onHoverStart={(e) => {
+                        const el = e.currentTarget.parentElement as HTMLElement;
+                        if (el) el.style.setProperty("--sheen", "1");
+                      }}
+                      onHoverEnd={(e) => {
+                        const el = e.currentTarget.parentElement as HTMLElement;
+                        if (el) el.style.setProperty("--sheen", "0");
+                      }}
+                    >
+                      {/* icon gets a *slight* counter-parallax */}
+                      <motion.span
+                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent-gold)]/35 bg-black/30 group-hover:border-[color:var(--accent-gold)]/60 transition-colors"
+                        style={{ rotateX: rx.to(v=>-v*0.5), rotateY: ry.to(v=>-v*0.5) }}
+                      >
+                        <Icon className="h-5 w-5" aria-hidden="true" />
+                      </motion.span>
                       <div className="min-w-0">
                         <h3 className="font-subhead text-xl text-[color:var(--accent-gold)] tracking-tight">
                           {title}
                         </h3>
                         <p id={`${testId}-sub`} className="text-sm/5 opacity-90">
                           {subtitle}
                         </p>
                       </div>
-                      <span className="ml-auto text-xs opacity-0 group-focus-visible:opacity-100 group-hover:opacity-70 transition-opacity" aria-hidden="true">✧</span>
+                      {/* rune sparkle at far edge */}
+                      <span className="ml-auto text-xs opacity-0 group-focus-visible:opacity-100 group-hover:opacity-80 transition-opacity" aria-hidden="true">✧</span>
                     </motion.div>
                   )}
+                  {/* trigger sheen + glow on hover/focus */}
+                  <style>{`
+                    .group:hover::after, .group:focus-visible::after { opacity: .85; transform: translateX(15%); transition: transform .5s ease, opacity .2s; }
+                    .group::after { transform: translateX(-35%); }
+                    .group:hover::before { box-shadow: inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 60px rgba(197,164,93,.16); }
+                  `}</style>
                 </Link>
-              </MotionLi>
+              </motion.li>
             );
           })}
-        </ul>
+          </motion.ul>
+        </MotionConfig>
       </nav>
     </section>
   );
 }
```

---

## Why this feels better

* **Agency:** pointer-tilt makes the tiles respond to guests.
* **Depth:** parallax icon + sheen sell the 3D illusion without heavy GPU cost.
* **Rhythm:** staggered reveal sets a cadence as users scroll the section into view.
* **Tasteful drama:** pulses and glows are subtle, on-brand, and not “gaming-UI loud.”
* **A11y retained:** same focus handling and reduced-motion fallback.

If you want even more drama, we can add a **soft fog pass** behind the tiles (CSS `mask-image` with drifting noise) or a **spark particle layer** that only appears on desktops ≥lg.
