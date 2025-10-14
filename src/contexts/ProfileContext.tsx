import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, getCurrentUserProfile } from '@/lib/profile-api';
import { useAuth } from '@/lib/auth';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileOptimistic: (updates: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await getCurrentUserProfile();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const refreshProfile = async () => {
    await loadProfile();
  };

  const updateProfileOptimistic = (updates: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, updateProfileOptimistic }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
