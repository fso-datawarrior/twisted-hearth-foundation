import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface CarouselProps {
  items: CarouselItem[];
  visible?: number;
  auto?: boolean;
  interval?: number;
  className?: string;
}

const Carousel = ({ 
  items, 
  visible = 1, 
  auto = false, 
  interval = 5000,
  className 
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(auto);

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => 
        prev + visible >= items.length ? 0 : prev + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, items.length, visible]);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + visible >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, items.length - visible) : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Carousel */}
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-300 ease-in-out motion-safe"
          style={{ 
            transform: `translateX(-${(currentIndex * 100) / visible}%)` 
          }}
        >
          {items.map((item) => (
            <div 
              key={item.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / visible}%` }}
            >
              <div className="bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe">
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform motion-safe"
                  />
                </div>
                <div className="p-4 bg-black/95 backdrop-blur-sm">
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil(items.length / visible) }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-colors motion-safe focus-visible",
              currentIndex === index 
                ? "bg-accent-gold" 
                : "bg-accent-purple/30 hover:bg-accent-purple/60"
            )}
            aria-label={`Go to slide group ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Control */}
      {auto && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-muted-foreground hover:text-accent-gold"
          >
            {isPlaying ? "Pause" : "Play"} Slideshow
          </Button>
        </div>
      )}
    </div>
  );
};

export default Carousel;