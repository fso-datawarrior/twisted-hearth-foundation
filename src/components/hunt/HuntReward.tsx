// TODO v2: Implement hunt reward system
// Currently disabled via feature flag HUNT_ENABLED=false

interface HuntRewardProps {
  isUnlocked: boolean;
  rewardType: "story" | "image" | "audio" | "special";
  rewardData?: any;
  className?: string;
}

const HUNT_ENABLED = false; // Feature flag - enable in v2

const HuntReward = ({ isUnlocked, rewardType, rewardData, className }: HuntRewardProps) => {
  if (!HUNT_ENABLED) {
    return null; // Hidden until feature is enabled
  }

  if (!isUnlocked) {
    return (
      <div className={`bg-card p-6 rounded-lg border border-accent-purple/30 opacity-50 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-bg-2 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="font-subhead text-lg text-muted-foreground">
            Reward Locked
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Complete the hunt to reveal this secret
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card p-6 rounded-lg border border-accent-gold/50 ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-accent-gold/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">
            {rewardType === "story" && "📖"}
            {rewardType === "image" && "🖼️"}
            {rewardType === "audio" && "🎵"}
            {rewardType === "special" && "✨"}
          </span>
        </div>
        <h3 className="font-subhead text-lg text-accent-gold mb-2">
          Hunt Reward Unlocked!
        </h3>
        
        {/* TODO v2: Render actual reward content based on type and data */}
        <div className="bg-bg-2 p-4 rounded border border-accent-purple/30">
          <p className="font-body text-sm text-muted-foreground italic">
            "Every secret revealed makes the story darker... and more beautiful."
          </p>
        </div>
      </div>
    </div>
  );
};

export default HuntReward;