import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Product } from '@/types/database';
import { DepartmentKey } from '@/lib/departments';
import { Button } from '@/components/ui/button';

interface NewArrivalsShowcaseProps {
  onProductClick?: (product: Product) => void;
  products: Product[];
  department?: DepartmentKey;
}

interface ShowcaseItem {
  image: string;
  name: string;
  tag: string;
  product: Product;
}

export function NewArrivalsShowcase({ onProductClick, products, department }: NewArrivalsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
        const items: ShowcaseItem[] = [...products]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .filter(p => p.stock > 0)
          .flatMap((p) => p.image_url ? [{
            image: p.image_url,
            name: p.name,
            tag: p.category?.name || 'Collection',
            product: p,
          }] : []);
        setShowcaseItems(items);
        setActiveIndex(0);
  }, [products]);

  if (showcaseItems.length === 0) return null;

  const next = () => setActiveIndex((i) => (i + 1) % showcaseItems.length);
  const prev = () => setActiveIndex((i) => (i - 1 + showcaseItems.length) % showcaseItems.length);

  const getVisibleItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const idx = (activeIndex + i + showcaseItems.length) % showcaseItems.length;
      items.push({ ...showcaseItems[idx], offset: i, idx });
    }
    return items;
  };

  return (
    <section className="py-16 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            New Collection
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Fresh Arrivals
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {department === 'cosmetics' ? 'Explore our latest beauty collection' : department ? 'Explore our latest collection of premium footwear' : 'Explore the latest from all our collections'}
          </p>
        </motion.div>

        <div className="relative flex items-center justify-center h-[420px] md:h-[480px]">
          <Button variant="outline" size="icon" aria-label="Previous arrival"
            onClick={prev}
            className="absolute left-2 md:left-8 z-20 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next arrival"
            onClick={next}
            className="absolute right-2 md:right-8 z-20 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item) => {
              const isCenter = item.offset === 0;
              const scale = isCenter ? 1 : 0.75 - Math.abs(item.offset) * 0.08;
              const x = item.offset * (isCenter ? 0 : 220);
              const zIndex = 10 - Math.abs(item.offset);
              const opacity = isCenter ? 1 : 0.6 - Math.abs(item.offset) * 0.15;

              return (
                <motion.div
                  key={`${item.idx}-${item.offset}`}
                  className="absolute cursor-pointer"
                  animate={{
                    x,
                    scale,
                    zIndex,
                    opacity: Math.max(opacity, 0.2),
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ zIndex }}
                >
                  <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-shadow ${isCenter ? 'ring-2 ring-primary/30' : ''}`}>
                    <Button variant="ghost" aria-label={`View ${item.name}`} onClick={() => onProductClick?.(item.product)} className="block h-auto p-0 rounded-none hover:bg-transparent">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-56 h-72 md:w-72 md:h-96 object-cover"
                      draggable={false}
                    />
                    </Button>
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pointer-events-none absolute bottom-0 inset-x-0 bg-background/90 p-5"
                      >
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-2">
                          {item.tag}
                        </span>
                        <h3 className="text-foreground font-display text-xl font-bold">
                          {item.name}
                        </h3>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-center flex-wrap gap-1.5 mt-6">
          {showcaseItems.map((_, i) => (
            <Button variant="ghost" size="icon" aria-label={`Show arrival ${i + 1}`}
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 p-0 rounded-full transition-all ${
                i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
