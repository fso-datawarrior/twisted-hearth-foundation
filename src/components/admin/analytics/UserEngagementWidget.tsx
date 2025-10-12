import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Clock, FileText } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRange {
  start: Date;
  end: Date;
}

interface UserEngagementWidgetProps {
  timeRange: TimeRange;
}

export function UserEngagementWidget({ timeRange }: UserEngagementWidgetProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['user-engagement-metrics', timeRange],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', sevenDaysAgo.toISOString());

      // Get average session duration
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .gte('started_at', timeRange.start.toISOString())
        .lte('started_at', timeRange.end.toISOString())
        .not('duration_seconds', 'is', null);

      const avgDuration = sessions?.length 
        ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length 
        : 0;

      // Get pages per session
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const sessionsWithPages = new Map<string, number>();
      pageViews?.forEach(pv => {
        sessionsWithPages.set(pv.session_id, (sessionsWithPages.get(pv.session_id) || 0) + 1);
      });

      const pagesPerSession = sessionsWithPages.size > 0
        ? Array.from(sessionsWithPages.values()).reduce((sum, count) => sum + count, 0) / sessionsWithPages.size
        : 0;

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        avgSessionDuration: Math.round(avgDuration / 60), // Convert to minutes
        pagesPerSession: pagesPerSession.toFixed(1)
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="User Engagement" icon={Users}>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </WidgetWrapper>
    );
  }

  const metricsData = [
    { 
      label: 'Total Users', 
      value: metrics?.totalUsers || 0, 
      icon: Users,
      color: 'text-primary' 
    },
    { 
      label: 'Active (7d)', 
      value: metrics?.activeUsers || 0, 
      icon: TrendingUp,
      color: 'text-accent' 
    },
    { 
      label: 'Avg Session', 
      value: `${metrics?.avgSessionDuration || 0}m`, 
      icon: Clock,
      color: 'text-secondary' 
    },
    { 
      label: 'Pages/Session', 
      value: metrics?.pagesPerSession || '0.0', 
      icon: FileText,
      color: 'text-accent-gold' 
    }
  ];

  return (
    <WidgetWrapper title="User Engagement" icon={Users}>
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
