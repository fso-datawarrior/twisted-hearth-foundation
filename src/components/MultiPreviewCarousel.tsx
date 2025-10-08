import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "@/components/ImageCarousel";
import { PREVIEW_CATEGORIES, getPreviewImagesByCategory, type PreviewCategory } from "@/config/previewImages";
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/lib/photo-api";

interface MultiPreviewCarouselProps {
  defaultCategory?: string;
  showCategoryTabs?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  previewPhotos?: Photo[];
}

const MultiPreviewCarousel = ({ 
  defaultCategory = 'vignettes',
  showCategoryTabs = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = "",
  previewPhotos = []
}: MultiPreviewCarouselProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Generate image URLs from previewPhotos
  useEffect(() => {
    const generateUrls = async () => {
      if (!previewPhotos || previewPhotos.length === 0) {
        // Fall back to static images
        setImageUrls(getPreviewImagesByCategory(activeCategory));
        return;
      }

      const urls: string[] = [];
      for (const photo of previewPhotos) {
        if (photo.user_id === 'system') {
          // Static image - use path directly
          urls.push(photo.storage_path);
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
      setImageUrls(urls);
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
                  {category.images.length}
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
          <ImageCarousel
            images={currentImages}
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            showControls={true}
            showIndicators={true}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No images available for {currentCategoryData?.title || 'this category'}.
          </p>
        </div>
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

export default MultiPreviewCarousel;