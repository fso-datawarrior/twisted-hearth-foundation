import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useHunt } from "./HuntProvider";
import { useProximity } from "@/hooks/use-proximity";
import { cn } from "@/lib/utils";
import { HUNT_ENABLED } from "./hunt-config";
import { useToast } from "@/hooks/use-toast";

type Props = {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  bonus?: boolean;
};

// Map hint IDs to rune image paths
const getRunePath = (id: string): string => {
  return `/img/runes/${id}.png`;
};

export default function HuntRune({ id, label, hint, className, bonus = false }: Props) {
  const { user } = useAuth();
  const { isFound, markFound, progress, total } = useHunt();
  const { ref, near, prefersReduced, isTouch } = useProximity(120);
  const [localToast, setLocalToast] = useState(false);
  const { toast } = useToast();

  const DEBUG = import.meta.env.DEV && import.meta.env.VITE_HUNT_DEBUG === "1";
  const found = isFound(id);

  if (!HUNT_ENABLED) return null;

  // Don't render runes for unauthenticated users
  if (!user) {
    return (
      <div 
        ref={ref as any}
        className={cn(
          "hunt-rune-placeholder h-5 w-5 rounded-full opacity-20 cursor-pointer",
          "hover:opacity-60 transition-opacity",
          className
        )}
        onClick={() => {
          toast({
            title: "Sign in to join the hunt",
            description: "Create an account to discover the hidden secrets",
          });
        }}
        title="Sign in required"
      />
    );
  }

  const baseVis = DEBUG ? "opacity-80"
    : isTouch ? "opacity-40"
    : near ? "opacity-100" : "opacity-0";

  const handle = () => {
    if (!found && user) {
      markFound(id);
      const message = bonus ? "Bonus secret found!" : "Secret found!";
      const description = bonus ? label : `${label} — ${progress + 1} / ${total}`;
      
      toast({
        title: message,
        description: description,
      });
      setLocalToast(true);
      setTimeout(() => setLocalToast(false), 1200);
    }
  };

  const animationDelay = parseInt(id, 10) * 0.3; // Stagger animations

  return (
    <div className="relative">
      <motion.button
        ref={ref as any}
        type="button"
        aria-label={label}
        aria-pressed={found}
        onClick={handle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { 
            e.preventDefault(); 
            handle(); 
          }
        }}
        className={cn(
          "hunt-rune h-5 w-5 rounded-full transition outline-none motion-reduce:transition-none",
          "hover:opacity-100 focus-visible:opacity-100",
          baseVis,
          className
        )}
        title={hint}
        initial={{ opacity: 0 }}
        animate={
          !prefersReduced ? {
            opacity: found 
              ? [0.6, 0.8, 0.6] 
              : [0, 0.3, 0],
          } : {
            opacity: found ? 0.6 : (near ? 0.3 : 0)
          }
        }
        transition={{
          duration: 1.5,
          repeat: found ? 0 : Infinity,
          repeatDelay: 4.5,
          delay: animationDelay,
        }}
      >
        <img 
          src={getRunePath(id)}
          alt=""
          className={cn(
            "w-full h-full object-contain pointer-events-none",
            found 
              ? "filter drop-shadow-[0_0_4px_rgba(197,164,93,0.8)]" 
              : "filter drop-shadow-[0_0_4px_rgba(59,110,71,0.6)]"
          )}
          style={{
            filter: found 
              ? 'brightness(1.2) drop-shadow(0 0 4px rgba(197,164,93,0.8))'
              : 'brightness(0.9) drop-shadow(0 0 4px rgba(59,110,71,0.6))'
          }}
        />
      </motion.button>
      
      {localToast && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white shadow-md">
          {bonus ? "Bonus secret!" : "Secret found!"}
        </div>
      )}
    </div>
  );
}