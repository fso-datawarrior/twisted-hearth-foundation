import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart } from '@/components/admin/Analytics/Charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RsvpMetrics {
  confirmed: number;
  pending: number;
  total: number;
  expectedGuests: number;
  trend: Array<{ date: string; count: number }>;
}

export default function RsvpTrendsWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['rsvp-trends'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all RSVPs
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('status, num_guests, created_at');

      const confirmed = rsvps?.filter(r => r.status === 'confirmed').length || 0;
      const pending = rsvps?.filter(r => r.status === 'pending').length || 0;
      const total = rsvps?.length || 0;
      const expectedGuests = rsvps?.reduce((sum, r) => sum + (r.num_guests || 0), 0) || 0;

      // 7-day trend
      const recentRsvps = rsvps?.filter(r => new Date(r.created_at) >= sevenDaysAgo) || [];
      const trendMap: Record<string, number> = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        trendMap[dateStr] = 0;
      }

      recentRsvps.forEach(rsvp => {
        const dateStr = new Date(rsvp.created_at).toISOString().split('T')[0];
        if (dateStr in trendMap) {
          trendMap[dateStr]++;
        }
      });

      const trend = Object.entries(trendMap).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }));

      return {
        confirmed,
        pending,
        total,
        expectedGuests,
        trend,
      } as RsvpMetrics;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = data || {
    confirmed: 0,
    pending: 0,
    total: 0,
    expectedGuests: 0,
    trend: [],
  };

  return (
    <WidgetWrapper
      title="RSVP Trends"
      icon={<Calendar className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load RSVP trends</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<CheckCircle className="h-4 w-4 text-primary" />}
              label="Confirmed"
              value={metrics.confirmed}
              color="primary"
            />
            <MetricCard
              icon={<Clock className="h-4 w-4 text-accent-gold" />}
              label="Pending"
              value={metrics.pending}
              color="accent-gold"
            />
            <MetricCard
              icon={<Calendar className="h-4 w-4 text-secondary" />}
              label="Total RSVPs"
              value={metrics.total}
              color="secondary"
            />
            <MetricCard
              icon={<Users className="h-4 w-4 text-accent" />}
              label="Expected Guests"
              value={metrics.expectedGuests}
              color="accent"
            />
          </div>

          <div className="border-t border-border pt-3">
            <LineChart
              title="7-Day Trend"
              data={metrics.trend}
              lines={[{ dataKey: 'count', color: '#3b82f6', name: 'RSVPs' }]}
              height={120}
              showGrid={false}
              showLegend={false}
              xAxisKey="date"
            />
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
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
