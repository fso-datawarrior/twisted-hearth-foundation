/**
 * Rune Image Mapping
 * Maps hint IDs to actual rune image filenames
 */

export interface RuneInfo {
  filename: string;
  name: string;
  description?: string;
}

// Map of hint IDs to rune information
export const RUNE_MAPPING: Record<string, RuneInfo> = {
  '1': {
    filename: 'compass-Rune.png',
    name: 'Compass',
    description: 'A mystical compass pointing to hidden truths'
  },
  '2': {
    filename: 'feather-Rune.png',
    name: 'Feather',
    description: 'A delicate feather from an otherworldly bird'
  },
  '3': {
    filename: 'keyEye-Rune.png',
    name: 'Key Eye',
    description: 'A key with a watchful eye, seeing beyond the veil'
  },
  '4': {
    filename: 'animalSkullVine-Rune.jpeg',
    name: 'Animal Skull Vine',
    description: 'Ancient skull entwined with mystical vines'
  },
  '5': {
    filename: 'blackRose-Rune.jpeg',
    name: 'Black Rose',
    description: 'A dark rose blooming in shadowed gardens'
  },
  '6': {
    filename: 'brokenMoon-Rune.jpeg',
    name: 'Broken Moon',
    description: 'A fractured moon casting eerie light'
  },
  '7': {
    filename: 'crownThirdEye-Rune.jpeg',
    name: 'Crown Third Eye',
    description: 'A royal crown with a mystical third eye'
  },
  '8': {
    filename: 'evilLaterns-Ruen.png',
    name: 'Evil Lanterns',
    description: 'Sinister lanterns glowing with malevolent light'
  },
  '9': {
    filename: 'magicPostion-Rune.png',
    name: 'Magic Potion',
    description: 'A bubbling cauldron of mysterious brew'
  },
  '10': {
    filename: 'meltingClock-Rune.png',
    name: 'Melting Clock',
    description: 'Time itself bends and flows like liquid'
  },
  '11': {
    filename: 'mysticTree-Rune.jpeg',
    name: 'Mystic Tree',
    description: 'An ancient tree with roots in other realms'
  },
  '12': {
    filename: 'pinkMushroom-Rune.jpeg',
    name: 'Pink Mushroom',
    description: 'A whimsical mushroom from fairy realms'
  },
  '13': {
    filename: 'portalMirror-Rune.jpeg',
    name: 'Portal Mirror',
    description: 'A mirror that reflects other dimensions'
  },
  '14': {
    filename: 'sandsOfTime-Rune.png',
    name: 'Sands of Time',
    description: 'Eternal sands flowing through an hourglass'
  },
  '15': {
    filename: 'witchHat-Rune.jpeg',
    name: 'Witch Hat',
    description: 'A pointed hat worn by wise enchantresses'
  },
  '16': {
    filename: 'wolfKeyThorns-Rune.jpeg',
    name: 'Wolf Key Thorns',
    description: 'A key guarded by thorns and wolf spirits'
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
