import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WidgetWrapper from '../AnalyticsWidgets/WidgetWrapper';
import { Heart, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PopularPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  likes_count: number;
  signedUrl: string;
}

export default function PhotoPopularityWidget() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['popular-photos'],
    queryFn: async () => {
      // Get top 10 most liked photos
      const { data: photos } = await supabase
        .from('photos')
        .select('id, storage_path, caption, likes_count')
        .eq('is_approved', true)
        .order('likes_count', { ascending: false })
        .limit(10);

      if (!photos) return [];

      // Generate signed URLs
      const photosWithUrls = await Promise.all(
        photos.map(async (photo) => {
          try {
            const { data: urlData } = await supabase.storage
              .from('gallery')
              .createSignedUrl(photo.storage_path, 3600);
            
            return {
              ...photo,
              signedUrl: urlData?.signedUrl || '',
            };
          } catch (error) {
            return {
              ...photo,
              signedUrl: '',
            };
          }
        })
      );

      return photosWithUrls as PopularPhoto[];
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const photos = data || [];

  return (
    <WidgetWrapper
      title="Most Popular Photos"
      icon={<TrendingUp className="h-4 w-4" />}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load popular photos</div>
      ) : photos.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No photos with likes yet
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
              >
                <div className="flex-shrink-0 text-lg font-bold text-muted-foreground w-6 text-center">
                  #{index + 1}
                </div>
                {photo.signedUrl ? (
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption || 'Photo'}
                    className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {photo.caption || 'Untitled Photo'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3 fill-current text-destructive" />
                    <span>{photo.likes_count} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </WidgetWrapper>
  );
}
