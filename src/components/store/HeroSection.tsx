import { useLanguage } from '@/hooks/useLanguage';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useEffect, useState, useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FloatingParticles } from './FloatingParticles';
import { GradientText } from './GradientText';

import heroMen from '@/assets/hero-men-trainers.jpg';
import heroWomen from '@/assets/hero-women-trainers.jpg';
import heroBoys from '@/assets/hero-boys-trainers.jpg';
import heroGirls from '@/assets/hero-girls-trainers.jpg';

interface HeroSectionProps {
  onCategorySelect?: (categoryName: string) => void;
}

const slides = [
  {
    image: heroMen,
    titleEn: "Men's Trainers",
    titleSo: "Kabaha Ragga",
    subtitleEn: "Step up your style with premium trainers",
    subtitleSo: "Kabo cusub oo tayada sare leh",
    categorySearch: "men"
  },
  {
    image: heroWomen,
    titleEn: "Women's Trainers",
    titleSo: "Kabaha Dumarka",
    subtitleEn: "Elegance meets comfort",
    subtitleSo: "Qurux iyo raaxo isku dhafan",
    categorySearch: "women"
  },
  {
    image: heroBoys,
    titleEn: "Boys' Trainers",
    titleSo: "Kabaha Wiilasha",
    subtitleEn: "Built for play, styled for cool",
    subtitleSo: "Ciyaarta iyo qaabka",
    categorySearch: "boys"
  },
  {
    image: heroGirls,
    titleEn: "Girls' Trainers",
    titleSo: "Kabaha Gabdhaha",
    subtitleEn: "Fun colors, comfy fit",
    subtitleSo: "Midab qurux badan, raaxo weyn",
    categorySearch: "girls"
  }
];

export function HeroSection({ onCategorySelect }: HeroSectionProps) {
  const { language } = useLanguage();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <motion.section 
      ref={sectionRef} 
      className="container py-6 relative"
      style={{ opacity }}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(220 20% 96%) 50%, hsl(var(--secondary)) 100%)'
        }}
      >
        <FloatingParticles />
        
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
                  <div className="flex flex-col justify-center p-8 md:p-12 order-2 md:order-1 relative z-10">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: current === index ? 1 : 0, x: current === index ? 0 : -30 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {language === 'so' ? 'Cusub' : 'New Collection'}
                        </span>
                      </div>
                      
                      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                        <GradientText>
                          {language === 'so' ? slide.titleSo : slide.titleEn}
                        </GradientText>
                      </h1>
                    </motion.div>
                    
                    <motion.p 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: current === index ? 1 : 0, x: current === index ? 0 : -30 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-base sm:text-lg text-muted-foreground max-w-md mb-6 font-body"
                    >
                      {language === 'so' ? slide.subtitleSo : slide.subtitleEn}
                    </motion.p>
                    
                    {/* Shop Now CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: current === index ? 1 : 0, y: current === index ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Button 
                        onClick={() => onCategorySelect?.(slide.categorySearch)}
                        className="mb-6 gap-2 rounded-full group"
                        size="lg"
                      >
                        {language === 'so' ? 'Soo Iibso Hadda' : 'Shop Now'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: current === index ? 1 : 0, y: current === index ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
                    >
                      <span className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        {language === 'so' ? 'Gaadiid Bilaash' : 'Free Delivery'}
                      </span>
                      <span className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        {language === 'so' ? 'EVC Plus' : 'EVC Plus Payment'}
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Image - Right Side with parallax */}
                  <motion.div 
                    className="relative h-[250px] md:h-full order-1 md:order-2 overflow-hidden"
                    style={{ y: parallaxY }}
                  >
                    <motion.img 
                      src={slide.image} 
                      alt={language === 'so' ? slide.titleSo : slide.titleEn}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: current === index ? 1 : 1.1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-muted/60 via-muted/20 to-transparent md:block hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-muted/40 via-transparent to-transparent md:hidden" />
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <CarouselPrevious className="left-4 bg-background/80 border-none hover:bg-background backdrop-blur-sm" />
          <CarouselNext className="right-4 bg-background/80 border-none hover:bg-background backdrop-blur-sm" />
          
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => api?.scrollTo(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2.5 rounded-full transition-all ${
                  current === index 
                    ? 'bg-primary w-8' 
                    : 'bg-foreground/30 hover:bg-foreground/50 w-2.5'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </motion.section>
  );
}
