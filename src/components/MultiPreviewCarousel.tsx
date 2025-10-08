import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "@/components/ImageCarousel";
import EmptyGalleryState from "@/components/gallery/EmptyGalleryState";
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

  // Sync internal state with controlled prop
  useEffect(() => {
    if (controlledCategory !== undefined) {
      setActiveCategory(controlledCategory);
    }
  }, [controlledCategory]);
  
  // Generate image URLs from previewPhotos
  useEffect(() => {
    const generateUrls = async () => {
      console.info('[MultiPreviewCarousel] Generating URLs for category:', activeCategory);
      if (!previewPhotos || previewPhotos.length === 0) {
        // Fall back to static images
        const staticUrls = getPreviewImagesByCategory(activeCategory) || [];
        console.info('[MultiPreviewCarousel] Using static URLs:', staticUrls);
        setImageUrls(staticUrls);
        setCurrentIndex(0);
        return;
      }

      const urls: string[] = [];
      for (const photo of previewPhotos) {
        if (photo.user_id === 'system') {
          // Static image - use path directly
          if (photo.storage_path) {
            urls.push(photo.storage_path);
          }
        } else {
          // Database image - generate signed URL
          try {
            const { data } = await supabase.storage
              .from('gallery')
              .createSignedUrl(photo.storage_path, 3600);
            if (data?.signedUrl) {
              urls.push(data.signedUrl);
            }
          } catch (error) {
            console.error('Error generating signed URL:', error);
          }
        }
      }
      const uniqueUrls = urls.filter(Boolean);
      console.info('[MultiPreviewCarousel] Final URLs:', uniqueUrls);
      setImageUrls(uniqueUrls);
      setCurrentIndex(0);
    };
    
    generateUrls();
  }, [previewPhotos, activeCategory]);
  
  const currentImages = imageUrls;
  const currentCategoryData = PREVIEW_CATEGORIES.find(cat => cat.id === activeCategory);

  if (PREVIEW_CATEGORIES.length === 0) {
    return null;
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
        <div className="max-w-2xl mx-auto">
          <ImageCarouselWrapper
            images={currentImages}
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            onIndexChange={setCurrentIndex}
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
    </div>
  );
};

// Wrapper component to sync carousel index with parent
const ImageCarouselWrapper = ({ 
  images, 
  autoPlay, 
  autoPlayInterval,
  onIndexChange 
}: { 
  images: string[]; 
  autoPlay: boolean; 
  autoPlayInterval: number;
  onIndexChange: (index: number) => void;
}) => {
  return (
    <ImageCarousel
      images={images}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
      showControls={true}
      showIndicators={true}
      onIndexChange={onIndexChange}
    />
  );
};

export default MultiPreviewCarousel;