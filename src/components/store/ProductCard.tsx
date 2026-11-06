import { Product } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from './CurrencyToggle';
import { Package, Heart, AlertTriangle, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductBadge, getProductBadgeType } from './ProductBadges';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

export function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const inWishlist = isInWishlist(product.id);
  const badgeType = getProductBadgeType(product);

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.025 }}
      whileHover={{ y: -2 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/60">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {isOnSale && (
          <div className="absolute left-2 top-2 flex gap-1">
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">{t('sale')}</span>
            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
              -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
            </span>
          </div>
        )}

        {!isOnSale && badgeType && (
          <div className="absolute left-2 top-2 scale-90 origin-top-left">
            <ProductBadge type={badgeType} />
          </div>
        )}

        <button
          type="button"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(event) => { event.stopPropagation(); toggleWishlist(product); }}
          className={cn(
            'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            inWishlist ? 'bg-destructive text-destructive-foreground' : 'bg-background/85 text-foreground hover:bg-background'
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', inWishlist && 'fill-current')} />
        </button>

        {isInStock && (
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => { event.stopPropagation(); addItem(product); }}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 md:opacity-0 md:group-hover:opacity-100"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        )}

        {isLowStock && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
            <AlertTriangle className="h-2.5 w-2.5" />
            {product.stock} {t('unitsLeft')}
          </span>
        )}

        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/65">
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground sm:text-base">{product.name}</h3>
        {product.description && (
          <p className="mt-1 hidden line-clamp-1 text-xs text-muted-foreground sm:block">{product.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-foreground sm:text-lg">{formatPrice(displayPrice)}</span>
          {isOnSale && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>}
        </div>
      </div>
    </motion.article>
  );
}
