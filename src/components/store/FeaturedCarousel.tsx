import { Product } from '@/types/database';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { ProductCard } from './ProductCard';
import Autoplay from 'embla-carousel-autoplay';

interface FeaturedCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function FeaturedCarousel({ products, onProductClick }: FeaturedCarouselProps) {
  const { language } = useLanguage();

  // Get featured products (on sale or newest)
  const featuredProducts = products
    .filter(p => p.is_on_sale || p.stock > 0)
    .slice(0, 8);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {language === 'so' ? 'Alaabta Caanka ah' : 'Trending Now'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'so' ? 'Alaabta ugu iibka badan' : 'Our most popular items'}
            </p>
          </div>
        </div>
      </motion.div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featuredProducts.map((product, index) => (
            <CarouselItem 
              key={product.id} 
              className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  index={index}
                  onClick={() => onProductClick(product)}
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -translate-x-1/2" />
        <CarouselNext className="right-0 translate-x-1/2" />
      </Carousel>
    </section>
  );
}
