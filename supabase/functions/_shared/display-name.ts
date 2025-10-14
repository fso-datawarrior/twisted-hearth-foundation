/**
 * Display name priority helper for email functions
 * Priority: display_name → first_name → email username → 'Guest'
 */

interface UserNameData {
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null; // Legacy full name field
  email: string;
}

/**
 * Get display name following priority system
 * @param data User/RSVP data with name fields
 * @returns Display name to show in emails (e.g., "John" or "john.doe")
 */
export function getDisplayName(data: UserNameData): string {
  // Priority 1: display_name
  if (data.display_name?.trim()) {
    return data.display_name.trim();
  }
  
  // Priority 2: first_name
  if (data.first_name?.trim()) {
    return data.first_name.trim();
  }
  
  // Priority 3: Legacy name field (take first word)
  if (data.name?.trim()) {
    return data.name.trim().split(' ')[0];
  }
  
  // Priority 4: Email username (before @)
  const emailUsername = data.email.split('@')[0];
  if (emailUsername) {
    return emailUsername;
  }
  
  // Fallback
  return 'Guest';
}

/**
 * Get full name for formal contexts (calendar invites, admin emails)
 * @param data User/RSVP data with name fields
 * @returns Full name or display name as fallback
 */
export function getFullName(data: UserNameData): string {
  // If we have first and last name, combine them
  if (data.first_name?.trim() && data.last_name?.trim()) {
    return `${data.first_name.trim()} ${data.last_name.trim()}`;
  }
  
  // If we have first name only
  if (data.first_name?.trim()) {
    return data.first_name.trim();
  }
  
  // Use legacy name field if available
  if (data.name?.trim()) {
    return data.name.trim();
  }
  
  // Fallback to display name
  return getDisplayName(data);
}
