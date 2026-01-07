import { Product } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-secondary/50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Sale badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
              {t('sale')}
            </span>
          </div>
        )}
        
        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              isInStock
                ? isLowStock
                  ? "bg-warning text-warning-foreground"
                  : "bg-success text-success-foreground"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            {isInStock ? (isLowStock ? `${product.stock} ${t('unitsLeft')}` : t('inStock')) : t('outOfStock')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-body">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              ${displayPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button
            onClick={() => addItem(product)}
            disabled={!isInStock}
            size="sm"
            className={cn(
              "rounded-full gap-2",
              isInStock && "bg-primary hover:bg-accent"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t('addToCart')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
