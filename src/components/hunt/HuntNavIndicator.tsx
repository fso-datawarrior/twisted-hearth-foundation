import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useHunt } from "./HuntProvider";
import { HUNT_ENABLED } from "./hunt-config";
import { cn } from "@/lib/utils";

export default function HuntNavIndicator() {
  const { user } = useAuth();
  const { progress, loading } = useHunt();

  if (!HUNT_ENABLED || !user || loading || progress > 5) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(197,164,93,0.5)",
            "0 0 0 4px rgba(197,164,93,0.2)",
            "0 0 0 0 rgba(197,164,93,0.5)"
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className={cn(
          "w-2 h-2 bg-accent-gold rounded-full",
          "shadow-[0_0_8px_rgba(197,164,93,0.8)]"
        )}
        title="Scavenger Hunt is Active"
      />
    </motion.div>
  );
}