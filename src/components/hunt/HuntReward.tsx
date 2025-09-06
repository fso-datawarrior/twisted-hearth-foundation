import { useState, useEffect } from "react";
import { useHunt } from "./HuntProvider";
import { HUNT_ENABLED, REWARD_MESSAGES } from "./hunt-config";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";

export default function HuntReward() {
  const { completed, progress, total } = useHunt();
  const [showModal, setShowModal] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [message] = useState(() => {
    // Pick a random message on component mount
    return REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)];
  });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Show modal when completed and not dismissed this session
  useEffect(() => {
    if (completed && !sessionDismissed && HUNT_ENABLED) {
      setShowModal(true);
    }
  }, [completed, sessionDismissed]);

  if (!HUNT_ENABLED) return null;

  const handleClose = () => {
    setShowModal(false);
    setSessionDismissed(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      ariaLabel="Hunt completion reward"
      className="max-w-2xl"
    >
      <div className="text-center p-8" onKeyDown={handleKeyDown}>
        {/* Confetti effect for non-reduced motion */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="confetti-container">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: [
                      "var(--accent-gold)",
                      "var(--accent-green)",
                      "var(--accent-purple)",
                      "var(--accent-red)",
                    ][Math.floor(Math.random() * 4)],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="relative z-10">
          <div className="mb-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-heading text-3xl md:text-4xl mb-4 text-accent-gold">
              All Secrets Found!
            </h2>
            <div className="text-accent-green font-subhead text-lg mb-2">
              {progress} / {total} Complete
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-bg-2 p-6 rounded-lg border border-accent-gold/30 max-w-md mx-auto">
              <p className="font-body text-lg leading-relaxed text-muted-foreground italic">
                "{message}"
              </p>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="bg-accent-gold hover:bg-accent-gold/80 text-bg font-subhead px-8 py-3"
            autoFocus
          >
            Close
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Congratulations on your keen eye for hidden things!
          </p>
        </div>
      </div>

      <style>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: confetti-fall 3s ease-in-out infinite;
          opacity: 0.8;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti-piece {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </Modal>
  );
}