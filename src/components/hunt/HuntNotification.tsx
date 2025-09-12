import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useHunt } from "./HuntProvider";
import { HUNT_ENABLED } from "./hunt-config";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HuntNotification() {
  const { user } = useAuth();
  const { progress, total, loading } = useHunt();
  const [dismissed, setDismissed] = useState(false);

  if (!HUNT_ENABLED || !user || loading || progress > 0 || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-50"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(59,110,71,0.4)",
            "0 0 0 8px rgba(59,110,71,0.1)",
            "0 0 0 0 rgba(59,110,71,0.4)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className={cn(
          "bg-background/90 backdrop-blur border border-accent-green/30",
          "rounded-lg px-4 py-3 shadow-lg max-w-[240px]",
          "cursor-pointer hover:bg-background/95 transition-colors"
        )}
        onClick={() => setDismissed(true)}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Eye className="w-5 h-5 text-accent-green" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Hunt Active!
            </p>
            <p className="text-xs text-muted-foreground">
              {total} secrets await discovery
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}