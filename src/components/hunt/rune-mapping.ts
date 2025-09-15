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
      size: 'small',
      pulseIntensity: 'bright'
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
      size: 'small',
      pulseIntensity: 'medium'
    }
  },
  '4': {
    filename: 'moonCrescent-Rune.png',
    name: 'Moon Crescent',
    description: 'A silver crescent moon, guardian of the night',
    hint: {
      shape: 'oval',
      color: 'glow-silver-pulse',
      size: 'medium',
      pulseIntensity: 'subtle'
    }
  },
  '5': {
    filename: 'owlWise-Rune.png',
    name: 'Owl Wise',
    description: 'An ancient owl, keeper of wisdom and secrets',
    hint: {
      shape: 'circle',
      color: 'glow-amber-pulse',
      size: 'large',
      pulseIntensity: 'medium'
    }
  },
  '6': {
    filename: 'phoenixFlame-Rune.png',
    name: 'Phoenix Flame',
    description: 'The eternal flame of rebirth and renewal',
    hint: {
      shape: 'circle',
      color: 'glow-red-pulse',
      size: 'medium',
      pulseIntensity: 'bright'
    }
  },
  '7': {
    filename: 'ravenDark-Rune.png',
    name: 'Raven Dark',
    description: 'A mysterious raven, messenger between worlds',
    hint: {
      shape: 'circle',
      color: 'glow-purple-pulse',
      size: 'small',
      pulseIntensity: 'medium'
    }
  },
  '8': {
    filename: 'roseThorn-Rune.png',
    name: 'Rose Thorn',
    description: 'A beautiful rose with sharp thorns, beauty and danger',
    hint: {
      shape: 'circle',
      color: 'glow-pink-pulse',
      size: 'small',
      pulseIntensity: 'subtle'
    }
  },
  '9': {
    filename: 'skullBone-Rune.png',
    name: 'Skull Bone',
    description: 'A weathered skull, reminder of mortality and mystery',
    hint: {
      shape: 'circle',
      color: 'glow-silver-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '10': {
    filename: 'spiderWeb-Rune.png',
    name: 'Spider Web',
    description: 'A delicate web spun by fate itself',
    hint: {
      shape: 'circle',
      color: 'glow-cyan-pulse',
      size: 'small',
      pulseIntensity: 'subtle'
    }
  },
  '11': {
    filename: 'starTwinkle-Rune.png',
    name: 'Star Twinkle',
    description: 'A twinkling star, hope in the darkness',
    hint: {
      shape: 'circle',
      color: 'glow-yellow-pulse',
      size: 'small',
      pulseIntensity: 'bright'
    }
  },
  '12': {
    filename: 'swordAncient-Rune.png',
    name: 'Sword Ancient',
    description: 'An ancient blade, forged in forgotten times',
    hint: {
      shape: 'oval',
      color: 'glow-bronze-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '13': {
    filename: 'treeAncient-Rune.png',
    name: 'Tree Ancient',
    description: 'An ancient tree, rooted in time and memory',
    hint: {
      shape: 'circle',
      color: 'glow-emerald-pulse',
      size: 'large',
      pulseIntensity: 'subtle'
    }
  },
  '14': {
    filename: 'wolfHowl-Rune.png',
    name: 'Wolf Howl',
    description: 'A lone wolf howling at the moon',
    hint: {
      shape: 'oval',
      color: 'glow-silver-pulse',
      size: 'medium',
      pulseIntensity: 'medium'
    }
  },
  '15': {
    filename: 'witchHat-Rune.png',
    name: 'Witch Hat',
    description: 'A pointed hat worn by wise enchantresses',
    hint: {
      shape: 'circle',
      color: 'glow-purple-pulse',
      size: 'small',
      pulseIntensity: 'bright'
    }
  },
  '16': {
    filename: 'wolfKeyThorns-Rune.jpeg',
    name: 'Wolf Key Thorns',
    description: 'A key guarded by thorns and wolf spirits',
    hint: {
      shape: 'circle',
      color: 'glow-copper-pulse',
      size: 'small',
      pulseIntensity: 'medium'
    }
  }
};

// Helper function to get total rune count
export const getTotalRuneCount = (): number => {
  return Object.keys(RUNE_MAPPING).length;
};

// Helper function to get rune path
export const getRunePath = (id: string): string => {
  const runeInfo = RUNE_MAPPING[id];
  return runeInfo ? `/img/runes/${runeInfo.filename}` : `/img/runes/rune-${id}.png`;
};

// Helper function to get rune info
export const getRuneInfo = (id: string): RuneInfo | undefined => {
  return RUNE_MAPPING[id];
};

// Helper function to get rune hint
export const getRuneHint = (id: string): RuneHint | undefined => {
  const runeInfo = RUNE_MAPPING[id];
  return runeInfo?.hint;
};

// Helper function to get all rune IDs
export const getAllRuneIds = (): string[] => {
  return Object.keys(RUNE_MAPPING);
};