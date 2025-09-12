/**
 * Rune Image Mapping
 * Maps hint IDs to actual rune image filenames and hint configurations
 */

export interface RuneHint {
  shape: 'circle' | 'oval' | 'square';
  color: string; // CSS class for glow color
  size: 'small' | 'medium' | 'large';
  pulseIntensity: 'subtle' | 'medium' | 'bright';
}

export interface RuneInfo {
  filename: string;
  name: string;
  description?: string;
  hint: RuneHint;
}

// Map of hint IDs to rune information
export const RUNE_MAPPING: Record<string, RuneInfo> = {
  '1': {
    filename: 'compass-Rune.png',
    name: 'Compass',
    description: 'A mystical compass pointing to hidden truths',
    hint: {
      shape: 'circle',
      color: 'glow-blue-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '2': {
    filename: 'feather-Rune.png',
    name: 'Feather',
    description: 'A delicate feather from an otherworldly bird',
    hint: {
      shape: 'oval',
      color: 'glow-gold-pulse',
      size: 'small',
      pulseIntensity: 'subtle'
    }
  },
  '3': {
    filename: 'keyEye-Rune.png',
    name: 'Key Eye',
    description: 'A key with a watchful eye, seeing beyond the veil',
    hint: {
      shape: 'square',
      color: 'glow-green-pulse',
      size: 'medium',
      pulseIntensity: 'bright'
    }
  },
  '4': {
    filename: 'animalSkullVine-Rune.png',
    name: 'Animal Skull Vine',
    description: 'Ancient skull entwined with mystical vines',
    hint: {
      shape: 'oval',
      color: 'glow-red-pulse',
      size: 'large',
      pulseIntensity: 'bright'
    }
  },
  '5': {
    filename: 'blackRose-Rune.jpeg',
    name: 'Black Rose',
    description: 'A dark rose blooming in shadowed gardens',
    hint: {
      shape: 'circle',
      color: 'glow-purple-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '6': {
    filename: 'brokenMoon-Rune.jpeg',
    name: 'Broken Moon',
    description: 'A fractured moon casting eerie light',
    hint: {
      shape: 'oval',
      color: 'glow-silver-pulse',
      size: 'large',
      pulseIntensity: 'subtle'
    }
  },
  '7': {
    filename: 'crownThirdEye-Rune.jpeg',
    name: 'Crown Third Eye',
    description: 'A royal crown with a mystical third eye',
    hint: {
      shape: 'square',
      color: 'glow-gold-pulse',
      size: 'large',
      pulseIntensity: 'bright'
    }
  },
  '8': {
    filename: 'evilLaterns-Ruen.png',
    name: 'Evil Lanterns',
    description: 'Sinister lanterns glowing with malevolent light',
    hint: {
      shape: 'circle',
      color: 'glow-orange-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '9': {
    filename: 'magicPostion-Rune.png',
    name: 'Magic Potion',
    description: 'A bubbling cauldron of mysterious brew',
    hint: {
      shape: 'circle',
      color: 'glow-green-pulse',
      size: 'medium',
      pulseIntensity: 'bright'
    }
  },
  '10': {
    filename: 'meltingClock-Rune.png',
    name: 'Melting Clock',
    description: 'Time itself bends and flows like liquid',
    hint: {
      shape: 'oval',
      color: 'glow-blue-pulse',
      size: 'large',
      pulseIntensity: 'subtle'
    }
  },
  '11': {
    filename: 'mysticTree-Rune.jpeg',
    name: 'Mystic Tree',
    description: 'An ancient tree with roots in other realms',
    hint: {
      shape: 'oval',
      color: 'glow-green-pulse',
      size: 'large',
      pulseIntensity: 'medium'
    }
  },
  '12': {
    filename: 'pinkMushroom-Rune.jpeg',
    name: 'Pink Mushroom',
    description: 'A whimsical mushroom from fairy realms',
    hint: {
      shape: 'circle',
      color: 'glow-pink-pulse',
      size: 'small',
      pulseIntensity: 'subtle'
    }
  },
  '13': {
    filename: 'portalMirror-Rune.jpeg',
    name: 'Portal Mirror',
    description: 'A mirror that reflects other dimensions',
    hint: {
      shape: 'square',
      color: 'glow-purple-pulse',
      size: 'large',
      pulseIntensity: 'bright'
    }
  },
  '14': {
    filename: 'sandsOfTime-Rune.png',
    name: 'Sands of Time',
    description: 'Eternal sands flowing through an hourglass',
    hint: {
      shape: 'oval',
      color: 'glow-gold-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '15': {
    filename: 'witchHat-Rune.png',
    name: 'Witch Hat',
    description: 'A pointed hat worn by wise enchantresses',
    hint: {
      shape: 'oval',
      color: 'glow-purple-pulse',
      size: 'large',
      pulseIntensity: 'bright'
    }
  },
  '16': {
    filename: 'wolfKeyThorns-Rune.jpeg',
    name: 'Wolf Key Thorns',
    description: 'A key guarded by thorns and wolf spirits',
    hint: {
      shape: 'oval',
      color: 'glow-red-pulse',
      size: 'large',
      pulseIntensity: 'bright'
    }
  }
};

/**
 * Get the rune image path for a given hint ID
 */
export function getRunePath(id: string): string {
  const rune = RUNE_MAPPING[id];
  if (!rune) {
    console.warn(`No rune mapping found for ID: ${id}`);
    return '/img/runes/compass-Rune.png'; // Fallback to first rune
  }
  return `/img/runes/${rune.filename}`;
}

/**
 * Get rune information for a given hint ID
 */
export function getRuneInfo(id: string): RuneInfo | null {
  return RUNE_MAPPING[id] || null;
}

/**
 * Get rune hint configuration for a given hint ID
 */
export function getRuneHint(id: string): RuneHint | null {
  return RUNE_MAPPING[id]?.hint || null;
}

/**
 * Get all available rune IDs
 */
export function getAllRuneIds(): string[] {
  return Object.keys(RUNE_MAPPING);
}

/**
 * Get total number of runes
 */
export function getTotalRuneCount(): number {
  return Object.keys(RUNE_MAPPING).length;
}