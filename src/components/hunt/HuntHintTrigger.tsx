import { useEffect, useState } from "react";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { useHunt } from "./HuntProvider";
import { useProximity } from "@/hooks/use-proximity";
import { cn } from "@/lib/utils";
import { HUNT_ENABLED, HUNT_DEBUG_MODE, HUNT_PROXIMITY } from "./hunt-config";
import { useToast } from "@/hooks/use-toast";
import { getRuneInfo } from "./rune-mapping";

type Props = {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  bonus?: boolean;
};

export default function HuntHintTrigger({ id, label, hint, className, bonus = false }: Props) {
  const { isDeveloperMode } = useDeveloperMode();
  const { isFound, markFound, progress, total } = useHunt();
  const { ref, near, prefersReduced, isTouch } = useProximity(HUNT_PROXIMITY.RADIUS);
  const [localToast, setLocalToast] = useState(false);
  const { toast } = useToast();
  const runeInfo = getRuneInfo(id);

  const found = isFound(id);

  // Enhanced visibility logic - Use developer mode context
  const getBaseVisibility = () => {
    if (isDeveloperMode) {
      return "opacity-100"; // Show all runes when developer mode is on
    }
    if (HUNT_DEBUG_MODE) {
      return "opacity-80"; // Debug mode - slightly visible
    }
    if (isTouch) {
      return "opacity-40"; // Touch devices
    }
    if (near) {
      return "opacity-100"; // Near proximity
    }
    return "opacity-0"; // Hidden
  };

  const baseVis = getBaseVisibility();

  const glow = found
    ? "bg-[--accent-gold]/40 ring-[--accent-gold] shadow-[0_0_10px_rgba(197,164,93,0.6)]"
    : "bg-[--accent-green]/40 ring-[--accent-green]/70 shadow-[0_0_10px_rgba(59,110,71,0.55)]";

  if (!HUNT_ENABLED) {
    return null;
  }

  const handle = () => {
    if (!found) {
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

  return (
    <div className="relative">
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        aria-label={runeInfo?.name || label}
        onClick={handle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
        }}
        className={cn(
          "hunt-rune ring-1 transition outline-none motion-reduce:transition-none",
          glow,
          baseVis,
          "hover:opacity-100 focus-visible:opacity-100",
          className
        )}
        title={runeInfo?.description || hint || runeInfo?.name}
      />
      {localToast && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white shadow-md">
          {bonus ? "Bonus secret!" : "Secret found!"}
        </div>
      )}
    </div>
  );
}