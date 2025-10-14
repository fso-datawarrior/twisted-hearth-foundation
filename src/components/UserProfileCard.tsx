import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Image } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDisplayName, getFullName } from '@/lib/display-name-utils';
import type { Profile } from '@/lib/profile-api';

interface UserProfileCardProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalPosts: number;
  totalPhotos: number;
}

export function UserProfileCard({ userId, isOpen, onClose }: UserProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rsvpData, setRsvpData] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({ totalPosts: 0, totalPhotos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData();
    }
  }, [isOpen, userId]);

  const loadProfileData = async () => {
    setLoading(true);
    
    try {
      // Fetch profile and RSVP data
      const [profileResult, rsvpResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        supabase
          .from('rsvps')
          .select('first_name, last_name, display_name, name')
          .eq('user_id', userId)
          .maybeSingle()
      ]);
      
      // Fetch statistics
      const [postsResult, photosResult] = await Promise.all([
        supabase
          .from('guestbook')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .is('deleted_at', null),
        supabase
          .from('photos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
      ]);
      
      setProfile(profileResult.data);
      setRsvpData(rsvpResult.data);
      setStats({
        totalPosts: postsResult.count || 0,
        totalPhotos: photosResult.count || 0
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile && !loading) return null;

  const displayNameToShow = getDisplayName(profile, rsvpData);
  const fullName = getFullName(profile, rsvpData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/95 backdrop-blur-md border-accent-purple/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-accent-gold">
            User Profile
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-accent-purple/30">
                <AvatarImage src={profile.avatar_url || undefined} alt={displayNameToShow} />
                <AvatarFallback className="bg-accent-purple/20 text-accent-gold text-3xl">
                  {displayNameToShow.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-subhead text-xl text-accent-gold">
                  {displayNameToShow}
                </h3>
                {fullName !== displayNameToShow && (
                  <p className="text-sm text-accent-gold/70 font-body mb-1">
                    {fullName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground font-body">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent-purple/10 p-4 rounded-lg border border-accent-purple/20 text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-accent-gold" />
                <div className="text-2xl font-heading text-accent-gold">{stats.totalPosts}</div>
                <div className="text-xs text-muted-foreground font-body">
                  {stats.totalPosts === 1 ? 'Post' : 'Posts'}
                </div>
              </div>
              
              <div className="bg-accent-purple/10 p-4 rounded-lg border border-accent-purple/20 text-center">
                <Image className="h-6 w-6 mx-auto mb-2 text-accent-gold" />
                <div className="text-2xl font-heading text-accent-gold">{stats.totalPhotos}</div>
                <div className="text-xs text-muted-foreground font-body">
                  {stats.totalPhotos === 1 ? 'Photo' : 'Photos'}
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-accent-purple/5 p-3 rounded-lg border border-accent-purple/10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Calendar className="h-4 w-4 text-accent-gold" />
                <span>
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
