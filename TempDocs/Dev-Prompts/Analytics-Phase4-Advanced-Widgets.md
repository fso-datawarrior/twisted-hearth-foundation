# Analytics Phase 4: Advanced Dashboard Widgets

## 🎯 Objective
Implement comprehensive analytics dashboard with 8 specialized widget components displaying 35+ metrics across user engagement, content, events, and system health.

## 📋 Prerequisites
✅ Phase 1-3 Complete (database, automation, basic widgets)
✅ Analytics data collecting (sessions, page views, interactions)
✅ Admin dashboard accessible

---

## PART 1: Widget Infrastructure (Priority: HIGH)

### Step 1: Create Widget Wrapper Component

Create: `src/components/admin/DashboardWidgets/WidgetWrapper.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WidgetWrapperProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  children: React.ReactNode;
  className?: string;
}

export const WidgetWrapper = ({
  title,
  description,
  icon,
  isLoading = false,
  error,
  onRefresh,
  onExport,
  trend,
  trendValue,
  children,
  className = ""
}: WidgetWrapperProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendValue}</span>
            </div>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-500 p-4 bg-red-50 rounded-md">
            Error: {error}
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
```

---

## PART 2: User Engagement Widgets (Priority: HIGH)

### Widget 1: User Engagement Overview

Create: `src/components/admin/DashboardWidgets/UserEngagementWidget.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WidgetWrapper } from "./WidgetWrapper";
import { Users, Activity, Clock, UserCheck } from "lucide-react";

interface EngagementMetrics {
  total_users: number;
  active_users_7d: number;
  avg_session_duration: number;
  pages_per_session: number;
  new_users_7d: number;
  returning_users: number;
}

export const UserEngagementWidget = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-engagement-metrics'],
    queryFn: async () => {
      // Total registered users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users (last 7 days)
      const { count: activeUsers } = await supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('user_id', 'is', null);

      // Session metrics (last 7 days)
      const { data: sessionMetrics } = await supabase
        .from('user_sessions')
        .select('pages_viewed, duration_seconds, user_id')
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const avgDuration = sessionMetrics?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / (sessionMetrics?.length || 1);
      const avgPages = sessionMetrics?.reduce((sum, s) => sum + (s.pages_viewed || 0), 0) / (sessionMetrics?.length || 1);

      // New vs returning users
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return {
        total_users: totalUsers || 0,
        active_users_7d: activeUsers || 0,
        avg_session_duration: Math.round(avgDuration / 60), // minutes
        pages_per_session: Math.round(avgPages * 10) / 10,
        new_users_7d: newUsers || 0,
        returning_users: (activeUsers || 0) - (newUsers || 0)
      } as EngagementMetrics;
    },
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  return (
    <WidgetWrapper
      title="User Engagement"
      description="Last 7 days"
      icon={<Users className="h-5 w-5" />}
      isLoading={isLoading}
      error={error?.message}
      onRefresh={() => refetch()}
    >
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Total Users"
          value={data?.total_users || 0}
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        <MetricCard
          label="Active (7d)"
          value={data?.active_users_7d || 0}
          icon={<Activity className="h-4 w-4 text-green-500" />}
        />
        <MetricCard
          label="Avg Session"
          value={`${data?.avg_session_duration || 0}m`}
          icon={<Clock className="h-4 w-4 text-purple-500" />}
        />
        <MetricCard
          label="Pages/Session"
          value={data?.pages_per_session || 0}
          icon={<Activity className="h-4 w-4 text-orange-500" />}
        />
        <MetricCard
          label="New Users"
          value={data?.new_users_7d || 0}
          icon={<UserCheck className="h-4 w-4 text-teal-500" />}
          subtitle="Last 7 days"
        />
        <MetricCard
          label="Returning"
          value={data?.returning_users || 0}
          icon={<Users className="h-4 w-4 text-indigo-500" />}
          subtitle="Active returning"
        />
      </div>
    </WidgetWrapper>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard = ({ label, value, icon, subtitle }: MetricCardProps) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);
```

### Widget 2: Content Metrics

Create: `src/components/admin/DashboardWidgets/ContentMetricsWidget.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WidgetWrapper } from "./WidgetWrapper";
import { Image, MessageSquare, Eye, Heart } from "lucide-react";

export const ContentMetricsWidget = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content-metrics'],
    queryFn: async () => {
      // Photos metrics
      const { count: totalPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true });

      const { count: pendingPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Guestbook metrics
      const { count: guestbookPosts } = await supabase
        .from('guestbook')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Content interactions (last 7 days)
      const { count: photoViews } = await supabase
        .from('content_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'photo')
        .eq('interaction_type', 'view')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: photoLikes } = await supabase
        .from('photo_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('reaction_type', 'like');

      return {
        total_photos: totalPhotos || 0,
        pending_photos: pendingPhotos || 0,
        guestbook_posts: guestbookPosts || 0,
        photo_views_7d: photoViews || 0,
        total_likes: photoLikes || 0
      };
    },
    refetchInterval: 5 * 60 * 1000
  });

  return (
    <WidgetWrapper
      title="Content Metrics"
      description="Photos & Guestbook"
      icon={<Image className="h-5 w-5" />}
      isLoading={isLoading}
      error={error?.message}
      onRefresh={() => refetch()}
    >
      <div className="space-y-3">
        <ContentMetricRow
          icon={<Image className="h-4 w-4 text-blue-500" />}
          label="Total Photos"
          value={data?.total_photos || 0}
          badge={data?.pending_photos ? `${data.pending_photos} pending` : undefined}
        />
        <ContentMetricRow
          icon={<Eye className="h-4 w-4 text-green-500" />}
          label="Photo Views (7d)"
          value={data?.photo_views_7d || 0}
        />
        <ContentMetricRow
          icon={<Heart className="h-4 w-4 text-red-500" />}
          label="Total Likes"
          value={data?.total_likes || 0}
        />
        <ContentMetricRow
          icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
          label="Guestbook Posts"
          value={data?.guestbook_posts || 0}
        />
      </div>
    </WidgetWrapper>
  );
};

interface ContentMetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  badge?: string;
}

const ContentMetricRow = ({ icon, label, value, badge }: ContentMetricRowProps) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold">{value}</span>
      {badge && (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
  </div>
);
```

