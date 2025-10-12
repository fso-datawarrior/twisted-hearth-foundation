import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Clock, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsSummary {
  total_page_views: number;
  unique_visitors: number;
  avg_session_duration: number;
  total_rsvps: number;
  total_photos: number;
  total_guestbook_posts: number;
}

interface AnalyticsSummaryCardsProps {
  data: AnalyticsSummary | null;
  isLoading: boolean;
}

export function AnalyticsSummaryCards({ data, isLoading }: AnalyticsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const cards = [
    {
      title: 'Total Page Views',
      value: data.total_page_views.toLocaleString(),
      icon: Eye,
      description: 'All page views in selected range',
    },
    {
      title: 'Unique Visitors',
      value: data.unique_visitors.toLocaleString(),
      icon: Users,
      description: 'Individual users tracked',
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(data.avg_session_duration),
      icon: Clock,
      description: 'Average time per session',
    },
    {
      title: 'User Actions',
      value: (
        data.total_rsvps + 
        data.total_photos + 
        data.total_guestbook_posts
      ).toLocaleString(),
      icon: Activity,
      description: `${data.total_rsvps} RSVPs, ${data.total_photos} photos, ${data.total_guestbook_posts} posts`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
