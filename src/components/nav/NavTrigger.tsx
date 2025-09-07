import { motion, useReducedMotion } from "framer-motion";
import { NavThemeIcon } from "./NavThemeIcon";

type Props = { onOpen: () => void; className?: string; };

export function NavTrigger({ onOpen, className }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      aria-label="Open navigation"
      onClick={onOpen}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "fixed right-4 top-4 z-[100] grid h-12 w-12 place-items-center",
        "rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/10",
        "shadow-[0_6px_20px_rgba(0,0,0,0.45)] overflow-hidden relative nav-glow",
        className || ""
      ].join(" ")}
      data-view-transition-name="nav-trigger"
    >
      {/* Mirror frame */}
      <NavThemeIcon className="pointer-events-none" />

      {/* Shadowed, faint "face" – abstract blob */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0.3 }}
        animate={prefersReduced ? { opacity: 0.35 } : { opacity: [0.3, 0.72, 0.3] }}
        transition={prefersReduced ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="block h-2/3 w-2/3 rounded-full bg-slate-200/20 blur-sm" />
      </motion.div>
    </motion.button>
  );
}