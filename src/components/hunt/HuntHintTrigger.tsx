import { useEffect, useState } from "react";
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

export default function HuntHintTrigger({ id, label, hint, className, bonus = false }: Props) {
  const { isFound, markFound, progress, total } = useHunt();
  const { ref, near, prefersReduced, isTouch } = useProximity(120);
  const [localToast, setLocalToast] = useState(false);
  const { toast } = useToast();

  const DEBUG = import.meta.env.DEV && import.meta.env.VITE_HUNT_DEBUG === "1";
  const found = isFound(id);

  const baseVis = DEBUG ? "opacity-80"
    : isTouch ? "opacity-40"
    : near ? "opacity-100" : "opacity-0";

  const glow = found
    ? "bg-[--accent-gold]/40 ring-[--accent-gold] shadow-[0_0_10px_rgba(197,164,93,0.6)]"
    : "bg-[--accent-green]/40 ring-[--accent-green]/70 shadow-[0_0_10px_rgba(59,110,71,0.55)]";

  if (!HUNT_ENABLED) return null;

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
        ref={ref as any}
        type="button"
        aria-label={label}
        aria-pressed={found}
        onClick={handle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
        }}
        className={cn(
          "hunt-rune h-5 w-5 rounded-full ring-1 transition outline-none motion-reduce:transition-none",
          glow,
          baseVis,
          "hover:opacity-100 focus-visible:opacity-100",
          className
        )}
        title={hint}
      />
      {localToast && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white shadow-md">
          {bonus ? "Bonus secret!" : "Secret found!"}
        </div>
      )}
    </div>
  );
}