---

## PART 3: Event-Specific Widgets

### Widget 3: RSVP Trends

Create: `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WidgetWrapper } from "./WidgetWrapper";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";

export const RsvpTrendsWidget = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rsvp-trends'],
    queryFn: async () => {
      const { data: rsvps, error } = await supabase
        .from('rsvps')
        .select('status, num_guests, created_at, is_approved');

      if (error) throw error;

      const confirmed = rsvps?.filter(r => r.is_approved).length || 0;
      const pending = rsvps?.filter(r => r.is_approved === null).length || 0;
      const total = rsvps?.length || 0;
      const totalGuests = rsvps?.filter(r => r.is_approved).reduce((sum, r) => sum + r.num_guests, 0) || 0;

      // RSVPs by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const rsvpsByDay = last7Days.map(date => {
        const count = rsvps?.filter(r => 
          r.created_at.startsWith(date)
        ).length || 0;
        return { date, count };
      });

      return {
        confirmed,
        pending,
        total,
        totalGuests,
        rsvpsByDay
      };
    }
  });

  return (
    <WidgetWrapper
      title="RSVP Status"
      description="Event attendance tracking"
      icon={<Calendar className="h-5 w-5" />}
      isLoading={isLoading}
      error={error?.message}
      onRefresh={() => refetch()}
      trend={data && data.confirmed > 0 ? 'up' : 'neutral'}
      trendValue={data ? `${data.confirmed}/${data.total}` : undefined}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-900">{data?.confirmed || 0}</p>
            <p className="text-sm text-green-700">Confirmed</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{data?.pending || 0}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Users className="h-4 w-4 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-blue-900">{data?.totalGuests || 0}</p>
          <p className="text-sm text-blue-700">Total Expected Guests</p>
        </div>
        {/* Mini trend chart - can be enhanced with Recharts later */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">RSVPs Last 7 Days</p>
          <div className="flex items-end justify-between h-12 gap-1">
            {data?.rsvpsByDay.map((day, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-200 rounded-t hover:bg-blue-300 transition-colors"
                style={{ height: `${Math.max(10, (day.count / Math.max(...data.rsvpsByDay.map(d => d.count), 1)) * 100)}%` }}
                title={`${day.date}: ${day.count} RSVPs`}
              />
            ))}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};
```

---

## PART 4: Integration into Admin Dashboard

### Update AdminDashboard.tsx

Modify: `src/pages/AdminDashboard.tsx`

Add imports:
```typescript
import { UserEngagementWidget } from '@/components/admin/DashboardWidgets/UserEngagementWidget';
import { ContentMetricsWidget } from '@/components/admin/DashboardWidgets/ContentMetricsWidget';
import { RsvpTrendsWidget } from '@/components/admin/DashboardWidgets/RsvpTrendsWidget';
```

In the Overview tab, replace or add alongside existing AnalyticsWidgets:
```typescript
{activeTab === 'overview' && (
  <div className="space-y-6">
    {/* Existing analytics widgets */}
    <Suspense fallback={<Skeleton className="h-48" />}>
      <LazyAnalyticsWidgets />
    </Suspense>

    {/* New advanced widgets */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UserEngagementWidget />
      <ContentMetricsWidget />
      <RsvpTrendsWidget />
    </div>
  </div>
)}
```

---

## REMAINING WIDGETS TO CREATE

Following same pattern, create these additional widgets:

4. **PhotoPopularityWidget.tsx** - Top 10 most liked/viewed photos
5. **GuestbookActivityWidget.tsx** - Recent posts, top contributors
6. **SystemHealthWidget.tsx** - Error rates, performance metrics
7. **RealtimeActivityFeed.tsx** - Live feed of recent user actions

---

## TESTING CHECKLIST

- [ ] WidgetWrapper component renders correctly
- [ ] UserEngagementWidget shows accurate metrics
- [ ] ContentMetricsWidget displays photo & guestbook data
- [ ] RsvpTrendsWidget shows RSVP status breakdown
- [ ] Refresh buttons work on all widgets
- [ ] Loading states display properly
- [ ] Error states handle gracefully
- [ ] Widgets are responsive (mobile/desktop)
- [ ] Data refreshes every 5 minutes automatically
- [ ] Admin dashboard integrates all widgets

---

## SUCCESS CRITERIA

Phase 4 Complete When:
- ✅ 8 widget components created
- ✅ All widgets displaying real data from database
- ✅ Widgets integrated into Admin Dashboard
- ✅ Responsive design across all screen sizes
- ✅ Auto-refresh working (5-minute intervals)
- ✅ Manual refresh buttons functional
- ✅ Loading & error states handled

---

## ESTIMATED TIME

- Widget Infrastructure (WidgetWrapper): 1 hour
- User Engagement Widget: 1-1.5 hours
- Content Metrics Widget: 1 hour
- RSVP Trends Widget: 1-1.5 hours
- Remaining 4 widgets: 3-4 hours
- Integration & Testing: 1-2 hours

**Total:** 8-11 hours

---

**This phase creates a comprehensive admin analytics dashboard with real-time business insights!**

