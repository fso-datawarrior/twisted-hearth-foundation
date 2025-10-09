import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  onIndexChange?: (index: number) => void;
  onImageClick?: (index: number) => void;
}

const ImageCarousel = ({ 
  images, 
  autoPlay = true, 
  autoPlayInterval = 4000,
  showControls = true,
  showIndicators = true,
  className = "",
  onIndexChange,
  onImageClick
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered || images.length <= 1) {
    return;
  }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative group overscroll-contain ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div 
        className={`relative w-full mx-auto aspect-[16/9] bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors ${onImageClick ? 'cursor-pointer' : ''}`}
        onClick={() => onImageClick?.(currentIndex)}
      >
        <img 
          src={images[currentIndex]}
          srcSet={`
            ${images[currentIndex]}?w=480 480w,
            ${images[currentIndex]}?w=800 800w,
            ${images[currentIndex]}?w=1200 1200w
          `}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
          alt={`Gallery preview ${currentIndex + 1}`}
          width="800"
          height="800"
          className="w-full h-full object-contain transition-all motion-safe"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const badSrc = (e.currentTarget as HTMLImageElement).src;
            console.error('Image failed to load, using placeholder:', badSrc);
            (e.currentTarget as HTMLImageElement).src = '/img/no-photos-placeholder.jpg';
          }}
        />
        
        {/* Overlay for controls */}
        <div className="absolute inset-0 bg-black/20 transition-opacity motion-safe [@media(hover:none)]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100" />
        
        
        {/* Play/Pause Button */}
        {showControls && images.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 min-w-[44px] min-h-[44px] transition-opacity motion-safe bg-black/50 text-white [@media(hover:none)]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:hover:bg-black/70 [@media(hover:hover)]:group-hover:opacity-100"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}
      </div>
      
      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors motion-safe ${
                index === currentIndex 
                  ? "bg-accent-gold" 
                  : "bg-accent-gold/30 hover:bg-accent-gold/50"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded transition-opacity motion-safe [@media(hover:none)]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* Navigation Controls - Outside Image Container */}
      {showControls && images.length > 1 && (
        <>
          <Button
            variant="outline"
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 h-24 w-10 bg-bg-2 border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10 disabled:opacity-30"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 h-24 w-10 bg-bg-2 border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10 disabled:opacity-30"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
