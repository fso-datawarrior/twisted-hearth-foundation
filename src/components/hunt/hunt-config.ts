import { getTotalRuneCount } from './rune-mapping';

export const HUNT_TOTAL = getTotalRuneCount(); // 16 runes available
export const HUNT_ENABLED = true;

// Debug and visibility controls - Use existing developer mode context
export const HUNT_DEBUG_MODE = import.meta.env.DEV || (
  import.meta.env.VITE_HUNT_DEBUG === "1" || 
  (typeof window !== 'undefined' && localStorage.getItem('hunt-debug') === 'true')
);

// Show all runes when developer mode is enabled (from DeveloperModeContext)
export const HUNT_SHOW_ALL_RUNES = import.meta.env.DEV || (
  import.meta.env.VITE_HUNT_SHOW_ALL === "1" ||
  (typeof window !== 'undefined' && localStorage.getItem('hunt-show-all') === 'true')
);

// Animation configuration
export const HUNT_ANIMATION = {
  PULSE_ENABLED: false, // Disabled for static display
  PULSE_DURATION: 1.5,
  PULSE_REPEAT_DELAY: 4.5,
  PULSE_INTENSITY: 0.3, // 0-1, affects opacity range
  FOUND_STAYS_LIT: true,
  FOUND_GLOW_INTENSITY: 1.0, // Full brightness
  FOUND_ANIMATION_TYPE: 'static', // Static - no animation
} as const;

// Proximity settings
export const HUNT_PROXIMITY = {
  RADIUS: 120,
  OPACITY: {
    NEAR: 1.0,
    FAR: 0.0,
    TOUCH: 0.4,
    DEBUG: 0.8,
  },
} as const;

export const REWARD_MESSAGES = [
  "You found them all. Whisper 'nightshade' at the door for a grin-worthy surprise.",
  "Every shadow answered you back. Tell the host 'wolfsbane' for a tiny token.",
  "Secrets bend to your will. Say 'cinder & bone' for a little treat.",
];

// Debug utilities
export const HUNT_DEBUG_UTILS = {
  // Toggle show all runes mode
  toggleShowAll: () => {
    if (typeof window !== 'undefined') {
      const current = localStorage.getItem('hunt-show-all') === 'true';
      localStorage.setItem('hunt-show-all', (!current).toString());
      window.location.reload(); // Reload to apply changes
    }
  },
  
  // Toggle debug mode
  toggleDebug: () => {
    if (typeof window !== 'undefined') {
      const current = localStorage.getItem('hunt-debug') === 'true';
      localStorage.setItem('hunt-debug', (!current).toString());
      window.location.reload(); // Reload to apply changes
    }
  },
  
  // Get current debug state
  getDebugState: () => {
    if (typeof window !== 'undefined') {
      return {
        showAll: localStorage.getItem('hunt-show-all') === 'true',
        debug: localStorage.getItem('hunt-debug') === 'true',
      };
    }
    return { showAll: false, debug: false };
  },
  
  // Reset all debug settings
  resetDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hunt-show-all');
      localStorage.removeItem('hunt-debug');
      window.location.reload();
    }
  },

  // Development helper - force show all runes
  forceShowAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hunt-show-all', 'true');
      localStorage.setItem('hunt-debug', 'true');
      window.location.reload();
    }
  },

  // Production helper - hide all runes
  hideAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hunt-show-all');
      localStorage.removeItem('hunt-debug');
      window.location.reload();
    }
  }
};