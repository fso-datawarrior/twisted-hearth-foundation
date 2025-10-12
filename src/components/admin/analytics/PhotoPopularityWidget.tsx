import { useQuery } from '@tanstack/react-query';
import { Heart, TrendingUp, Star } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRange {
  start: Date;
  end: Date;
}

interface PhotoPopularityWidgetProps {
  timeRange: TimeRange;
}

export function PhotoPopularityWidget({ timeRange }: PhotoPopularityWidgetProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['photo-popularity', timeRange],
    queryFn: async () => {
      // Get most liked photos
      const { data: photos } = await supabase
        .from('photos')
        .select('id, filename, likes_count, is_featured')
        .eq('is_approved', true)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .order('likes_count', { ascending: false })
        .limit(5);

      // Get total likes
      const { count: totalLikes } = await supabase
        .from('photo_reactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      // Get featured photos count
      const { count: featuredCount } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('is_approved', true);

      return {
        topPhotos: photos || [],
        totalLikes: totalLikes || 0,
        featuredCount: featuredCount || 0
      };
    }
  });

  if (isLoading) {
    return (
      <WidgetWrapper title="Photo Popularity" icon={Heart}>
        <Skeleton className="h-48 w-full" />
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper title="Photo Popularity" icon={Heart}>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Total Likes</span>
            </div>
            <div className="text-2xl font-bold text-accent">
              {metrics?.totalLikes || 0}
            </div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-accent-gold/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-gold" />
              <span className="text-xs text-muted-foreground">Featured</span>
            </div>
            <div className="text-2xl font-bold text-accent-gold">
              {metrics?.featuredCount || 0}
            </div>
          </div>
        </div>

        {/* Top Photos List */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Most Liked Photos</h4>
          </div>
          <div className="space-y-2">
            {metrics?.topPhotos && metrics.topPhotos.length > 0 ? (
              metrics.topPhotos.map((photo, idx) => (
                <div 
                  key={photo.id} 
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      #{idx + 1}
                    </span>
                    <span className="text-sm truncate max-w-[150px]">
                      {photo.filename}
                    </span>
                    {photo.is_featured && (
                      <Star className="h-3 w-3 text-accent-gold" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-accent" />
                    <span className="text-sm font-semibold text-accent">
                      {photo.likes_count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No photos in this time range
              </p>
            )}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
