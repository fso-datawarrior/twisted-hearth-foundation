import { Profile } from './profile-api';

export interface ProfileCompletionStatus {
  percentage: number;
  completedItems: string[];
  missingItems: string[];
  isComplete: boolean;
}

/**
 * Calculate profile completion percentage based on filled fields
 */
export function calculateProfileCompletion(profile: Profile | null): ProfileCompletionStatus {
  if (!profile) {
    return {
      percentage: 0,
      completedItems: [],
      missingItems: ['Email', 'Display Name', 'Avatar'],
      isComplete: false,
    };
  }

  const items = [
    { key: 'email', label: 'Email', value: profile.email },
    { key: 'display_name', label: 'Display Name', value: profile.display_name },
    { key: 'avatar_url', label: 'Avatar', value: profile.avatar_url },
  ];

  const completedItems: string[] = [];
  const missingItems: string[] = [];

  items.forEach((item) => {
    if (item.value && item.value.trim() !== '') {
      completedItems.push(item.label);
    } else {
      missingItems.push(item.label);
    }
  });

  const percentage = Math.round((completedItems.length / items.length) * 100);
  const isComplete = percentage === 100;

  return {
    percentage,
    completedItems,
    missingItems,
    isComplete,
  };
}

/**
 * Check if profile completion banner should be shown
 */
export function shouldShowCompletionBanner(profile: Profile | null): boolean {
  if (!profile) return false;
  
  const { isComplete } = calculateProfileCompletion(profile);
  if (isComplete) return false;

  // Check if user dismissed banner (expires after 7 days)
  const dismissedKey = 'profile-completion-dismissed';
  const dismissedAt = localStorage.getItem(dismissedKey);
  
  if (dismissedAt) {
    const dismissTime = new Date(dismissedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (dismissTime > sevenDaysAgo) {
      return false; // Still within 7-day dismiss period
    } else {
      // Dismiss period expired, remove from storage
      localStorage.removeItem(dismissedKey);
    }
  }

  return true;
}

/**
 * Dismiss profile completion banner for 7 days
 */
export function dismissCompletionBanner(): void {
  localStorage.setItem('profile-completion-dismissed', new Date().toISOString());
}

/**
 * Check if this is a new user (created within last 5 minutes)
 */
export function isNewUser(profile: Profile | null): boolean {
  if (!profile?.created_at) return false;
  
  const createdAt = new Date(profile.created_at);
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  return createdAt > fiveMinutesAgo;
}
