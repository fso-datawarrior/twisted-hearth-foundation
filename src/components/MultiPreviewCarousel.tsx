import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "@/components/ImageCarousel";
import EmptyGalleryState from "@/components/gallery/EmptyGalleryState";
import { PhotoLightbox } from "@/components/gallery/PhotoLightbox";
import { PREVIEW_CATEGORIES, getPreviewImagesByCategory, type PreviewCategory } from "@/config/previewImages";
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/lib/photo-api";

interface MultiPreviewCarouselProps {
  defaultCategory?: string;
  activeCategory?: string; // Controlled category from parent
  showCategoryTabs?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  previewPhotos?: Photo[];
}

const MultiPreviewCarousel = ({ 
  defaultCategory = 'vignettes',
  activeCategory: controlledCategory,
  showCategoryTabs = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = "",
  previewPhotos = []
}: MultiPreviewCarouselProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync internal state with controlled prop
  useEffect(() => {
    if (controlledCategory !== undefined) {
      setActiveCategory(controlledCategory);
    }
  }, [controlledCategory]);
  
  // Generate image URLs from previewPhotos
  useEffect(() => {
    const generateUrls = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.info('[MultiPreviewCarousel] Generating URLs for category:', activeCategory);
        
        if (!previewPhotos || previewPhotos.length === 0) {
          // Fall back to static images
          const staticUrls = getPreviewImagesByCategory(activeCategory) || [];
          console.info('[MultiPreviewCarousel] Using static URLs:', staticUrls);
          setImageUrls(staticUrls);
          setCurrentIndex(0);
          setLoading(false);
          return;
        }

        // Generate URLs in parallel for better performance
        const urlPromises = previewPhotos.map(async (photo) => {
          if (photo.user_id === 'system') {
            // Static image - use path directly
            return photo.storage_path || null;
          } else {
            // Database image - generate signed URL
            try {
              const { data } = await supabase.storage
                .from('gallery')
                .createSignedUrl(photo.storage_path, 3600);
              return data?.signedUrl || null;
            } catch (error) {
              console.error('Error generating signed URL:', error);
              return null;
            }
          }
        });
        
        const urls = await Promise.all(urlPromises);
        const uniqueUrls = urls.filter(Boolean) as string[];
        
        console.info('[MultiPreviewCarousel] Final URLs:', uniqueUrls);
        setImageUrls(uniqueUrls);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error generating image URLs:', error);
        setError('Failed to load images');
        setImageUrls([]);
      } finally {
        setLoading(false);
      }
    };
    
    generateUrls();
  }, [previewPhotos, activeCategory]);
  
  const currentImages = imageUrls;
  const currentCategoryData = PREVIEW_CATEGORIES.find(cat => cat.id === activeCategory);

  // Convert image URLs to Photo objects for the lightbox
  const lightboxPhotos: Photo[] = currentImages.map((url, index) => ({
    id: `preview-${index}`,
    storage_path: url,
    filename: `preview-${index}`,
    caption: `Gallery preview ${index + 1}`,
    tags: activeCategory ? [activeCategory] : [],
    category: activeCategory as any,
    likes_count: 0,
    user_id: 'preview',
    is_approved: true,
    is_featured: false,
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (PREVIEW_CATEGORIES.length === 0) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="w-full max-w-[1500px] mx-auto px-2">
          <div className="relative w-full mx-auto aspect-[16/9] min-h-[200px] bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="w-full max-w-[1500px] mx-auto px-2">
          <div className="relative w-full mx-auto aspect-[16/9] bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-accent-gold hover:text-accent-gold/80 underline"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Tabs */}
      {showCategoryTabs && PREVIEW_CATEGORIES.length > 1 && (
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {PREVIEW_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`font-subhead text-sm ${
                  activeCategory === category.id 
                    ? "bg-accent-gold text-ink hover:bg-accent-gold/80" 
                    : "border-accent-purple text-accent-gold hover:bg-accent-purple/20"
                }`}
              >
                {category.title}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {previewPhotos?.length || category.images.length}
                </Badge>
              </Button>
            ))}
          </div>
          
          {/* Category Description */}
          {currentCategoryData && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {currentCategoryData.description}
            </p>
          )}
        </div>
      )}

      {/* Image Carousel */}
      {currentImages.length > 0 ? (
        <div className="w-full max-w-[1500px] mx-auto px-2">
          <ImageCarouselWrapper
            images={currentImages}
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            onIndexChange={setCurrentIndex}
            onImageClick={handleImageClick}
          />
          {/* Description Container - Fixed Height with Gold Border */}
          {previewPhotos.length > 0 && (
            <div className="mt-3 p-4 bg-bg-2/50 rounded-lg border-2 border-accent-gold/60 min-h-[100px] flex items-center justify-center max-w-[85%] mx-auto">
              <p className="font-subhead text-accent-gold text-2xl text-center leading-relaxed" style={{ textShadow: '0 0 8px hsla(var(--accent-gold), 0.4), 1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                {previewPhotos[currentIndex]?.caption || ''}
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyGalleryState 
          categoryName={currentCategoryData?.title || 'this category'}
          message={`No memories captured in ${currentCategoryData?.title || 'this category'} yet`}
        />
      )}

      {/* Image Count */}
      {currentImages.length > 0 && (
        <div className="text-center">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {currentImages.length} {currentImages.length === 1 ? 'image' : 'images'}
          </Badge>
        </div>
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

// Wrapper component to sync carousel index with parent
const ImageCarouselWrapper = ({ 
  images, 
  autoPlay, 
  autoPlayInterval,
  onIndexChange,
  onImageClick
}: { 
  images: string[]; 
  autoPlay: boolean; 
  autoPlayInterval: number;
  onIndexChange: (index: number) => void;
  onImageClick?: (index: number) => void;
}) => {
  return (
    <ImageCarousel
      images={images}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
      showControls={true}
      showIndicators={true}
      onIndexChange={onIndexChange}
      onImageClick={onImageClick}
    />
  );
};

export default MultiPreviewCarousel;