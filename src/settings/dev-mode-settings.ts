/**
 * Developer Mode Settings
 * 
 * This file controls the developer mode system and version display.
 * Simply change the DEV_MODE_ENABLED value to turn developer mode on or off.
 * 
 * Usage:
 * - Set DEV_MODE_ENABLED = true to enable developer mode (shows version numbers)
 * - Set DEV_MODE_ENABLED = false to disable developer mode (hides version numbers)
 * - Restart the application after making changes
 */

export const DEV_MODE_SETTINGS = {
  // Main developer mode control
  DEV_MODE_ENABLED: false, // Change this to true/false to enable/disable dev mode
  
  // Optional: Override environment variable
  // If you want to force a specific state regardless of environment variables
  FORCE_OVERRIDE: false, // Set to true to use the DEV_MODE_ENABLED value above
  
  // Optional: Development mode overrides
  // These only work in development mode (localhost)
  DEV_OVERRIDE: false, // Set to true to allow localStorage overrides in dev mode
} as const;

// Export the main setting for easy access
export const DEV_MODE_ENABLED = DEV_MODE_SETTINGS.FORCE_OVERRIDE 
  ? DEV_MODE_SETTINGS.DEV_MODE_ENABLED 
  : (DEV_MODE_SETTINGS.DEV_OVERRIDE && 
     typeof window !== 'undefined' && 
     localStorage.getItem('developerMode') === 'true') || 
   DEV_MODE_SETTINGS.DEV_MODE_ENABLED;
