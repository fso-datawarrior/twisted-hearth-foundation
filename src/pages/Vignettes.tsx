import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import Card from "@/components/Card";
import { supabase } from "@/integrations/supabase/client";
import { PhotoLightbox } from "@/components/gallery/PhotoLightbox";
import { Photo } from "@/lib/photo-api";
import { getPublicImageUrlSync } from "@/lib/image-url";

const Vignettes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

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
      if (!vignettes || vignettes.length === 0) {
        // Set fallback data if no vignettes exist
        setDisplayVignettes([
          {
            id: "fallback-1",
            title: "Goldilocks: Home Invasion",
            description: "What really happened when Goldilocks broke into the Bears' house? A tale of obsession, surveillance, and the price of curiosity.",
            year: 2023,
            theme_tag: "Breaking & Entering",
            imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
          },
          {
            id: "fallback-2", 
            title: "Jack & The Corporate Ladder",
            description: "Jack's beanstalk led not to a giant's castle, but to the top of a corporate empire built on the bones of the working class.",
            year: 2022,
            theme_tag: "Economic Horror",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
          },
          {
            id: "fallback-3",
            title: "Snow White: Mirror, Mirror", 
            description: "The magic mirror showed more than vanity - it revealed the darkest truths about beauty standards and self-worth in a social media age.",
            year: 2021,
            theme_tag: "Digital Dystopia",
            imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=800&h=600&fit=crop"
          }
        ]);
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
  }, [vignettes]);

  // Carousel navigation
  const maxIndex = Math.max(0, displayVignettes.length - itemsPerView);
  
  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

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
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (displayVignettes.length <= itemsPerView) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [displayVignettes.length, itemsPerView, maxIndex]);

  // Reset current index when items per view changes
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-20 relative z-10">
        {/* CSS animated fog effect */}
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Past Twisted Vignettes
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Each year, we've explored different twisted takes on beloved fairytales. 
              Browse our previous performances and see how far down the rabbit hole we've gone.
            </p>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading past vignettes...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-destructive">Failed to load vignettes. Showing archived versions.</div>
              </div>
            )}
            
            {/* Carousel Container */}
            <div className="relative max-w-6xl mx-auto">
              {displayVignettes.length > itemsPerView ? (
                <>
                  {/* Carousel Navigation Buttons */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    onClick={nextSlide}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Carousel Track */}
                  <div className="overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ 
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                        width: `${(displayVignettes.length / itemsPerView) * 100}%`
                      }}
                    >
                      {displayVignettes.map((vignette, index) => (
                        <div 
                          key={vignette.id} 
                          className="relative flex-shrink-0 px-4"
                          style={{ width: `${100 / displayVignettes.length}%` }}
                        >
                          <div className="h-full">
                            <Card
                              variant="vignette"
                              image={vignette.imageUrl || "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"}
                              title={vignette.title}
                              hook={vignette.description}
                              onClick={() => handleVignetteClick(vignette.id)}
                              className="hover-tilt motion-safe h-full"
                            >
                              <div className="mt-4 flex justify-between items-center text-sm">
                                <span className="font-subhead text-accent-gold">{vignette.year}</span>
                                <span className="font-body text-muted-foreground">{vignette.theme_tag}</span>
                              </div>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carousel Dots */}
                  <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentIndex 
                            ? 'bg-accent-gold' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Static Grid for Small Number of Items */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayVignettes.map((vignette, index) => (
                    <div key={vignette.id} className="relative">
                      <Card
                        variant="vignette"
                        image={vignette.imageUrl || "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"}
                        title={vignette.title}
                        hook={vignette.description}
                        onClick={() => handleVignetteClick(vignette.id)}
                        className="hover-tilt motion-safe h-full"
                      >
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <span className="font-subhead text-accent-gold">{vignette.year}</span>
                          <span className="font-body text-muted-foreground">{vignette.theme_tag}</span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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