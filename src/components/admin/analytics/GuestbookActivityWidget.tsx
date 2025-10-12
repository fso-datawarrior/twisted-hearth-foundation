import { useQuery } from '@tanstack/react-query';
import { MessageSquare, User, Smile } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRange {
  start: Date;
  end: Date;
}

interface GuestbookActivityWidgetProps {
  timeRange: TimeRange;
}

export function GuestbookActivityWidget({ timeRange }: GuestbookActivityWidgetProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['guestbook-activity', timeRange],
    queryFn: async () => {
      // Get total posts
      const { count: totalPosts } = await supabase
        .from('guestbook')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      // Get top contributors
      const { data: posts } = await supabase
        .from('guestbook')
        .select('user_id, display_name')
        .is('deleted_at', null)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const contributorCounts = new Map<string, { name: string; count: number }>();
      posts?.forEach(post => {
        const key = post.user_id || 'anonymous';
        const existing = contributorCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          contributorCounts.set(key, { 
            name: post.display_name || 'Anonymous', 
            count: 1 
          });
        }
      });

      const topContributors = Array.from(contributorCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get emoji reactions
      const { count: totalReactions } = await supabase
        .from('guestbook_reactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      return {
        totalPosts: totalPosts || 0,
        topContributors,
        totalReactions: totalReactions || 0
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="Guestbook Activity" icon={MessageSquare}>
        <Skeleton className="h-48 w-full" />
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper title="Guestbook Activity" icon={MessageSquare}>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Posts</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {metrics?.totalPosts || 0}
            </div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-secondary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Reactions</span>
            </div>
            <div className="text-2xl font-bold text-secondary">
              {metrics?.totalReactions || 0}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold">Top Contributors</h4>
          </div>
          <div className="space-y-2">
            {metrics?.topContributors && metrics.topContributors.length > 0 ? (
              metrics.topContributors.map((contributor, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      #{idx + 1}
                    </span>
                    <User className="h-3 w-3 text-accent" />
                    <span className="text-sm truncate max-w-[150px]">
                      {contributor.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {contributor.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity in this time range
              </p>
            )}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
