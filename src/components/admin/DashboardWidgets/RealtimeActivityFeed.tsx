import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Activity, Image, MessageSquare, Calendar, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ActivityLog {
  id: string;
  action_type: string;
  action_category: string;
  created_at: string;
  user_id: string | null;
  display_name?: string;
}

export default function RealtimeActivityFeed() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['realtime-activity'],
    queryFn: async () => {
      // Get last 20 activities
      const { data: activities } = await supabase
        .from('user_activity_logs')
        .select(`
          id,
          action_type,
          action_category,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!activities) return [];

      // Get user profiles for activities with user_id
      const userIds = [...new Set(activities.map(a => a.user_id).filter(Boolean))] as string[];
      
      const { data: profiles } = userIds.length > 0
        ? await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds)
        : { data: [] };

      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name] as [string, string | null]) || []);

      return activities.map(activity => ({
        ...activity,
        display_name: activity.user_id ? profileMap.get(activity.user_id) || 'Unknown User' : 'Anonymous',
      })) as ActivityLog[];
    },
    refetchInterval: 30 * 1000, // 30 seconds for real-time feel
  });

  const activities = data || [];

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes('photo')) return <Image className="h-4 w-4" />;
    if (actionType.includes('guestbook')) return <MessageSquare className="h-4 w-4" />;
    if (actionType.includes('rsvp')) return <Calendar className="h-4 w-4" />;
    if (actionType.includes('view')) return <Eye className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActivityColor = (category: string) => {
    if (category === 'content') return 'primary';
    if (category === 'engagement') return 'secondary';
    if (category === 'navigation') return 'accent';
    return 'muted';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <WidgetWrapper
      title="Live Activity Feed"
      icon={<Activity className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
      badge={
        <Badge variant="outline" className="text-xs animate-pulse">
          Live
        </Badge>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load activity feed</div>
      ) : activities.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No recent activity
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
              >
                <div className={`p-2 rounded-full bg-${getActivityColor(activity.action_category)}/10 text-${getActivityColor(activity.action_category)} flex-shrink-0`}>
                  {getActivityIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatActionType(activity.action_type)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {formatTimeAgo(activity.created_at)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </WidgetWrapper>
  );
}
