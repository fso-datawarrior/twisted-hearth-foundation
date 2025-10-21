import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import { supabase } from "@/integrations/supabase/client";
import { PhotoLightbox } from "@/components/gallery/PhotoLightbox";
import { Photo } from "@/lib/photo-api";
import { getPublicImageUrlSync } from "@/lib/image-url";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { VignettesCarousel } from "@/components/VignettesCarousel";

const Vignettes = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { trackInteraction } = useAnalytics();

  // Fetch vignettes with their metadata from past_vignettes table
  const { data: vignettes, isLoading, error } = useQuery({
    queryKey: ['active-vignettes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('past_vignettes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Convert photos to display format with proper signed URLs
  const [displayVignettes, setDisplayVignettes] = useState<any[]>([]);

  useEffect(() => {
    const generateVignetteUrls = async () => {
      // Don't set any data during initial loading
      if (isLoading) return;
      
      if (!vignettes || vignettes.length === 0) {
        // Only set empty array if loading is complete and still no data
        setDisplayVignettes([]);
        return;
      }

      // Build a map of first photo id per vignette
      const photoIds = vignettes
        .map((v: any) => v.photo_ids?.[0])
        .filter((id: string | undefined) => !!id) as string[];

      if (photoIds.length === 0) {
        setDisplayVignettes([]);
        return;
      }

      // Fetch all required photos in one query
      const { data: photosData, error: photosErr } = await supabase
        .from('photos')
        .select('id, storage_path, is_approved')
        .in('id', photoIds)
        .eq('is_approved', true);

      if (photosErr) {
        console.error('Error fetching vignette photos:', photosErr);
        setDisplayVignettes([]);
        return;
      }

      const photoMap = new Map<string, { storage_path: string }>();
      (photosData || []).forEach((p: any) => photoMap.set(p.id, { storage_path: p.storage_path }));

      const vignettesWithUrls = vignettes.map((v: any) => {
        const pid = v.photo_ids?.[0];
        const photo = pid ? photoMap.get(pid) : undefined;
        const imageUrl = photo ? (() => {
          try {
            return getPublicImageUrlSync(photo.storage_path) || '/img/no-photos-placeholder.jpg';
          } catch (err) {
            console.error('Failed to generate image URL:', err);
            return '/img/no-photos-placeholder.jpg';
          }
        })() : '';
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          year: v.year,
          theme_tag: v.theme_tag,
          imageUrl,
          isActive: v.is_active,
          photoId: pid,
          storagePath: photo?.storage_path
        };
      }).filter((v: any) => v.imageUrl);

      setDisplayVignettes(vignettesWithUrls as any[]);
    };

    generateVignetteUrls();
  }, [vignettes, isLoading]);

  // Convert vignettes to Photo format for lightbox
  const lightboxPhotos: Photo[] = displayVignettes.map((vignette) => ({
    id: vignette.id,
    storage_path: vignette.imageUrl,
    filename: `vignette-${vignette.id}`,
    caption: `${vignette.title} - ${vignette.description}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '',
    is_approved: true,
    tags: [vignette.theme_tag],
    likes_count: 0,
    is_featured: false,
    is_favorite: false
  }));

  // Handle vignette click to open lightbox
  const handleVignetteClick = (vignetteId: string) => {
    const index = displayVignettes.findIndex(v => v.id === vignetteId);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
      trackInteraction('vignette', vignetteId, 'view');
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-28 sm:pt-32 md:pt-36 relative z-10">
        {/* CSS animated fog effect */}
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-0.5 sm:px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Past Twisted Vignettes
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Each year, we've explored different twisted takes on beloved fairytales. 
              Browse our previous performances and see how far down the rabbit hole we've gone.
            </p>
            
            {/* LOADING STATE */}
            {isLoading && (
              <div className="relative max-w-6xl mx-auto">
                <div className="overflow-hidden rounded-lg">
                  <div className="flex gap-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div 
                        key={i}
                        className="flex-shrink-0 w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] aspect-[4/5] bg-muted/50 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center mt-8 text-muted-foreground">
                  Loading past vignettes...
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {!isLoading && error && (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">Failed to load vignettes.</div>
                <p className="text-muted-foreground">Please try refreshing the page.</p>
              </div>
            )}
            
            {/* EMPTY STATE */}
            {!isLoading && !error && displayVignettes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No past vignettes available at this time.</div>
              </div>
            )}
            
            {/* CAROUSEL - Only render when data is ready */}
            {!isLoading && !error && displayVignettes.length > 0 && (
              <VignettesCarousel
                vignettes={displayVignettes}
                onVignetteClick={handleVignetteClick}
              />
            )}
            
            <div className="mt-16 text-center relative">
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                <h2 className="font-subhead text-2xl mb-4 text-accent-gold">This Year's Vignette</h2>
                <p className="font-body text-muted-foreground mb-6">
                  We're crafting something special for 2025. Multiple twisted tales will unfold 
                  throughout the evening, with guests becoming part of the story. Which path 
                  will you choose when the clock strikes midnight?
                </p>
                <div className="text-accent-red font-subhead text-lg">
                  "Not all who wander are lost... but some should be."
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Vignettes;