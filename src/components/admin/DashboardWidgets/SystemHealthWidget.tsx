import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Activity, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SystemHealth {
  avgPageLoadTime: number;
  errorCount: number;
  activeSessions: number;
  queryPerformance: 'good' | 'warning' | 'critical';
  status: 'healthy' | 'warning' | 'critical';
}

export default function SystemHealthWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Average page load time (from system_metrics)
      const { data: metrics } = await supabase
        .from('system_metrics')
        .select('metric_value')
        .eq('metric_type', 'page_load_time')
        .gte('recorded_at', oneHourAgo.toISOString());

      const avgPageLoadTime = metrics?.length
        ? Math.round(metrics.reduce((sum, m) => sum + Number(m.metric_value), 0) / metrics.length)
        : 0;

      // Error count (from system_metrics or activity logs)
      const { data: errors } = await supabase
        .from('system_metrics')
        .select('*')
        .eq('metric_type', 'error')
        .gte('recorded_at', oneHourAgo.toISOString());

      const errorCount = errors?.length || 0;

      // Active sessions (in last hour)
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('id')
        .or(`started_at.gte.${oneHourAgo.toISOString()},ended_at.is.null`);

      const activeSessions = sessions?.length || 0;

      // Query performance (simplified - based on avg page load time)
      let queryPerformance: 'good' | 'warning' | 'critical' = 'good';
      if (avgPageLoadTime > 2000) queryPerformance = 'critical';
      else if (avgPageLoadTime > 1000) queryPerformance = 'warning';

      // Overall status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (errorCount > 10 || queryPerformance === 'critical') status = 'critical';
      else if (errorCount > 5 || queryPerformance === 'warning') status = 'warning';

      return {
        avgPageLoadTime,
        errorCount,
        activeSessions,
        queryPerformance,
        status,
      } as SystemHealth;
    },
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  const health = data || {
    avgPageLoadTime: 0,
    errorCount: 0,
    activeSessions: 0,
    queryPerformance: 'good' as const,
    status: 'healthy' as const,
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'good') return 'text-primary';
    if (status === 'warning') return 'text-accent-gold';
    return 'text-destructive';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy' || status === 'good') return <CheckCircle className="h-4 w-4" />;
    if (status === 'warning') return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <WidgetWrapper
      title="System Health"
      icon={<Activity className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
      badge={
        <Badge 
          variant={health.status === 'healthy' ? 'default' : health.status === 'warning' ? 'outline' : 'destructive'}
          className="text-xs"
        >
          {health.status.toUpperCase()}
        </Badge>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load system health</div>
      ) : (
        <div className="space-y-2">
          <HealthCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg Page Load"
            value={`${health.avgPageLoadTime}ms`}
            status={health.queryPerformance}
            statusIcon={getStatusIcon(health.queryPerformance)}
          />
          <HealthCard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Errors (1h)"
            value={health.errorCount}
            status={health.errorCount > 10 ? 'critical' : health.errorCount > 5 ? 'warning' : 'good'}
            statusIcon={getStatusIcon(health.errorCount > 10 ? 'critical' : health.errorCount > 5 ? 'warning' : 'good')}
          />
          <HealthCard
            icon={<Activity className="h-4 w-4" />}
            label="Active Sessions"
            value={health.activeSessions}
            status="good"
            statusIcon={<CheckCircle className="h-4 w-4" />}
          />
          <HealthCard
            icon={<Zap className="h-4 w-4" />}
            label="Query Performance"
            value={health.queryPerformance.toUpperCase()}
            status={health.queryPerformance}
            statusIcon={getStatusIcon(health.queryPerformance)}
          />
        </div>
      )}
    </WidgetWrapper>
  );
}

interface HealthCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  status: 'good' | 'warning' | 'critical';
  statusIcon: React.ReactNode;
}

function HealthCard({ icon, label, value, status, statusIcon }: HealthCardProps) {
  const statusColors = {
    good: 'border-primary/20 bg-primary/5',
    warning: 'border-accent-gold/20 bg-accent-gold/5',
    critical: 'border-destructive/20 bg-destructive/5',
  };

  const valueColors = {
    good: 'text-primary',
    warning: 'text-accent-gold',
    critical: 'text-destructive',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-center gap-3">
        <div className={valueColors[status]}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className={`text-lg font-bold ${valueColors[status]}`}>{value}</div>
        </div>
      </div>
      <div className={valueColors[status]}>
        {statusIcon}
      </div>
    </div>
  );
}
