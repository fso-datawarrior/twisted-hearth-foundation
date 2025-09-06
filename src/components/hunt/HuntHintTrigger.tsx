// TODO v2: Implement full scavenger hunt functionality
// Currently disabled via feature flag HUNT_ENABLED=false

interface HuntHintTriggerProps {
  hintId: string;
  triggerElement?: React.ReactNode;
  onTrigger?: (hintId: string) => void;
  className?: string;
}

const HUNT_ENABLED = false; // Feature flag - enable in v2

const HuntHintTrigger = ({ 
  hintId, 
  triggerElement, 
  onTrigger, 
  className 
}: HuntHintTriggerProps) => {
  if (!HUNT_ENABLED) {
    return null; // Hidden until feature is enabled
  }

  const handleTrigger = () => {
    console.log(`Hunt hint triggered: ${hintId}`);
    onTrigger?.(hintId);
    // TODO v2: Implement actual hint revealing logic
  };

  return (
    <div 
      className={`cursor-pointer ${className}`}
      onClick={handleTrigger}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTrigger();
        }
      }}
      aria-label={`Reveal hunt hint ${hintId}`}
    >
      {triggerElement || (
        <div className="w-4 h-4 bg-accent-gold rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default HuntHintTrigger;