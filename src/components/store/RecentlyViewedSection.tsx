import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useLanguage } from '@/hooks/useLanguage';
import { Product } from '@/types/database';

interface RecentlyViewedSectionProps {
  onProductClick: (product: Product) => void;
}

export function RecentlyViewedSection({ onProductClick }: RecentlyViewedSectionProps) {
  const { items } = useRecentlyViewed();
  const { language } = useLanguage();

  if (items.length === 0) return null;

  return (
    <section className="container py-8 border-t border-border">
      <h2 className="font-display text-xl font-bold mb-4">
        {language === 'so' ? 'Dhawaan La Eegay' : 'Recently Viewed'}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="flex-shrink-0 w-32 group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary/50 mb-2">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
            </div>
            <p className="text-sm font-medium truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              ${product.is_on_sale && product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
