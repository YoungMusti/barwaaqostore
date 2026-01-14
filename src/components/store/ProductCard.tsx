import { Product } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { useWishlist } from '@/hooks/useWishlist';
import { Package, Heart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from './ProductReviews';

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

export function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const inWishlist = isInWishlist(product.id);

  // Mock rating (would come from database in production)
  const mockRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg animate-slide-up cursor-pointer"
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
        
        {/* Stock urgency indicator */}
        {isLowStock && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning text-warning-foreground">
              <AlertTriangle className="w-3 h-3" />
              {product.stock} {t('unitsLeft')}
            </span>
          </div>
        )}
        
        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            inWishlist 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-background/80 hover:bg-background text-foreground"
          )}
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </button>
        
        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
              {t('outOfStock')}
            </span>
          </div>
        )}
        
        {/* View details overlay */}
        {isInStock && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-4 py-2 rounded-full text-sm font-medium">
              View Details
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Star Rating */}
        <div className="mb-2">
          <StarRating rating={mockRating} size="sm" />
        </div>
        
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
        </div>
      </div>
    </div>
  );
}