import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Photo } from "@/lib/photo-api";
import { PhotoCard } from "./PhotoCard";

interface PhotoCarouselProps {
  photos: Photo[];
  onLike?: (photoId: string) => void;
  getPhotoUrl?: (storagePath: string) => Promise<string>;
  showStatus?: boolean;
  showEditControls?: boolean;
  showUserActions?: boolean;
  onUpdate?: (photoId: string, updates: any) => void;
  onDelete?: (photoId: string, storagePath: string) => void;
  onFavorite?: (photoId: string) => void;
  onEmojiReaction?: (photoId: string, emoji: string) => void;
  photosPerView?: number;
  className?: string;
}

export const PhotoCarousel = ({
  photos,
  onLike,
  getPhotoUrl,
  showStatus,
  showEditControls,
  showUserActions,
  onUpdate,
  onDelete,
  onFavorite,
  onEmojiReaction,
  photosPerView = 4,
  className
}: PhotoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const maxIndex = Math.max(0, photos.length - photosPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (photos.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / photosPerView)}%)` 
          }}
        >
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / photosPerView}% - ${(photosPerView - 1) * 16 / photosPerView}px)` }}
            >
              <PhotoCard
                photo={photo}
                onLike={onLike}
              getPhotoUrl={getPhotoUrl}
              showStatus={showStatus}
              showEditControls={showEditControls}
              showUserActions={showUserActions}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onEmojiReaction={onEmojiReaction}
            />
            </div>
          ))}
        </div>
      </div>

      {photos.length > photosPerView && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10 disabled:opacity-30"
            aria-label="Previous photos"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10 disabled:opacity-30"
            aria-label="Next photos"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentIndex === index 
                    ? "bg-accent-gold" 
                    : "bg-accent-purple/30 hover:bg-accent-purple/60"
                )}
                aria-label={`Go to photo group ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
