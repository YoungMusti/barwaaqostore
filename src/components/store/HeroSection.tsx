import { useLanguage } from '@/hooks/useLanguage';
import heroImage from '@/assets/hero-shoes.jpg';

export function HeroSection() {
  const { language } = useLanguage();

  return (
    <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Background Image */}
      <img 
        src={heroImage} 
        alt="Premium footwear collection" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
      
      {/* Content */}
      <div className="container relative z-10 h-full flex flex-col justify-center">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in">
            {language === 'so' ? 'Kabo Cusub, Qaab Cusub' : 'New Shoes, New Style'}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-md mb-6 animate-fade-in font-body" style={{ animationDelay: '100ms' }}>
            {language === 'so' 
              ? 'Hel kabaha ugu wanaagsan qiimo jaban. Nala soo iibso maanta!'
              : 'Discover premium footwear at affordable prices. Shop with us today!'
            }
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
    </section>
  );
}
