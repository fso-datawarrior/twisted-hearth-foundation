import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TimeRange {
  start: Date;
  end: Date;
}

interface RsvpTrendsWidgetProps {
  timeRange: TimeRange;
}

export function RsvpTrendsWidget({ timeRange }: RsvpTrendsWidgetProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['rsvp-trends', timeRange],
    queryFn: async () => {
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('status, num_guests')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const confirmed = rsvps?.filter(r => r.status === 'confirmed').length || 0;
      const pending = rsvps?.filter(r => r.status === 'pending').length || 0;
      const declined = rsvps?.filter(r => r.status === 'declined').length || 0;
      const totalGuests = rsvps?.reduce((sum, r) => sum + r.num_guests, 0) || 0;

      return {
        confirmed,
        pending,
        declined,
        total: (rsvps?.length || 0),
        totalGuests
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="RSVP Trends" icon={Calendar}>
        <Skeleton className="h-48 w-full" />
      </WidgetWrapper>
    );
  }

  const chartData = [
    { name: 'Confirmed', value: metrics?.confirmed || 0, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: metrics?.pending || 0, color: 'hsl(var(--secondary))' },
    { name: 'Declined', value: metrics?.declined || 0, color: 'hsl(var(--destructive))' }
  ];

  return (
    <WidgetWrapper title="RSVP Trends" icon={Calendar}>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 p-2 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Confirmed</span>
            </div>
            <div className="text-xl font-bold text-primary">{metrics?.confirmed || 0}</div>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-secondary/10 rounded-lg">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-secondary" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="text-xl font-bold text-secondary">{metrics?.pending || 0}</div>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-destructive/10 rounded-lg">
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">Declined</span>
            </div>
            <div className="text-xl font-bold text-destructive">{metrics?.declined || 0}</div>
          </div>
        </div>

        {/* Guest Count */}
        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Total Guests Expected</span>
          </div>
          <div className="text-2xl font-bold text-accent">{metrics?.totalGuests || 0}</div>
        </div>

        {/* Chart */}
        {metrics && metrics.total > 0 && (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
