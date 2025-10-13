import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { Download, FileText } from "lucide-react";
import { getAnalyticsSummary } from "@/lib/analytics-api";
import { exportToCSV, exportToPDF } from "@/lib/analytics-export";
import { DashboardSettings, WidgetVisibility } from "./DashboardSettings";
import {
  UserEngagementWidget,
  ContentMetricsWidget,
  RsvpTrendsWidget,
  PhotoPopularityWidget,
  GuestbookActivityWidget,
  SystemHealthWidget,
  RealtimeActivityFeed,
} from './DashboardWidgets';
import { toast } from "sonner";

// Comprehensive Admin analytics dashboard with 8+ advanced widgets

const DEFAULT_VISIBILITY: WidgetVisibility = {
  userEngagement: true,
  contentMetrics: true,
  rsvpTrends: true,
  photoPopularity: true,
  guestbookActivity: true,
  systemHealth: true,
  realtimeActivity: true,
};

export default function AnalyticsWidgets() {
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(() => {
    const saved = localStorage.getItem('dashboard-widget-visibility');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBILITY;
  });

  // Save visibility changes to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widget-visibility', JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  const handleSaveSettings = (newVisibility: WidgetVisibility) => {
    setWidgetVisibility(newVisibility);
    toast.success('Dashboard settings saved');
  };

  const handleExportCSV = () => {
    const exportData = {
      title: 'Analytics Dashboard Export',
      dateRange: `Last ${range === '7d' ? '7 days' : '30 days'}`,
      metrics: [
        { label: 'Total Sessions', value: totals.sessions || 0 },
        { label: 'Total Page Views', value: totals.page_views || 0 },
        { label: 'Total Actions', value: totals.actions || 0 },
      ],
      tables: [
        {
          title: 'Traffic Trends',
          headers: ['Date', 'Sessions', 'Page Views', 'Actions'],
          rows: series.map(s => [s.date, s.sessions, s.page_views, s.actions]),
        },
      ],
    };
    exportToCSV(exportData);
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = () => {
    const exportData = {
      title: 'Analytics Dashboard Report',
      dateRange: `Last ${range === '7d' ? '7 days' : '30 days'}`,
      metrics: [
        { label: 'Total Sessions', value: totals.sessions || 0 },
        { label: 'Total Page Views', value: totals.page_views || 0 },
        { label: 'Total Actions', value: totals.actions || 0 },
      ],
      tables: [
        {
          title: 'Traffic Trends',
          headers: ['Date', 'Sessions', 'Page Views', 'Actions'],
          rows: series.map(s => [s.date, s.sessions, s.page_views, s.actions]),
        },
      ],
    };
    exportToPDF(exportData);
    toast.success('PDF exported successfully');
  };

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (range === "7d" ? 6 : 29));
    return { startDate: start, endDate: end };
  }, [range]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-analytics-summary", range],
    queryFn: async () => {
      const res = await getAnalyticsSummary(startDate, endDate);
      if (res.error) throw res.error;
      return res.data as any;
    },
  });

  const summary = data || { totals: {}, series: [] };
  const totals = summary.totals || { sessions: 0, page_views: 0, actions: 0 };
  const series: Array<{ date: string; sessions: number; page_views: number; actions: number }> = summary.series || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-semibold text-primary">Analytics Dashboard</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 rounded-md border border-border p-1">
            <button
              type="button"
              className={`px-2 py-1 text-xs rounded ${range === "7d" ? "bg-accent/20 text-foreground" : "text-muted-foreground"}`}
              onClick={() => setRange("7d")}
            >
              7d
            </button>
            <button
              type="button"
              className={`px-2 py-1 text-xs rounded ${range === "30d" ? "bg-accent/20 text-foreground" : "text-muted-foreground"}`}
              onClick={() => setRange("30d")}
            >
              30d
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <DashboardSettings 
            visibility={widgetVisibility}
            onSave={handleSaveSettings}
          />
        </div>
      </div>

      {/* Quick Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-primary">{totals.sessions ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm">Page Views</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-secondary">{totals.page_views ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-accent">{totals.actions ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm">Traffic Trends - Last {range}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : isError ? (
            <div className="text-sm text-destructive">Failed to load analytics summary.</div>
          ) : (
            <ChartContainer
              config={{
                sessions: { label: "Sessions", color: "hsl(var(--primary))" },
                page_views: { label: "Page Views", color: "hsl(var(--secondary))" },
                actions: { label: "Actions", color: "hsl(var(--accent))" },
              }}
              className="h-56"
            >
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="sessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="page_views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-page_views)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-page_views)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="actions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-actions)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-actions)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickMargin={8} tickLine={false} axisLine={false} />
                  <YAxis width={28} tickMargin={8} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Area type="monotone" dataKey="sessions" stroke="var(--color-sessions)" fill="url(#sessions)" strokeWidth={2} />
                  <Area type="monotone" dataKey="page_views" stroke="var(--color-page_views)" fill="url(#page_views)" strokeWidth={2} />
                  <Area type="monotone" dataKey="actions" stroke="var(--color-actions)" fill="url(#actions)" strokeWidth={2} />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Advanced Dashboard Widgets - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {widgetVisibility.userEngagement && <UserEngagementWidget />}
        {widgetVisibility.contentMetrics && <ContentMetricsWidget />}
        {widgetVisibility.rsvpTrends && <RsvpTrendsWidget />}
        {widgetVisibility.photoPopularity && <PhotoPopularityWidget />}
        {widgetVisibility.guestbookActivity && <GuestbookActivityWidget />}
        {widgetVisibility.systemHealth && <SystemHealthWidget />}
      </div>

      {/* Full-width Realtime Activity Feed */}
      {widgetVisibility.realtimeActivity && <RealtimeActivityFeed />}
    </div>
  );
}
