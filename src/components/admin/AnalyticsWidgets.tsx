import { AnalyticsSummaryCards } from './analytics/AnalyticsSummaryCards';
import { PageViewsChart } from './analytics/PageViewsChart';
import { UserSessionsChart } from './analytics/UserSessionsChart';
import { ActivityBreakdownChart } from './analytics/ActivityBreakdownChart';
import { PopularPagesTable } from './analytics/PopularPagesTable';
import { DateRangeSelector } from './analytics/DateRangeSelector';
import { AnalyticsExportMenu } from './analytics/AnalyticsExportMenu';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary } from '@/lib/analytics-api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function AnalyticsWidgets() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['analytics-summary', dateRange],
    queryFn: () => getAnalyticsSummary(dateRange.start, dateRange.end),
    staleTime: 5 * 60 * 1000,
  });

  const { data: pageViews = [], isLoading: pageViewsLoading } = useQuery({
    queryKey: ['analytics-page-views', dateRange],
    queryFn: async () => {
      // Mock data for page views chart
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        total_views: Math.floor(Math.random() * 100) + 20,
        unique_visitors: Math.floor(Math.random() * 50) + 10,
      }));
    },
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['analytics-sessions', dateRange],
    queryFn: async () => {
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        active_sessions: Math.floor(Math.random() * 50) + 10,
        new_users: Math.floor(Math.random() * 20) + 5,
      }));
    },
  });

  const activityBreakdown = summary?.data ? {
    photo_uploads: summary.data.total_photos || 0,
    rsvps: summary.data.total_rsvps || 0,
    guestbook_posts: summary.data.total_guestbook_posts || 0,
    hunt_progress: 0,
  } : null;

  const { data: popularPages = [], isLoading: popularPagesLoading } = useQuery({
    queryKey: ['analytics-popular-pages', dateRange],
    queryFn: async () => {
      return [
        { page_path: '/', view_count: 245, unique_visitors: 189, avg_time: 127 },
        { page_path: '/gallery', view_count: 189, unique_visitors: 142, avg_time: 203 },
        { page_path: '/rsvp', view_count: 156, unique_visitors: 134, avg_time: 89 },
        { page_path: '/about', view_count: 98, unique_visitors: 87, avg_time: 156 },
        { page_path: '/schedule', view_count: 76, unique_visitors: 68, avg_time: 98 },
      ];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {summary?.data && (
            <AnalyticsExportMenu data={summary.data} dateRange={dateRange} />
          )}
        </div>
      </div>

      <AnalyticsSummaryCards data={summary?.data || null} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <PageViewsChart data={pageViews} isLoading={pageViewsLoading} />
        <UserSessionsChart data={sessions} isLoading={sessionsLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityBreakdownChart data={activityBreakdown} isLoading={isLoading} />
        <PopularPagesTable data={popularPages} isLoading={popularPagesLoading} />
      </div>
    </div>
  );
}
