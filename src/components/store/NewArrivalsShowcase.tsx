import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '@/types/database';
import { DepartmentKey } from '@/lib/departments';
import { shouldShowNewArrivals } from '@/lib/storefront';
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
  const showcaseItems = useMemo<ShowcaseItem[]>(() => [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter(product => product.stock > 0 && product.image_url)
    .slice(0, 8)
    .map(product => ({
      image: product.image_url!,
      name: product.name,
      tag: product.category?.name || 'Collection',
      product,
    })), [products]);

  useEffect(() => setActiveIndex(0), [department]);

  if (!shouldShowNewArrivals(showcaseItems.length)) return null;

  const next = () => setActiveIndex(index => (index + 1) % showcaseItems.length);
  const prev = () => setActiveIndex(index => (index - 1 + showcaseItems.length) % showcaseItems.length);
  const maxOffset = Math.min(2, Math.floor((showcaseItems.length - 1) / 2));
  const visibleItems = Array.from({ length: maxOffset * 2 + 1 }, (_, index) => index - maxOffset).map(offset => {
    const itemIndex = (activeIndex + offset + showcaseItems.length) % showcaseItems.length;
    return { ...showcaseItems[itemIndex], offset, itemIndex };
  });

  return (
    <section className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="container relative">
        <div className="mb-4 text-center md:mb-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            New Collection
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Fresh Arrivals</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {department === 'cosmetics' ? 'Explore our latest beauty collection' : department ? 'Explore our latest premium footwear' : 'Explore the latest from all our collections'}
          </p>
        </div>

        <div className="relative flex h-[280px] items-center justify-center md:h-[320px]">
          {showcaseItems.length > 1 && (
            <>
              <Button variant="outline" size="icon" aria-label="Previous arrival" onClick={prev} className="absolute left-0 z-20 h-9 w-9 rounded-full bg-background/90 md:left-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Next arrival" onClick={next} className="absolute right-0 z-20 h-9 w-9 rounded-full bg-background/90 md:right-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <AnimatePresence initial={false} mode="popLayout">
            {visibleItems.map(item => {
              const isCenter = item.offset === 0;
              return (
                <motion.div
                  key={`${item.itemIndex}-${item.offset}`}
                  className="absolute"
                  initial={{ opacity: 0 }}
                  animate={{
                    x: item.offset * 170,
                    scale: isCenter ? 1 : 0.72,
                    opacity: isCenter ? 1 : Math.max(0.25, 0.55 - Math.abs(item.offset) * 0.15),
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  style={{ zIndex: 10 - Math.abs(item.offset) }}
                >
                  <div className={`relative overflow-hidden rounded-xl shadow-lg ${isCenter ? 'ring-1 ring-primary/25' : ''}`}>
                    <Button
                      variant="ghost"
                      aria-label={`View ${item.name}`}
                      onClick={() => onProductClick?.(item.product)}
                      className="block h-auto rounded-none p-0 hover:bg-transparent"
                    >
                      <img src={item.image} alt={item.name} loading="lazy" draggable={false} className="h-56 w-44 object-cover md:h-64 md:w-56" />
                    </Button>
                    {isCenter && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-background/90 p-3">
                        <span className="mb-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">{item.tag}</span>
                        <h3 className="line-clamp-1 font-display text-base font-bold text-foreground">{item.name}</h3>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {showcaseItems.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {showcaseItems.map((item, index) => (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Show arrival ${index + 1}`}
                key={item.product.id}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full p-0 transition-all ${index === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
