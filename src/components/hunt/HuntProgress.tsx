import { useState } from "react";
import { useHunt } from "./HuntProvider";
import { HUNT_ENABLED } from "./hunt-config";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function HuntProgress() {
  const { isFound, progress, total, reset } = useHunt();
  const [showPanel, setShowPanel] = useState(false);

  if (!HUNT_ENABLED || progress === 0) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowPanel(false);
    }
  };

  // Sample hint descriptions for the progress panel
  const hintDescriptions: Record<string, string> = {
    "home.logo": "Hidden mark near the crest",
    "home.moon": "Something stirs beneath the moon",
    "home.path": "Footsteps that don't belong",
    "home.cta": "A whisper urging you forward",
    "home.footer.icon": "A faint crown in the dark",
    "vig.goldilocks": "Knives gleam where spoons should lie",
    "vig.jack": "Coins seldom tell a clean story",
    "vig.snowwhite": "Glass remembers every breath",
    "vig.link": "Stories have roots",
    "costumes.header": "Masks within masks",
    "costumes.cta": "Seams stitched with secrets",
    "feast.header": "Flavor sharp as a blade",
    "feast.board": "A diced confession",
    "schedule.date": "Time keeps darker promises",
    "about.sig": "Ink that won't dry",
  };

  return (
    <>
      {/* Floating chip */}
      <button
        className="
          fixed bottom-4 right-4 z-50 px-4 py-2 
          bg-accent-green text-ink rounded-full shadow-lg
          hover:bg-accent-green/80 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold
          font-subhead text-sm
        "
        onClick={() => setShowPanel(true)}
        aria-label="Open hunt progress"
      >
        Hunt: {progress} / {total}
      </button>

      {/* Progress panel */}
      {showPanel && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowPanel(false)}
          onKeyDown={handleKeyDown}
        >
          <div
            className="
              bg-black/90 backdrop-blur-sm rounded-lg border border-accent-green/30 p-6 max-w-md w-full
              max-h-[80vh] overflow-y-auto shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-subhead text-xl text-accent-gold">
                Hunt Progress
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                className="h-8 w-8 p-0"
                aria-label="Close progress panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <div className="text-center mb-2">
                <span className="font-subhead text-2xl text-accent-green">
                  {progress}
                </span>
                <span className="text-muted-foreground"> / {total}</span>
              </div>
              <div className="w-full bg-bg-2 rounded-full h-2">
                <div
                  className="bg-accent-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-subhead text-sm text-accent-gold mb-3">
                Secrets Found:
              </h4>
              {Object.entries(hintDescriptions).map(([id, description]) => (
                <div
                  key={id}
                  className={`
                    flex items-center gap-2 text-sm p-2 rounded
                    ${
                      isFound(id)
                        ? "text-accent-green bg-accent-green/10"
                        : "text-muted-foreground"
                    }
                  `}
                >
                  <span className="text-xs">
                    {isFound(id) ? "✓" : "○"}
                  </span>
                  <span className="flex-1">{description}</span>
                </div>
              ))}
            </div>

            {import.meta.env.DEV && (
              <div className="mt-6 pt-4 border-t border-accent-purple/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    setShowPanel(false);
                  }}
                  className="w-full text-xs opacity-60 hover:opacity-100"
                >
                  Reset Hunt (Dev Only)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}