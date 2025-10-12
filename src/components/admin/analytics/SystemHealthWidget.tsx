import { useQuery } from '@tanstack/react-query';
import { Activity, Database, HardDrive, Zap } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function SystemHealthWidget() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // Get storage usage from photos
      const { count: photoCount } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true });

      // Estimate storage (assuming avg 2MB per photo)
      const estimatedStorageMB = (photoCount || 0) * 2;
      const storageUsagePercent = Math.min((estimatedStorageMB / 5000) * 100, 100); // Assuming 5GB limit

      // Get error rate from last 24 hours (using system_metrics if available)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: errorMetrics } = await supabase
        .from('system_metrics')
        .select('metric_value')
        .eq('metric_type', 'error_rate')
        .gte('recorded_at', yesterday.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get active sessions in last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', oneHourAgo.toISOString())
        .is('ended_at', null);

      return {
        storageUsageMB: estimatedStorageMB,
        storageUsagePercent: storageUsagePercent.toFixed(1),
        errorRate: errorMetrics?.metric_value || 0,
        activeSessions: activeSessions || 0,
        photoCount: photoCount || 0
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="System Health" icon={Activity}>
        <Skeleton className="h-48 w-full" />
      </WidgetWrapper>
    );
  }

  const healthMetrics = [
    {
      label: 'Storage Used',
      value: `${metrics?.storageUsageMB || 0}MB`,
      percent: metrics?.storageUsagePercent,
      icon: HardDrive,
      color: 'text-primary'
    },
    {
      label: 'Error Rate',
      value: `${Number(metrics?.errorRate || 0).toFixed(2)}%`,
      icon: Zap,
      color: Number(metrics?.errorRate || 0) > 5 ? 'text-destructive' : 'text-green-500',
      status: Number(metrics?.errorRate || 0) > 5 ? 'High' : 'Normal'
    },
    {
      label: 'Active Sessions',
      value: metrics?.activeSessions || 0,
      icon: Activity,
      color: 'text-accent'
    },
    {
      label: 'Total Photos',
      value: metrics?.photoCount || 0,
      icon: Database,
      color: 'text-secondary'
    }
  ];

  return (
    <WidgetWrapper title="System Health" icon={Activity}>
      <div className="space-y-3">
        {healthMetrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </span>
              {metric.percent && (
                <span className="text-xs text-muted-foreground">
                  {metric.percent}% capacity
                </span>
              )}
              {metric.status && (
                <span className={`text-xs ${metric.color}`}>
                  {metric.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}
