import { useLanguage } from '@/hooks/useLanguage';

export function HeroSection() {
  const { language } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary/50 py-16 sm:py-24">
      <div className="container text-center relative z-10">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in">
          {language === 'so' ? 'Kabo Cusub, Qaab Cusub' : 'New Shoes, New Style'}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in font-body" style={{ animationDelay: '100ms' }}>
          {language === 'so' 
            ? 'Hel kabaha ugu wanaagsan qiimo jaban. Nala soo iibso maanta!'
            : 'Discover premium footwear at affordable prices. Shop with us today!'
          }
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            {language === 'so' ? 'Gaadiid Bilaash' : 'Free Delivery'}
          </span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {language === 'so' ? 'EVC Plus' : 'EVC Plus Payment'}
          </span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
}
