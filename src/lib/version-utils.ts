/**
 * Semantic Versioning Utilities for Release Management
 * Follows SemVer 2.0.0 specification
 */

export interface VersionParts {
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
}

/**
 * Parse a semantic version string into its components
 * @param version - Version string (e.g., "1.2.3" or "1.2.3-beta.1")
 * @returns Parsed version parts
 */
export function parseVersion(version: string): VersionParts {
  const regex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  const match = version.match(regex);
  
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    preRelease: match[4],
  };
}

/**
 * Format version parts into a version string
 */
export function formatVersion(parts: VersionParts): string {
  let version = `${parts.major}.${parts.minor}.${parts.patch}`;
  if (parts.preRelease) {
    version += `-${parts.preRelease}`;
  }
  return version;
}

/**
 * Suggest the next version based on change type
 * @param currentVersion - Current version string
 * @param changeType - Type of change (major, minor, patch)
 * @returns Suggested next version
 */
export function suggestNextVersion(
  currentVersion: string,
  changeType: 'major' | 'minor' | 'patch'
): string {
  const parts = parseVersion(currentVersion);
  
  // Remove pre-release for suggestions
  parts.preRelease = undefined;
  
  switch (changeType) {
    case 'major':
      parts.major += 1;
      parts.minor = 0;
      parts.patch = 0;
      break;
    case 'minor':
      parts.minor += 1;
      parts.patch = 0;
      break;
    case 'patch':
      parts.patch += 1;
      break;
  }
  
  return formatVersion(parts);
}

/**
 * Compare two versions
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = parseVersion(v1);
  const parts2 = parseVersion(v2);
  
  // Compare major.minor.patch
  if (parts1.major !== parts2.major) {
    return parts1.major - parts2.major;
  }
  if (parts1.minor !== parts2.minor) {
    return parts1.minor - parts2.minor;
  }
  if (parts1.patch !== parts2.patch) {
    return parts1.patch - parts2.patch;
  }
  
  // Handle pre-release precedence
  if (!parts1.preRelease && !parts2.preRelease) {
    return 0;
  }
  if (!parts1.preRelease) {
    return 1;  // v1 is release, v2 is pre-release
  }
  if (!parts2.preRelease) {
    return -1; // v2 is release, v1 is pre-release
  }
  
  // Compare pre-release identifiers
  return parts1.preRelease.localeCompare(parts2.preRelease);
}

/**
 * Sort versions in descending order (newest first)
 */
export function sortVersions(versions: string[]): string[] {
  return versions.slice().sort((a, b) => compareVersions(b, a));
}

/**
 * Check if a version string is valid
 */
export function isValidVersion(version: string): boolean {
  try {
    parseVersion(version);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version increment options for UI
 */
export function getVersionIncrementOptions(currentVersion: string) {
  return [
    {
      type: 'major' as const,
      label: 'Major Release',
      description: 'Breaking changes, major features',
      suggested: suggestNextVersion(currentVersion, 'major'),
    },
    {
      type: 'minor' as const,
      label: 'Minor Release',
      description: 'New features, backwards compatible',
      suggested: suggestNextVersion(currentVersion, 'minor'),
    },
    {
      type: 'patch' as const,
      label: 'Patch Release',
      description: 'Bug fixes, small improvements',
      suggested: suggestNextVersion(currentVersion, 'patch'),
    },
  ];
}
