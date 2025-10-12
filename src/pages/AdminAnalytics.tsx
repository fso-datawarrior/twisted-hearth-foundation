import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { CalendarIcon, TrendingUp, Users, FileText, Camera } from 'lucide-react';

interface AnalyticsDashboard {
  user_engagement: {
    total_users: number;
    active_sessions: number;
    avg_session_duration: number;
  };
  content_metrics: {
    photos_uploaded: number;
    guestbook_posts: number;
    hunt_completions: number;
  };
  page_views: {
    total_views: number;
    unique_visitors: number;
  };
  rsvp_metrics: {
    total_rsvps: number;
    confirmed: number;
    pending: number;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_analytics_dashboard', {
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd'),
      });

      if (error) throw error;
      if (data && typeof data === 'object') {
        setAnalytics(data as unknown as AnalyticsDashboard);
      }
    } catch (error) {
      logger.error('Failed to fetch analytics:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-accent-gold">ANALYTICS</h2>
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-accent-gold">ANALYTICS</h2>
        <p className="text-muted-foreground">No analytics data available for the selected date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-accent-gold">ANALYTICS</h2>
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover z-50" align="end">
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={fetchAnalytics} size="sm" className="text-xs sm:text-sm">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-accent-purple/10 to-accent-purple/5 border-accent-purple/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent-purple">{analytics.user_engagement.total_users}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border-accent-gold/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent-gold">{analytics.user_engagement.active_sessions}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-accent-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Photos Uploaded</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{analytics.content_metrics.photos_uploaded}</p>
              </div>
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-purple/10 to-accent-purple/5 border-accent-purple/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent-purple">{analytics.page_views.total_views}</p>
              </div>
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-accent-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">User Engagement</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Avg Session Duration</span>
                <span className="font-semibold">
                  {Math.round(analytics.user_engagement.avg_session_duration / 60)} min
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Unique Visitors</span>
                <span className="font-semibold">{analytics.page_views.unique_visitors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Content Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Guestbook Posts</span>
                <span className="font-semibold">{analytics.content_metrics.guestbook_posts}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Hunt Completions</span>
                <span className="font-semibold">{analytics.content_metrics.hunt_completions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">RSVP Status</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{analytics.rsvp_metrics.total_rsvps}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Confirmed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{analytics.rsvp_metrics.confirmed}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{analytics.rsvp_metrics.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
