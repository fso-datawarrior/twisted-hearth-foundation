import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { HUNT_ENABLED } from "./hunt-config";

export default function HuntDebug() {
  const [showAllRunes, setShowAllRunes] = useState(false);

  if (!HUNT_ENABLED) {
    return null;
  }

  // Add global CSS class to body when showing all runes
  useEffect(() => {
    if (showAllRunes) {
      document.body.classList.add('hunt-debug-show-all');
    } else {
      document.body.classList.remove('hunt-debug-show-all');
    }
  }, [showAllRunes]);

  return (
    <Button
      onClick={() => setShowAllRunes(!showAllRunes)}
      variant="outline"
      size="sm"
      className="fixed top-20 right-4 z-50 bg-black/80 text-white border-accent-gold hover:bg-accent-gold/20"
    >
      {showAllRunes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span className="ml-2">{showAllRunes ? 'Hide' : 'Show'} All Runes</span>
    </Button>
  );
}
