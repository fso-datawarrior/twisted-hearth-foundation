import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Image, MessageSquare, UserPlus, Calendar } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'photo' | 'guestbook' | 'rsvp' | 'user';
  description: string;
  timestamp: string;
  icon: typeof Activity;
  color: string;
}

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const recentActivities: ActivityItem[] = [];

      // Get recent photos (last 10)
      const { data: photos } = await supabase
        .from('photos')
        .select('id, filename, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      photos?.forEach(photo => {
        recentActivities.push({
          id: photo.id,
          type: 'photo',
          description: `New photo uploaded: ${photo.filename}`,
          timestamp: photo.created_at,
          icon: Image,
          color: 'text-accent'
        });
      });

      // Get recent guestbook posts (last 10)
      const { data: posts } = await supabase
        .from('guestbook')
        .select('id, display_name, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      posts?.forEach(post => {
        recentActivities.push({
          id: post.id,
          type: 'guestbook',
          description: `${post.display_name} posted in guestbook`,
          timestamp: post.created_at,
          icon: MessageSquare,
          color: 'text-primary'
        });
      });

      // Get recent RSVPs (last 5)
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      rsvps?.forEach(rsvp => {
        recentActivities.push({
          id: rsvp.id,
          type: 'rsvp',
          description: `${rsvp.name} submitted RSVP`,
          timestamp: rsvp.created_at,
          icon: Calendar,
          color: 'text-secondary'
        });
      });

      // Get recent user registrations (last 5)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      users?.forEach(user => {
        recentActivities.push({
          id: user.id,
          type: 'user',
          description: `${user.display_name || 'New user'} joined`,
          timestamp: user.created_at,
          icon: UserPlus,
          color: 'text-accent-gold'
        });
      });

      // Sort by timestamp, most recent first
      return recentActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <WidgetWrapper title="Recent Activity" icon={Activity}>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper 
      title="Recent Activity" 
      icon={Activity}
      description="Live feed • Updates every 30s"
    >
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <activity.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        )}
      </div>
    </WidgetWrapper>
  );
}
