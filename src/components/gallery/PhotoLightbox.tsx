import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { Photo } from "@/lib/photo-api";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (photoId: string) => void;
  getPhotoUrl?: (storagePath: string) => Promise<string>;
}

export const PhotoLightbox = ({ 
  photos, 
  currentIndex, 
  isOpen, 
  onClose, 
  onLike, 
  getPhotoUrl 
}: PhotoLightboxProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(currentIndex);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { trackInteraction } = useAnalytics();

  // Sync with prop changes
  useEffect(() => {
    setCurrentPhotoIndex(currentIndex);
  }, [currentIndex]);

  // Load current image URL and track view
  useEffect(() => {
    if (isOpen && photos[currentPhotoIndex]) {
      loadImageUrl(photos[currentPhotoIndex]);
      // Track photo view (trackInteraction is stable, excluded from deps to prevent infinite loop)
      trackInteraction('photo', photos[currentPhotoIndex].id, 'view');
    }
  }, [currentPhotoIndex, photos, getPhotoUrl, isOpen]);

  // Handle orientation changes for mobile rotation
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientationChange = () => {
      // CSS max-w-[98vw] max-h-[98vh] already handles responsive sizing
      // No need to force re-render - keeping this for future hooks if needed
    };
    
    // Only listen to orientationchange, NOT resize (to prevent infinite loop)
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isOpen]);

  const loadImageUrl = async (photo: Photo) => {
    setLoading(true);
    try {
      if (!getPhotoUrl) {
        setImageUrl(photo.storage_path);
      } else {
        const url = await getPhotoUrl(photo.storage_path);
        setImageUrl(url || null);
      }
    } catch (error) {
      console.error('Error loading photo URL:', error);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    if (photos.length === 0) return;
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : photos.length - 1
    );
  };

  const goToNext = () => {
    if (photos.length === 0) return;
    setCurrentPhotoIndex((prev) => 
      prev < photos.length - 1 ? prev + 1 : 0
    );
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext]);

  // Touch gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) goToNext();
    if (isRightSwipe && photos.length > 1) goToPrevious();
  };

  const currentPhoto = photos[currentPhotoIndex];

  if (!currentPhoto) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-[98vw] max-h-[98vh] bg-black/95 p-0"
      ariaLabel="Photo viewer"
    >
      <div 
        className="relative w-full h-full flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          aria-label="Close photo viewer"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={currentPhoto.caption || 'Gallery photo'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground text-center">
              <p>Photo unavailable</p>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm h-12 w-12"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm h-12 w-12"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Photo Info & Actions */}
        <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-accent-purple/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {currentPhoto.caption && (
                <p className="text-white text-sm md:text-base mb-2 break-words">
                  {currentPhoto.caption}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {currentPhotoIndex + 1} of {photos.length}
                </span>
                {currentPhoto.category && (
                  <span className="capitalize">
                    {currentPhoto.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              {onLike && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(currentPhoto.id)}
                  className="text-accent-gold hover:text-accent-gold/80 hover:bg-accent-gold/10"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {currentPhoto.likes_count || 0}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="flex justify-center py-3 bg-black/80 backdrop-blur-sm">
            <div className="flex gap-1 max-w-xs overflow-x-auto">
              {photos.slice(Math.max(0, currentPhotoIndex - 5), currentPhotoIndex + 6).map((_, index) => {
                const actualIndex = Math.max(0, currentPhotoIndex - 5) + index;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setCurrentPhotoIndex(actualIndex)}
                    className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                      actualIndex === currentPhotoIndex 
                        ? 'bg-accent-gold' 
                        : 'bg-accent-purple/30 hover:bg-accent-purple/60'
                    }`}
                    aria-label={`Go to photo ${actualIndex + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
