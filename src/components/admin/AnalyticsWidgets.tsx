import { AnalyticsSummaryCards } from './analytics/AnalyticsSummaryCards';
import { PageViewsChart } from './analytics/PageViewsChart';
import { UserSessionsChart } from './analytics/UserSessionsChart';
import { ActivityBreakdownChart } from './analytics/ActivityBreakdownChart';
import { PopularPagesTable } from './analytics/PopularPagesTable';
import { DateRangeSelector } from './analytics/DateRangeSelector';
import { AnalyticsExportMenu } from './analytics/AnalyticsExportMenu';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary, getPageViewsByDate, getPopularPages } from '@/lib/analytics-api';
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

  const { data: pageViewsData, isLoading: pageViewsLoading } = useQuery({
    queryKey: ['analytics-page-views', dateRange],
    queryFn: () => getPageViewsByDate(dateRange.start, dateRange.end),
    staleTime: 5 * 60 * 1000,
  });

  const pageViews = pageViewsData?.data || [];

  // Sessions data derived from page views
  const sessions = pageViews.map((pv: any) => ({
    date: pv.date,
    active_sessions: pv.unique_visitors,
    new_users: Math.floor(pv.unique_visitors * 0.3),
  }));

  const activityBreakdown = summary?.data ? {
    photo_uploads: summary.data.total_photos || 0,
    rsvps: summary.data.total_rsvps || 0,
    guestbook_posts: summary.data.total_guestbook_posts || 0,
    hunt_progress: 0,
  } : null;

  const { data: popularPagesData, isLoading: popularPagesLoading } = useQuery({
    queryKey: ['analytics-popular-pages', dateRange],
    queryFn: () => getPopularPages(dateRange.start, dateRange.end),
    staleTime: 5 * 60 * 1000,
  });

  const popularPages = popularPagesData?.data || [];

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
        <UserSessionsChart data={sessions} isLoading={pageViewsLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityBreakdownChart data={activityBreakdown} isLoading={isLoading} />
        <PopularPagesTable data={popularPages} isLoading={popularPagesLoading} />
      </div>
    </div>
  );
}
