// TODO v2: Implement full scavenger hunt progress tracking
// Currently disabled via feature flag HUNT_ENABLED=false

interface HuntProgressProps {
  totalHints: number;
  foundHints: string[];
  className?: string;
}

const HUNT_ENABLED = false; // Feature flag - enable in v2

const HuntProgress = ({ totalHints, foundHints, className }: HuntProgressProps) => {
  if (!HUNT_ENABLED) {
    return null; // Hidden until feature is enabled
  }

  const progress = (foundHints.length / totalHints) * 100;

  return (
    <div className={`bg-card p-4 rounded-lg border border-accent-purple/30 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-subhead text-lg text-accent-gold">Hunt Progress</h3>
        <span className="font-body text-sm text-muted-foreground">
          {foundHints.length} / {totalHints}
        </span>
      </div>
      
      <div className="w-full bg-bg-2 rounded-full h-2">
        <div 
          className="bg-accent-gold h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {foundHints.length > 0 && (
        <div className="mt-3">
          <p className="font-body text-xs text-muted-foreground mb-1">Found clues:</p>
          <div className="flex flex-wrap gap-1">
            {foundHints.map((hintId) => (
              <span 
                key={hintId}
                className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded text-xs font-body"
              >
                {hintId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HuntProgress;