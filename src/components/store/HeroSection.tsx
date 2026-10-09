import { useLanguage } from '@/hooks/useLanguage';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useEffect, useState, useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FloatingParticles } from './FloatingParticles';
import { GradientText } from './GradientText';
import { Product, Category } from '@/types/database';

interface HeroSectionProps {
  onCategorySelect?: (categoryName: string) => void;
  products: Product[];
  categories: Category[];
}

interface HeroSlide {
  images: string[];
  titleEn: string;
  titleSo: string;
  subtitleEn: string;
  subtitleSo: string;
  categorySearch: string;
}

const categoryMeta: Record<string, { titleEn: string; titleSo: string; subtitleEn: string; subtitleSo: string }> = {
  men: { titleEn: "Men's Trainers", titleSo: "Kabaha Ragga", subtitleEn: "Step up your style with premium trainers", subtitleSo: "Kabo cusub oo tayada sare leh" },
  women: { titleEn: "Women's Trainers", titleSo: "Kabaha Dumarka", subtitleEn: "Elegance meets comfort", subtitleSo: "Qurux iyo raaxo isku dhafan" },
  boys: { titleEn: "Boys' Trainers", titleSo: "Kabaha Wiilasha", subtitleEn: "Built for play, styled for cool", subtitleSo: "Ciyaarta iyo qaabka" },
  girls: { titleEn: "Girls' Trainers", titleSo: "Kabaha Gabdhaha", subtitleEn: "Fun colors, comfy fit", subtitleSo: "Midab qurux badan, raaxo weyn" },
};

export function HeroSection({ onCategorySelect, products, categories }: HeroSectionProps) {
  const { language } = useLanguage();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<number, number>>({});
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  // Fetch enabled categories with in-stock products
  useEffect(() => {
      const heroSlides: HeroSlide[] = [];

      for (const cat of categories) {
        const catKey = cat.name.toLowerCase().replace("'s", '').replace(' shoes', '').trim();
        
        // Get in-stock products for this category with images
        const images = products.filter(p => p.category_id === cat.id && p.stock > 0)
          .flatMap(p => p.image_url ? [p.image_url] : []).slice(0, 6);
        if (images.length === 0) continue;

        const meta = categoryMeta[catKey] || {
          titleEn: cat.name,
          titleSo: cat.name_somali,
          subtitleEn: 'Discover the latest collection',
          subtitleSo: 'Soo hel ururinta cusub',
        };

        heroSlides.push({
          images,
          categorySearch: catKey,
          ...meta,
        });
      }

      setSlides(heroSlides);
      setActiveImageIndex({});
  }, [products, categories]);

  // Rotate gallery images for each slide
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setActiveImageIndex(prev => {
        const next = { ...prev };
        slides.forEach((slide, i) => {
          if (slide.images.length > 1) {
            next[i] = ((prev[i] || 0) + 1) % slide.images.length;
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (slides.length === 0) return null;

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
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="h-full"
        >
          <CarouselContent className="-ml-0">
            {slides.map((slide, index) => {
              const currentImg = activeImageIndex[index] || 0;
              return (
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
                        
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                          <GradientText>
                            {language === 'so' ? slide.titleSo : slide.titleEn}
                          </GradientText>
                        </h2>
                      </motion.div>
                      
                      <motion.p 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: current === index ? 1 : 0, x: current === index ? 0 : -30 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-base sm:text-lg text-muted-foreground max-w-md mb-6 font-body"
                      >
                        {language === 'so' ? slide.subtitleSo : slide.subtitleEn}
                      </motion.p>
                      
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
                    
                    {/* Image Gallery - Right Side */}
                    <motion.div 
                      className="relative h-[250px] md:h-full order-1 md:order-2 overflow-hidden"
                      style={{ y: parallaxY }}
                    >
                      {slide.images.map((img, imgIdx) => (
                        <motion.img 
                          key={img}
                          src={img} 
                          alt={language === 'so' ? slide.titleSo : slide.titleEn}
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: currentImg === imgIdx ? 1 : 0,
                            scale: currentImg === imgIdx ? 1 : 1.1,
                          }}
                          transition={{ duration: 0.8 }}
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-r from-muted/60 via-muted/20 to-transparent md:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-muted/40 via-transparent to-transparent md:hidden" />
                      
                      {/* Image dots */}
                      {slide.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex gap-1 z-10">
                          {slide.images.map((_, imgIdx) => (
                            <span
                              key={imgIdx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                currentImg === imgIdx ? 'bg-primary w-4' : 'bg-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <CarouselPrevious className="left-4 bg-background/80 border-none hover:bg-background backdrop-blur-sm" />
          <CarouselNext className="right-4 bg-background/80 border-none hover:bg-background backdrop-blur-sm" />
          
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
