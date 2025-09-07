import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  label: string;
  onNavigate?: () => void;
  className?: string;
};

export function NavItem({ href, label, onNavigate, className }: NavItemProps) {
  return (
    <motion.a
      href={href}
      onClick={onNavigate}
      className={cn(
        "block select-none px-3 py-2 text-base tracking-[0.02em] text-neutral-100/90",
        "hover:tracking-[0.06em] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        "transition-[letter-spacing,color]",
        className
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {label}
    </motion.a>
  );
}