import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Image, Clock, Eye, Heart, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ContentMetrics {
  totalPhotos: number;
  pendingApproval: number;
  photoViews7d: number;
  totalLikes: number;
  guestbookPosts: number;
}

export default function ContentMetricsWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['content-metrics'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Total photos
      const { count: totalPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true });

      // Pending approval
      const { count: pendingApproval } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Photo views (last 7 days)
      const { count: photoViews7d } = await supabase
        .from('content_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'photo')
        .eq('interaction_type', 'view')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Total likes
      const { count: totalLikes } = await supabase
        .from('photo_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('reaction_type', 'like');

      // Guestbook posts
      const { count: guestbookPosts } = await supabase
        .from('guestbook')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      return {
        totalPhotos: totalPhotos || 0,
        pendingApproval: pendingApproval || 0,
        photoViews7d: photoViews7d || 0,
        totalLikes: totalLikes || 0,
        guestbookPosts: guestbookPosts || 0,
      } as ContentMetrics;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = data || {
    totalPhotos: 0,
    pendingApproval: 0,
    photoViews7d: 0,
    totalLikes: 0,
    guestbookPosts: 0,
  };

  return (
    <WidgetWrapper
      title="Content Metrics"
      icon={<Image className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load content metrics</div>
      ) : (
        <div className="space-y-2">
          <MetricRow
            icon={<Image className="h-4 w-4 text-primary" />}
            label="Total Photos"
            value={metrics.totalPhotos}
          />
          <MetricRow
            icon={<Clock className="h-4 w-4 text-accent-gold" />}
            label="Pending Approval"
            value={metrics.pendingApproval}
            badge={metrics.pendingApproval > 0 ? "action-needed" : undefined}
          />
          <MetricRow
            icon={<Eye className="h-4 w-4 text-secondary" />}
            label="Photo Views (7d)"
            value={metrics.photoViews7d}
          />
          <MetricRow
            icon={<Heart className="h-4 w-4 text-destructive" />}
            label="Total Likes"
            value={metrics.totalLikes}
          />
          <MetricRow
            icon={<MessageSquare className="h-4 w-4 text-accent" />}
            label="Guestbook Posts"
            value={metrics.guestbookPosts}
          />
        </div>
      )}
    </WidgetWrapper>
  );
}

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  badge?: "action-needed";
}

function MetricRow({ icon, label, value, badge }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{value}</span>
        {badge === "action-needed" && (
          <Badge variant="destructive" className="text-xs">Action Needed</Badge>
        )}
      </div>
    </div>
  );
}
