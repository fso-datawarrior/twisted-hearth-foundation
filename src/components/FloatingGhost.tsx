import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GhostProps {
  delay: number;
}

const Ghost = ({ delay }: GhostProps) => {
  const [trajectory, setTrajectory] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    duration: 0,
  });

  useEffect(() => {
    // Random starting position (from edges)
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let startX, startY, endX, endY;

    switch (side) {
      case 0: // top
        startX = Math.random() * 100;
        startY = -10;
        endX = Math.random() * 100;
        endY = 110;
        break;
      case 1: // right
        startX = 110;
        startY = Math.random() * 100;
        endX = -10;
        endY = Math.random() * 100;
        break;
      case 2: // bottom
        startX = Math.random() * 100;
        startY = 110;
        endX = Math.random() * 100;
        endY = -10;
        break;
      default: // left
        startX = -10;
        startY = Math.random() * 100;
        endX = 110;
        endY = Math.random() * 100;
    }

    setTrajectory({
      startX,
      startY,
      endX,
      endY,
      duration: 10 + Math.random() * 8, // 10-18 seconds (faster to see more at once)
    });
  }, []);

  const size = 50 + Math.random() * 50; // 50-100px (larger)

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{
        left: `${trajectory.startX}%`,
        top: `${trajectory.startY}%`,
        opacity: 0,
      }}
      animate={{
        left: `${trajectory.endX}%`,
        top: `${trajectory.endY}%`,
        opacity: [0, 0.95, 0.95, 0],
      }}
      transition={{
        duration: trajectory.duration,
        delay,
        ease: "linear",
        opacity: {
          duration: trajectory.duration,
          times: [0, 0.1, 0.9, 1],
        },
      }}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        {/* Ghost body */}
        <path
          d="M50 10C30 10 15 25 15 45C15 55 15 85 15 95C15 95 20 90 25 95C30 100 30 90 35 95C40 100 40 90 45 95C50 100 50 90 55 95C60 100 60 90 65 95C70 100 70 90 75 95C80 100 85 95 85 95C85 85 85 55 85 45C85 25 70 10 50 10Z"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(200, 200, 255, 0.5)"
          strokeWidth="1"
        />
        {/* Eyes */}
        <motion.ellipse
          cx="38"
          cy="40"
          rx="5"
          ry="8"
          fill="#1a0f2e"
          animate={{
            ry: [8, 2, 8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
        <motion.ellipse
          cx="62"
          cy="40"
          rx="5"
          ry="8"
          fill="#1a0f2e"
          animate={{
            ry: [8, 2, 8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
        {/* Mouth */}
        <ellipse cx="50" cy="60" rx="8" ry="10" fill="#1a0f2e" />
      </svg>
    </motion.div>
  );
};

export const FloatingGhosts = () => {
  const [ghosts, setGhosts] = useState<number[]>([]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Spawn ghosts at intervals
    const intervals: NodeJS.Timeout[] = [];
    const maxGhosts = 12;

    for (let i = 0; i < maxGhosts; i++) {
      const timeout = setTimeout(() => {
        setGhosts((prev) => [...prev, Date.now() + i]);
      }, i * 1000); // Spawn every 1 second

      intervals.push(timeout);
    }

    return () => {
      intervals.forEach((interval) => clearTimeout(interval));
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {ghosts.map((id, index) => (
        <Ghost key={id} delay={0} />
      ))}
    </div>
  );
};
