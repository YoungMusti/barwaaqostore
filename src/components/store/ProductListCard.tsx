import { Product } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from './CurrencyToggle';
import { Package, Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from './ProductReviews';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ProductListCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductListCard({ product, onClick }: ProductListCardProps) {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const isInStock = product.stock > 0;
  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const inWishlist = isInWishlist(product.id);
  const discountPercent = isOnSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-secondary/50 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        )}
        <StarRating rating={4} size="sm" />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(displayPrice)}</span>
          {isOnSale && <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 justify-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={cn("w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
            inWishlist ? "bg-destructive text-destructive-foreground border-destructive" : "border-border hover:border-primary"
          )}
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </motion.button>
        {isInStock && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
