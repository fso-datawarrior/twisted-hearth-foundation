import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  enabled?: boolean;
}

/**
 * Hook to listen for keyboard shortcuts
 * @param callback Function to call when shortcut is pressed
 * @param options Shortcut configuration
 */
export function useKeyboardShortcut(
  callback: () => void,
  options: KeyboardShortcutOptions
) {
  const { key, ctrlKey, metaKey, shiftKey, altKey, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrlKey === undefined || event.ctrlKey === ctrlKey;
      const matchesMeta = metaKey === undefined || event.metaKey === metaKey;
      const matchesShift = shiftKey === undefined || event.shiftKey === shiftKey;
      const matchesAlt = altKey === undefined || event.altKey === altKey;

      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      const isModifierPressed = (ctrlKey || metaKey) && (event.ctrlKey || event.metaKey);

      if (matchesKey && isModifierPressed && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    },
    [callback, key, ctrlKey, metaKey, shiftKey, altKey, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}
