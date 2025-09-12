import { useState } from "react";
import { useHunt as useHuntDatabase } from "@/hooks/use-hunt";
import { HUNT_ENABLED } from "./hunt-config";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function HuntProgress() {
  const { isFound, foundCount, totalCount, hints, loading, error } = useHuntDatabase();
  const [showPanel, setShowPanel] = useState(false);

  if (!HUNT_ENABLED || loading || foundCount === 0) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowPanel(false);
    }
  };

  // Create hint descriptions from database hints
  const hintDescriptions: Record<string, { title: string; description: string; meta: string }> = {};
  hints.forEach(hint => {
    hintDescriptions[hint.id.toString()] = {
      title: hint.title,
      description: hint.hint_text,
      meta: `${hint.category} • ${hint.difficulty_level} • ${hint.points} pts`
    };
  });

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
        Hunt: {foundCount} / {totalCount}
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
                  {foundCount}
                </span>
                <span className="text-muted-foreground"> / {totalCount}</span>
              </div>
              <div className="w-full bg-bg-2 rounded-full h-2">
                <div
                  className="bg-accent-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(foundCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-subhead text-sm text-accent-gold mb-3">
                Secrets Found:
              </h4>
              {Object.entries(hintDescriptions).map(([id, hint]) => (
                <div
                  key={id}
                  className={`
                    flex flex-col gap-1 text-sm p-3 rounded border
                    ${
                      isFound(parseInt(id, 10))
                        ? "text-accent-green bg-accent-green/10 border-accent-green/20"
                        : "text-muted-foreground border-muted/20"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {isFound(parseInt(id, 10)) ? "✓" : "○"}
                    </span>
                    <span className="font-medium">{hint.title}</span>
                  </div>
                  <div className="ml-5 text-xs opacity-80">
                    {hint.description}
                  </div>
                  <div className="ml-5 text-xs opacity-60 font-mono">
                    {hint.meta}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                Error: {error}
              </div>
            )}

            {import.meta.env.DEV && (
              <div className="mt-6 pt-4 border-t border-accent-purple/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In database mode, reset just refreshes data
                    window.location.reload();
                    setShowPanel(false);
                  }}
                  className="w-full text-xs opacity-60 hover:opacity-100"
                >
                  Refresh Hunt Data (Dev Only)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}