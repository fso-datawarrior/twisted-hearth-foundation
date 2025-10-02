import { useState } from "react";
import { useHunt as useHuntDatabase } from "@/hooks/use-hunt";
import { HUNT_ENABLED } from "./hunt-config";
import { Button } from "@/components/ui/button";
import { X, Code2 } from "lucide-react";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";

export default function HuntProgress() {
  const { isFound, foundCount, totalCount, hints, loading, error } = useHuntDatabase();
  const [showPanel, setShowPanel] = useState(false);
  const { isDeveloperMode } = useDeveloperMode();
  
  if (!HUNT_ENABLED || loading || foundCount === 0) {
    return null;
  }

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

      {/* Modal */}
      {showPanel && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPanel(false)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-muted/30">
              <h2 className="text-lg font-heading text-ink">Hunt Progress</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono">{foundCount} / {totalCount}</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="bg-accent-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(foundCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Found Runes List */}
              <div className="space-y-2">
                <h3 className="text-sm font-subhead text-ink">Found Runes</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {hints
                    .filter(hint => isFound(hint.id))
                    .map(hint => (
                      <div key={hint.id} className="flex items-center gap-2 p-2 bg-accent-green/10 rounded border border-accent-green/20">
                        <div className="w-2 h-2 bg-accent-green rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink truncate">
                            {hint.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hint.category} • {hint.points} pts
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Developer Mode Notice */}
              {isDeveloperMode && (
                <div className="p-3 bg-accent-purple/10 rounded border border-accent-purple/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Code2 className="w-4 h-4 text-accent-purple" />
                    <span className="text-accent-purple font-medium">Developer Mode Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All runes are visible. Toggle developer mode in the navigation bar to hide them.
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-3 bg-destructive/10 rounded border border-destructive/20">
                  <div className="text-sm text-destructive">
                    Error loading hunt data: {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}