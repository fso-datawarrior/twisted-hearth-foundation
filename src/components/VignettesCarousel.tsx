import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/Card";

interface VignetteData {
  id: string;
  title: string;
  description: string;
  year: string;
  theme_tag: string;
  imageUrl: string;
}

interface VignettesCarouselProps {
  vignettes: VignetteData[];
  onVignetteClick: (id: string) => void;
}

export function VignettesCarousel({ vignettes, onVignetteClick }: VignettesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'center',
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({ 
        delay: 5000, 
        stopOnInteraction: true, 
        stopOnMouseEnter: true 
      }),
      ClassNames()
    ]
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesInView, setSlidesInView] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const updateSlidesInView = useCallback(() => {
    if (!emblaApi) return;
    setSlidesInView((slidesInView) => {
      if (slidesInView.length === emblaApi.slideNodes().length) {
        emblaApi.off('slidesInView', updateSlidesInView);
      }
      const inView = emblaApi.slidesInView();
      return inView.length === slidesInView.length &&
        inView.every((index, i) => index === slidesInView[i])
        ? slidesInView
        : inView;
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    updateSlidesInView();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('slidesInView', updateSlidesInView);
    emblaApi.on('reInit', updateSlidesInView);
  }, [emblaApi, onSelect, updateSlidesInView]);

  return (
    <div className="embla relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {vignettes.map((vignette, index) => (
            <div 
              key={vignette.id} 
              className={`embla__slide ${
                slidesInView.includes(index) ? 'embla__slide--in-view' : ''
              }`}
            >
              <div className="embla__slide__inner">
                <Card
                  variant="vignette"
                  image={vignette.imageUrl || "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"}
                  title={vignette.title}
                  hook={vignette.description}
                  onClick={() => onVignetteClick(vignette.id)}
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

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="embla__button embla__button--prev"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="embla__button embla__button--next"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dot Pagination */}
      <div className="embla__dots">
        {vignettes.map((_, index) => (
          <button
            key={index}
            className={`embla__dot ${
              index === selectedIndex ? 'embla__dot--selected' : ''
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
