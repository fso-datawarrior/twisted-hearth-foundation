import { useQuery } from '@tanstack/react-query';
import { Images, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRange {
  start: Date;
  end: Date;
}

interface ContentMetricsWidgetProps {
  timeRange: TimeRange;
}

export function ContentMetricsWidget({ timeRange }: ContentMetricsWidgetProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['content-metrics', timeRange],
    queryFn: async () => {
      // Get photo metrics
      const { count: totalPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const { count: pendingPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const { count: approvedPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      // Get guestbook metrics
      const { count: guestbookPosts } = await supabase
        .from('guestbook')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      return {
        totalPhotos: totalPhotos || 0,
        pendingPhotos: pendingPhotos || 0,
        approvedPhotos: approvedPhotos || 0,
        guestbookPosts: guestbookPosts || 0
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="Content Metrics" icon={Images}>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </WidgetWrapper>
    );
  }

  const metricsData = [
    { 
      label: 'Photos Uploaded', 
      value: metrics?.totalPhotos || 0, 
      icon: Images,
      color: 'text-accent' 
    },
    { 
      label: 'Pending Approval', 
      value: metrics?.pendingPhotos || 0, 
      icon: Clock,
      color: 'text-amber-500' 
    },
    { 
      label: 'Approved', 
      value: metrics?.approvedPhotos || 0, 
      icon: CheckCircle,
      color: 'text-green-500' 
    },
    { 
      label: 'Guestbook Posts', 
      value: metrics?.guestbookPosts || 0, 
      icon: MessageSquare,
      color: 'text-primary' 
    }
  ];

  return (
    <WidgetWrapper title="Content Metrics" icon={Images}>
      <div className="grid grid-cols-2 gap-4">
        {metricsData.map((metric, idx) => (
          <div key={idx} className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}
