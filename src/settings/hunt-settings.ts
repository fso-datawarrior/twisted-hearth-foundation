/**
 * Hunt System Settings
 * 
 * This file controls the scavenger hunt system.
 * Simply change the HUNT_ENABLED value to turn the hunt on or off.
 * 
 * Usage:
 * - Set HUNT_ENABLED = true to enable the hunt system
 * - Set HUNT_ENABLED = false to disable the hunt system
 * - Restart the application after making changes
 */

export const HUNT_SETTINGS = {
  // Main hunt system control
  HUNT_ENABLED: false, // Change this to true/false to enable/disable hunt
  
  // Optional: Override environment variable
  // If you want to force a specific state regardless of environment variables
  FORCE_OVERRIDE: false, // Set to true to use the HUNT_ENABLED value above
  
  // Optional: Development mode overrides
  // These only work in development mode (localhost)
  DEV_OVERRIDE: false, // Set to true to allow localStorage overrides in dev mode
} as const;

// Export the main setting for easy access
export const HUNT_ENABLED = HUNT_SETTINGS.FORCE_OVERRIDE 
  ? HUNT_SETTINGS.HUNT_ENABLED 
  : (import.meta.env.VITE_HUNT_ENABLED === "true" || 
     (HUNT_SETTINGS.DEV_OVERRIDE && 
      typeof window !== 'undefined' && 
      localStorage.getItem('hunt-enabled') === 'true') || 
     HUNT_SETTINGS.HUNT_ENABLED);
