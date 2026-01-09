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
    <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
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
        <CarouselContent className="h-full -ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              <div className="relative h-full">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={language === 'so' ? slide.titleSo : slide.titleEn}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                
                {/* Content */}
                <div className="container relative z-10 h-full flex flex-col justify-center">
                  <div className="max-w-xl">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in">
                      {language === 'so' ? slide.titleSo : slide.titleEn}
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-md mb-6 animate-fade-in font-body" style={{ animationDelay: '100ms' }}>
                      {language === 'so' ? slide.subtitleSo : slide.subtitleEn}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <span className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        {language === 'so' ? 'Gaadiid Bilaash' : 'Free Delivery'}
                      </span>
                      <span className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {language === 'so' ? 'EVC Plus' : 'EVC Plus Payment'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 bg-background/60 backdrop-blur-sm border-none hover:bg-background/80" />
        <CarouselNext className="right-4 bg-background/60 backdrop-blur-sm border-none hover:bg-background/80" />
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                current === index 
                  ? 'bg-primary w-8' 
                  : 'bg-background/60 hover:bg-background/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
