import { useLanguage } from '@/hooks/useLanguage';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';

import heroMen from '@/assets/hero-men-trainers.jpg';
import heroWomen from '@/assets/hero-women-trainers.jpg';
import heroBoys from '@/assets/hero-boys-trainers.jpg';
import heroGirls from '@/assets/hero-girls-trainers.jpg';

const slides = [
  {
    image: heroMen,
    titleEn: "Men's Trainers",
    titleSo: "Kabaha Ragga",
    subtitleEn: "Step up your style with premium trainers",
    subtitleSo: "Kabo cusub oo tayada sare leh"
  },
  {
    image: heroWomen,
    titleEn: "Women's Trainers",
    titleSo: "Kabaha Dumarka",
    subtitleEn: "Elegance meets comfort",
    subtitleSo: "Qurux iyo raaxo isku dhafan"
  },
  {
    image: heroBoys,
    titleEn: "Boys' Trainers",
    titleSo: "Kabaha Wiilasha",
    subtitleEn: "Built for play, styled for cool",
    subtitleSo: "Ciyaarta iyo qaabka"
  },
  {
    image: heroGirls,
    titleEn: "Girls' Trainers",
    titleSo: "Kabaha Gabdhaha",
    subtitleEn: "Fun colors, comfy fit",
    subtitleSo: "Midab qurux badan, raaxo weyn"
  }
];

export function HeroSection() {
  const { language } = useLanguage();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="container py-6">
      <div className="relative rounded-2xl overflow-hidden bg-muted">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="h-full"
        >
          <CarouselContent className="-ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="pl-0">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px] md:min-h-[400px]">
                  {/* Text Content - Left Side */}
                  <div className="flex flex-col justify-center p-8 md:p-12 order-2 md:order-1">
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
                      {language === 'so' ? slide.titleSo : slide.titleEn}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-md mb-6 animate-fade-in font-body" style={{ animationDelay: '100ms' }}>
                      {language === 'so' ? slide.subtitleSo : slide.subtitleEn}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <span className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        {language === 'so' ? 'Gaadiid Bilaash' : 'Free Delivery'}
                      </span>
                      <span className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {language === 'so' ? 'EVC Plus' : 'EVC Plus Payment'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Image - Right Side */}
                  <div className="relative h-[250px] md:h-full order-1 md:order-2">
                    <img 
                      src={slide.image} 
                      alt={language === 'so' ? slide.titleSo : slide.titleEn}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-transparent to-transparent md:block hidden" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <CarouselPrevious className="left-4 bg-background/80 border-none hover:bg-background" />
          <CarouselNext className="right-4 bg-background/80 border-none hover:bg-background" />
          
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  current === index 
                    ? 'bg-primary w-8' 
                    : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
}
