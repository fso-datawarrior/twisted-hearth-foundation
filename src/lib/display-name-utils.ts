import type { Profile } from '@/lib/profile-api';

export interface RsvpData {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}

/**
 * Priority System for Display Names:
 * 1. profile.display_name (user's chosen display name)
 * 2. profile.first_name (from settings or RSVP)
 * 3. rsvp.first_name (if no profile first_name)
 * 4. rsvp.name (legacy field - take first word)
 * 5. email username (before @)
 * 6. 'Guest' (fallback)
 */
export function getDisplayName(
  profile: Profile | null | undefined,
  rsvp?: RsvpData | null,
  email?: string | null
): string {
  // Priority 1: Explicit display name from profile (but not if it's the email)
  if (profile?.display_name?.trim() && profile.display_name !== profile.email) {
    return profile.display_name.trim();
  }
  
  // Priority 2: First name from profile
  if (profile?.first_name?.trim()) {
    return profile.first_name.trim();
  }
  
  // Priority 3: First name from RSVP
  if (rsvp?.first_name?.trim()) {
    return rsvp.first_name.trim();
  }
  
  // Priority 4: Legacy RSVP name field (take first word)
  if (rsvp?.name?.trim()) {
    return rsvp.name.trim().split(' ')[0];
  }
  
  // Priority 5: Email username
  const emailToUse = email || profile?.email;
  if (emailToUse) {
    const username = emailToUse.split('@')[0];
    if (username) {
      return username;
    }
  }
  
  // Fallback
  return 'Guest';
}

/**
 * Get full name for formal contexts (emails, calendar invites, profile cards)
 */
export function getFullName(
  profile: Profile | null | undefined,
  rsvp?: RsvpData | null
): string {
  // Try profile first/last name
  if (profile?.first_name?.trim() && profile?.last_name?.trim()) {
    return `${profile.first_name.trim()} ${profile.last_name.trim()}`;
  }
  
  // Try profile first name only
  if (profile?.first_name?.trim()) {
    return profile.first_name.trim();
  }
  
  // Try RSVP first/last name
  if (rsvp?.first_name?.trim() && rsvp?.last_name?.trim()) {
    return `${rsvp.first_name.trim()} ${rsvp.last_name.trim()}`;
  }
  
  // Try RSVP first name only
  if (rsvp?.first_name?.trim()) {
    return rsvp.first_name.trim();
  }
  
  // Try legacy RSVP name field
  if (rsvp?.name?.trim()) {
    return rsvp.name.trim();
  }
  
  // Fallback to display name
  return getDisplayName(profile, rsvp);
}
