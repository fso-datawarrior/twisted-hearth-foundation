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
        "block select-none px-3 py-2 text-base text-white hover:text-amber-200",
        "focus:outline-none focus:ring-2 focus:ring-white/40 rounded",
        "transition-colors cursor-pointer",
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