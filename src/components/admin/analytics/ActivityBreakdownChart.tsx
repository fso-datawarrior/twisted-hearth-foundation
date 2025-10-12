import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityBreakdown {
  photo_uploads: number;
  rsvps: number;
  guestbook_posts: number;
  hunt_progress: number;
}

interface ActivityBreakdownChartProps {
  data: ActivityBreakdown | null;
  isLoading: boolean;
}

const COLORS = {
  photo_uploads: 'hsl(var(--primary))',
  rsvps: 'hsl(var(--accent))',
  guestbook_posts: 'hsl(var(--secondary))',
  hunt_progress: 'hsl(var(--muted-foreground))',
};

export function ActivityBreakdownChart({ data, isLoading }: ActivityBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: 'Photo Uploads', value: data.photo_uploads, color: COLORS.photo_uploads },
    { name: 'RSVPs', value: data.rsvps, color: COLORS.rsvps },
    { name: 'Guestbook Posts', value: data.guestbook_posts, color: COLORS.guestbook_posts },
    { name: 'Hunt Progress', value: data.hunt_progress, color: COLORS.hunt_progress },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No activity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
