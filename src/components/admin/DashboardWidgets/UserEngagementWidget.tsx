import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Users, Activity, Clock, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EngagementMetrics {
  totalUsers: number;
  activeUsers7d: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  newUsers7d: number;
  returningUsers: number;
}

export default function UserEngagementWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['user-engagement-metrics'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users (last 7 days)
      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('started_at', sevenDaysAgo.toISOString());
      
      const activeUsers7d = new Set(activeSessions?.map(s => s.user_id).filter(Boolean)).size;

      // Average session duration
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .gte('started_at', sevenDaysAgo.toISOString())
        .not('duration_seconds', 'is', null);
      
      const avgSessionDuration = sessions?.length 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length / 60)
        : 0;

      // Average pages per session
      const { data: sessionsWithPages } = await supabase
        .from('user_sessions')
        .select('pages_viewed')
        .gte('started_at', sevenDaysAgo.toISOString())
        .gt('pages_viewed', 0);
      
      const avgPagesPerSession = sessionsWithPages?.length
        ? Math.round((sessionsWithPages.reduce((sum, s) => sum + (s.pages_viewed || 0), 0) / sessionsWithPages.length) * 10) / 10
        : 0;

      // New users (last 7 days)
      const { count: newUsers7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Returning users (users with multiple sessions)
      const { data: allSessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const userSessionCounts = allSessions?.reduce((acc, s) => {
        if (s.user_id) {
          acc[s.user_id] = (acc[s.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const returningUsers = Object.values(userSessionCounts || {}).filter(count => count > 1).length;

      return {
        totalUsers: totalUsers || 0,
        activeUsers7d,
        avgSessionDuration,
        avgPagesPerSession,
        newUsers7d: newUsers7d || 0,
        returningUsers,
      } as EngagementMetrics;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = data || {
    totalUsers: 0,
    activeUsers7d: 0,
    avgSessionDuration: 0,
    avgPagesPerSession: 0,
    newUsers7d: 0,
    returningUsers: 0,
  };

  return (
    <WidgetWrapper
      title="User Engagement"
      icon={<Users className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load engagement metrics</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Users className="h-4 w-4 text-primary" />}
            label="Total Users"
            value={metrics.totalUsers}
            color="primary"
          />
          <MetricCard
            icon={<Activity className="h-4 w-4 text-secondary" />}
            label="Active (7d)"
            value={metrics.activeUsers7d}
            color="secondary"
          />
          <MetricCard
            icon={<Clock className="h-4 w-4 text-accent" />}
            label="Avg Session"
            value={`${metrics.avgSessionDuration}m`}
            color="accent"
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4 text-accent-gold" />}
            label="Pages/Session"
            value={metrics.avgPagesPerSession}
            color="accent-gold"
          />
          <MetricCard
            icon={<UserPlus className="h-4 w-4 text-primary" />}
            label="New (7d)"
            value={metrics.newUsers7d}
            color="primary"
          />
          <MetricCard
            icon={<UserCheck className="h-4 w-4 text-secondary" />}
            label="Returning"
            value={metrics.returningUsers}
            color="secondary"
          />
        </div>
      )}
    </WidgetWrapper>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'primary' | 'secondary' | 'accent' | 'accent-gold';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20',
    secondary: 'from-secondary/10 to-secondary/5 border-secondary/20',
    accent: 'from-accent/10 to-accent/5 border-accent/20',
    'accent-gold': 'from-accent-gold/10 to-accent-gold/5 border-accent-gold/20',
  };

  const textColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    'accent-gold': 'text-accent-gold',
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-2`}>
      <CardHeader className="pb-1 p-3">
        <CardTitle className="text-xs font-medium flex items-center gap-2">
          {icon}
          <span className="text-muted-foreground">{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
