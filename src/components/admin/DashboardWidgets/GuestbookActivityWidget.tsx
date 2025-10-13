import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { MessageSquare, Users, Smile } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuestbookStats {
  totalPosts: number;
  recentPosts: Array<{
    id: string;
    display_name: string;
    message: string;
    created_at: string;
  }>;
  topContributors: Array<{
    display_name: string;
    post_count: number;
  }>;
  emojiStats: Array<{
    emoji: string;
    count: number;
  }>;
}

export default function GuestbookActivityWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['guestbook-activity'],
    queryFn: async () => {
      // Total posts
      const { count: totalPosts } = await supabase
        .from('guestbook')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Recent posts (last 10)
      const { data: recentPosts } = await supabase
        .from('guestbook')
        .select('id, display_name, message, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      // Top contributors
      const { data: allPosts } = await supabase
        .from('guestbook')
        .select('display_name')
        .is('deleted_at', null);

      const contributorMap: Record<string, number> = {};
      allPosts?.forEach(post => {
        if (post.display_name) {
          contributorMap[post.display_name] = (contributorMap[post.display_name] || 0) + 1;
        }
      });

      const topContributors = Object.entries(contributorMap)
        .map(([display_name, post_count]) => ({ display_name, post_count }))
        .sort((a, b) => b.post_count - a.post_count)
        .slice(0, 5);

      // Emoji statistics
      const { data: reactions } = await supabase
        .from('guestbook_reactions')
        .select('emoji');

      const emojiMap: Record<string, number> = {};
      reactions?.forEach(r => {
        emojiMap[r.emoji] = (emojiMap[r.emoji] || 0) + 1;
      });

      const emojiStats = Object.entries(emojiMap)
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalPosts: totalPosts || 0,
        recentPosts: recentPosts || [],
        topContributors,
        emojiStats,
      } as GuestbookStats;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const stats = data || {
    totalPosts: 0,
    recentPosts: [],
    topContributors: [],
    emojiStats: [],
  };

  return (
    <WidgetWrapper
      title="Guestbook Activity"
      icon={<MessageSquare className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load guestbook activity</div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-primary">{stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">Total Posts</div>
            </div>
            <Card className="bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border-accent-gold/20 p-2 text-center">
              <CardHeader className="pb-1 p-0">
                <CardTitle className="text-xs font-medium flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-accent-gold flex-shrink-0" />
                  <span className="truncate">Contributors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-1">
                <div className="text-xl font-bold text-accent-gold">{stats.topContributors.length}</div>
              </CardContent>
            </Card>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-accent">{stats.emojiStats.reduce((sum, e) => sum + e.count, 0)}</div>
              <div className="text-xs text-muted-foreground">Reactions</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Posts</span>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-2 pr-4">
                {stats.recentPosts.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">No posts yet</div>
                ) : (
                  stats.recentPosts.map(post => (
                    <div key={post.id} className="text-xs p-2 bg-card/50 rounded border border-border/50">
                      <div className="font-medium text-primary mb-1">{post.display_name}</div>
                      <div className="text-muted-foreground line-clamp-2">{post.message}</div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Top Contributors & Emojis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Top Contributors</span>
              </div>
              <div className="space-y-1">
                {stats.topContributors.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{c.display_name}</span>
                    <Badge variant="secondary" className="text-xs">{c.post_count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Smile className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Popular Reactions</span>
              </div>
              <div className="space-y-1">
                {stats.emojiStats.slice(0, 3).map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-base">{e.emoji}</span>
                    <Badge variant="secondary" className="text-xs">{e.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}
